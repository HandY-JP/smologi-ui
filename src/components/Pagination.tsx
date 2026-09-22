'use client';

import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { LIST_PAGE_SIZE_OPTIONS } from '../lib/list-page-size';

// ページ送りボタンの見た目（最初へ／前へ／次へ／最後へで共通）。ピル内の控えめなゴーストボタン。
const PAGER_BUTTON =
  'h-8 rounded-full px-3 text-[12.5px] text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100';
// コンパクト版（StickyPagerBar の中）の ‹ › ボタン。丸い最小サイズで、件数テキストや
// 最初へ／最後へは出さない（件数はツールバー側に出るため）。
const PAGER_BUTTON_COMPACT =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[14px] text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100';

type Props = {
  total: number;
  page: number; // 1-indexed
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  /** 件数の数え方が「行」でないときの単位（納品プラン一覧＝件、など）。 */
  unitLabel?: string;
  /**
   * コンパクト表示（StickyPagerBar が子要素に自動で注入する）。件数テキストと
   * 最初へ／最後へを省き、‹ 現在/全 › と件数セレクトだけの最小限のピルにする。
   * 単独で使う（一覧に埋め込む簡易ページャなど）ときは指定しない＝従来のフル表示のまま。
   */
  compact?: boolean;
};

/**
 * ページャの表示に必要な計算だけを切り出した純粋関数（テスト用）。
 * page/total/pageSize から安全な現在ページ・全ページ数・表示範囲を導く。
 */
export function computePaginationView(total: number, page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);
  return { totalPages, safePage, start, end };
}

export function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  // 既定は一覧共通の選択肢（list-page-size.ts）。ここに数値を直書きすると ListFooter 経由の
  // 一覧とズレるので、独自の選択肢が要る画面（仕入先ポータル）だけが props で渡すこと。
  pageSizeOptions = LIST_PAGE_SIZE_OPTIONS,
  className = '',
  unitLabel = '件',
  compact = false,
}: Props) {
  const { totalPages, safePage, start, end } = computePaginationView(total, page, pageSize);

  if (compact) {
    return (
      <div className={`flex items-center gap-1 text-sm ${className}`}>
        {/* 総件数（他に件数表示のない一覧向け）。start-end は幅を抑えるため出さない。 */}
        <span className="whitespace-nowrap px-0.5 text-[12px] tabular-nums text-gray-500">
          {total.toLocaleString('ja-JP')}{unitLabel}
        </span>
        <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-gray-200/70" />
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="前のページ"
          className={PAGER_BUTTON_COMPACT}
        >
          ‹
        </button>
        <span className="px-0.5 font-semibold tabular-nums text-gray-800">{safePage} / {totalPages}</span>
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          aria-label="次のページ"
          className={PAGER_BUTTON_COMPACT}
        >
          ›
        </button>
        {onPageSizeChange && (
          <>
            <span aria-hidden="true" className="mx-1 h-4 w-px bg-gray-200/70" />
            <div className="relative flex items-center">
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                aria-label="1ページの件数"
                title="表示件数（次に開いたときも同じ件数で表示します）"
                className="appearance-none rounded-full bg-transparent py-1 pl-1 pr-3.5 text-[12.5px] text-gray-700 focus:outline-none"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}{unitLabel}</option>
                ))}
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute right-0 text-[9px] text-gray-400">⏷</span>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 text-sm ${className}`}>
      <div className="whitespace-nowrap text-[12px] text-gray-600">
        {total === 0 ? `0${unitLabel}` : `${total}${unitLabel}中 ${start}-${end}${unitLabel}を表示`}
      </div>
      {/* 狭い画面では折り返す（ボタンを隠すと端まで飛べなくなるため、数を減らさず折り返しで逃がす）。 */}
      <div className="flex flex-wrap items-center justify-end gap-1">
        {/* 「最初へ」「最後へ」は前後送りの外側に置く（ページ数が多い一覧を1クリックで端まで飛ばせるように）。 */}
        <button type="button" onClick={() => onPageChange(1)} disabled={safePage <= 1} className={PAGER_BUTTON}>
          最初へ
        </button>
        <button type="button" onClick={() => onPageChange(safePage - 1)} disabled={safePage <= 1} className={PAGER_BUTTON}>
          前へ
        </button>
        <span className="px-1 font-semibold tabular-nums text-gray-800">{safePage} / {totalPages}</span>
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className={PAGER_BUTTON}
        >
          次へ
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={safePage >= totalPages}
          className={PAGER_BUTTON}
        >
          最後へ
        </button>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="表示件数"
            title="表示件数（次に開いたときも同じ件数で表示します）"
            className="ml-1 h-8 rounded-full border border-gray-200/80 bg-white/70 px-2 text-[12.5px] text-gray-700"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}/ページ</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

