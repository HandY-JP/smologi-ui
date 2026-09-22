'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { derivedThumbnailUrl } from '../lib/product-thumbnail-url';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'header';

const SIZE_CLASSES: Record<Size, string> = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-12 h-12',
  header: 'w-14 h-14',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

/** SIZE_CLASSES と対になる実ピクセル（width/height 属性用。CLS を防ぐ）。 */
const SIZE_PIXELS: Record<Size, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  header: 56,
  lg: 64,
  xl: 80,
};

/**
 * 商品マスタの画像から小さなサムネを表示する共有コンポーネント。
 *
 * - `thumbnailUrl` があれば**それ**を出す（取込時に生成した 96px webp。240px は規約で導出し srcSet の 2x へ）
 * - 無ければ従来どおり `src`（原寸の外部画像）へフォールバックする
 *   → サムネ生成前・生成失敗時も表示は壊れない
 * - URL が空 / 読み込み失敗時はプレースホルダーアイコン
 * - 画面外の画像は loading="lazy" で遅延読み込み・固定 width/height で CLS を防ぐ
 * - 画像クリックで全画面のライトボックスに拡大表示（ESC・背景クリックで閉じる）。
 *   拡大は原寸（`src`）を出す — サムネを引き伸ばすとぼやけるため
 *
 * なぜサムネを持つのか（性能棚卸し #549 の改善 #1）:
 * 一覧が原寸の外部画像をそのまま出していて、100 行スクロールで 10〜100MB 落ちていた。
 */
export function ProductThumb({
  src,
  thumbnailUrl,
  alt,
  size = 'sm',
  enlargeOnClick = true,
  fill = false,
  boxClassName,
  boxPixels,
  placeholder = 'image',
}: {
  src: string | null | undefined;
  /** 生成済みサムネ（96px webp）のURL。空 / 未指定なら src にフォールバックする */
  thumbnailUrl?: string | null;
  alt: string;
  size?: Size;
  /** クリックで拡大表示する。false にすると静的なサムネだけ */
  enlargeOnClick?: boolean;
  /** 親要素の幅いっぱい（正方形）に広げる。一覧セルの余白を使って画像だけ大きく見せる用途。 */
  fill?: boolean;
  /**
   * size の代わりに使う寸法・配置クラス（`h-11 w-11` や grid の `row-span-2` など）。
   * 一覧セルごとに寸法が違う既存の生 <img> をここへ寄せるための逃がし口。
   */
  boxClassName?: string;
  /** boxClassName を使うときの実ピクセル（width/height 属性。CLS 防止用） */
  boxPixels?: number;
  /** プレースホルダーの絵柄。'box' は入荷・出荷の一覧で使っている箱アイコン。 */
  placeholder?: 'image' | 'box';
}) {
  const [failed, setFailed] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const [open, setOpen] = useState(false);
  // fill のときは固定サイズではなく親幅に合わせる（正方形）。boxClassName があればそれが最優先。
  const sizeCls = boxClassName ?? (fill ? 'w-full aspect-square' : SIZE_CLASSES[size]);

  // ライトボックス表示中は ESC で閉じる + 背景スクロールをロック。
  // モーダル（受注編集など）の中で開くこともあるため、ピッカー類と同じく capture で
  // 先に受けて stopImmediatePropagation で止める。止めないと ESC が下層のモーダルまで
  // 届き、拡大表示を閉じたつもりが編集中のフォームごと閉じてしまう。
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      setOpen(false);
    };
    window.addEventListener('keydown', onKey, true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!src || failed) {
    return (
      <div className={`${sizeCls} rounded bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-300`} aria-hidden>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={placeholder === 'box'
              ? 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4'
              : 'M4 5h16v14H4z M8 13l3-3 4 4 2-2 3 3'}
          />
        </svg>
      </div>
    );
  }

  // サムネが使えるならそれを出す。読めなかった（生成直後で CDN に伝播前・消えた等）ときは
  // 原寸へ落ちる。srcSet の 2x は 240px 版を規約で導出する（DB には 96px しか無い）。
  const generated = thumbFailed ? null : (thumbnailUrl ?? '').trim() || null;
  const retina = generated ? derivedThumbnailUrl(generated, 240) : null;
  const displaySrc = generated ?? src;
  const pixels = boxClassName ? boxPixels : (fill ? undefined : SIZE_PIXELS[size]);

  const thumb = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      srcSet={retina ? `${generated} 1x, ${retina} 2x` : undefined}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={pixels}
      height={pixels}
      // サムネが読めないときは原寸へ一段だけ落とす。原寸も駄目ならプレースホルダー。
      onError={() => { if (generated) setThumbFailed(true); else setFailed(true); }}
      // 商品画像は正方形でないことが多いので、切り抜かず全体を収める（object-contain）。
      // cover だと縦長/横長の画像が見切れてしまう。
      // 囲い（枠線）は付けず画像を直接見せる。ホバーのリングだけ拡大可能の合図として残す
      className={`${sizeCls} rounded object-contain flex-shrink-0 ${
        enlargeOnClick ? 'cursor-zoom-in hover:ring-2 hover:ring-blue-300 transition' : ''
      }`}
    />
  );

  if (!enlargeOnClick) return thumb;

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        aria-label={`${alt} を拡大表示`}
        className={`${fill ? 'flex w-full' : 'inline-flex'} p-0 border-0 bg-transparent`}
      >
        {thumb}
      </button>
      {open && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="商品画像プレビュー"
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            aria-label="閉じる"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-2xl bg-white"
          />
          {alt && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-[80vw] text-center text-xs text-white/80 bg-black/40 rounded-full px-3 py-1 truncate">
              {alt}
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