/**
 * 一覧カードの下端に浮かせるページャ（全一覧で共通）。liquid-glass のピルを
 * ビューポート右下に固定表示する。
 *
 * カードの下端が画面内に入るまではビューポート下端に留まり、行がピルの下へ潜り込む。
 * カード内 sticky なので一覧が短いときは自然に普通のフッターとして収まる（分岐不要）。
 *
 * ★ 前提が2つある。どちらかを崩すと sticky は黙って効かなくなる:
 *   1. 祖先に `overflow: hidden` を作らないこと。角丸で中身を切りたい場合は `overflow-clip`
 *      を使う（見た目は同じで、スクロールコンテナを作らない）。
 *   2. スクロールコンテナ（ChromeMain）の下余白を padding で取らないこと。padding は
 *      sticky の基準矩形を縮めるのでバーが浮く。globals.css の
 *      `.app-main-bottom-space::after`（擬似要素のスペーサー）で取る。
 *
 * z の序列（smologi の実態）: 表ヘッダー z-20 ＜ 固定列 z-[25] ＜ このピル z-[26] ＜
 * トップバー（fixed）z-30 ＜ モーダル z-40 以上。
 *
 * 横スクロールする一覧（商品マスタ・出荷一覧など）でも、ListFooter は表の
 * `overflow-x-auto` コンテナの外（カード直下の兄弟）に置く決まりなので、sticky の
 * 基準は常にカード全体の幅になる。透明な行を `flex justify-end` で右寄せしている
 * （ピル側は `pointer-events-auto`）ため、位置調整の props は不要。
 *
 * 面の色は tone で切り替える（画面ごとに className で bg を渡す方式はやめた。ダーク/
 * reduced-transparency の配色は globals.css の `.app-sticky-glass[data-tone=...]`
 * 側に一本化してあり、className で Tailwind の bg-* を重ねると生成順次第でそちらが勝って
 * 配色が消えることがあったため）。className は「透明な行（sticky の基準）に足す
 * クラス」用に残してある（位置調整など）。
 */
export function StickyPagerBar({
  tone = 'default',
  className,
  title,
  children,
}: {
  /** ピル面の色。商品マスタの編集モードなど、既定と違う配色が要る画面だけ 'amber' を渡す。 */
  tone?: 'default' | 'amber';
  /** 透明な行（sticky の基準）に足すクラス。ピルの面色はここではなく tone で指定する。 */
  className?: string;
  /** ピルに乗せる補足説明（例: バリエーション表示中の注記）。 */
  title?: string;
  children: ReactNode;
}) {
  // 中身の <Pagination> はどの呼び出し元でも同じ props で組まれている（総件数・現在ページ等）ので、
  // ここで compact を注入してコンパクトな見た目に切り替える。呼び出し側は変更不要。
  const compactChildren = Children.map(children, (child) => (
    isValidElement(child)
      ? cloneElement(child as ReactElement<{ compact?: boolean }>, { compact: true })
      : child
  ));

  return (
    <div className={`pointer-events-none sticky bottom-3 z-[26] flex justify-end ${className ?? ''}`}>
      <div
        title={title}
        data-tone={tone}
        className="app-sticky-glass pointer-events-auto flex w-fit max-w-full items-center gap-2 rounded-full border px-3 py-1.5 shadow-[0_6px_18px_rgba(15,23,42,0.10)] backdrop-blur-[10px] backdrop-saturate-150"
      >
        {/* 補足文（バリエーション表示時の件数の注意など）は title 属性のみ。ピル内には出さない。 */}
        {compactChildren}
      </div>
    </div>
  );
}
