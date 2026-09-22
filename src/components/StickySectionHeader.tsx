'use client';
// トップバー再設計（2026-09-14 追加決定）: 一覧の日付／グループの sticky 見出し行。
// 通常時は不透明のまま、実際に追従中（stuck＝画面上端に貼り付いている）のときだけ、
// 浮遊カプセルと同じガラス値（半透明白+blur 18px saturate 1.6、内側リム、上辺ハイライト、影）で
// 両端を丸めた細い帯（高さ32px・一覧の左右8px内側・角丸999px）に切り替える。
//
// stuck の判定は IntersectionObserver で行う: この見出しの直前に高さ0のセンチネルを置き、
// センチネルが画面外（sticky の top 位置より上）へ出た＝見出しが貼り付いた、とみなす
// （rootMargin を -topPx にして「top 位置を過ぎたら」判定に補正する定番の手法）。
//
// 2026-09-15 バグ修正①: コールバックを `!entry.isIntersecting` にすると、「まだ下にあって
// 一度もラインを跨いでいないセクション」と「上へ通り過ぎたセクション」のどちらも
// isIntersecting=false になり区別できない（画面の遥か下にある見出しが、マウント直後の
// 初回コールバックだけで stuck 扱いになってしまう＝グループが複数あるとき、まだスクロール
// していないのに一覧末尾の見出しがガラス化して見えるという実害があった）。
// 「上へ通り過ぎた」かどうかは boundingClientRect.top と topPx の大小関係で直接判定する
// （rootMargin はそのまま使い、交差のたびにコールバックを発火させる用途にのみ使う）。
//
// 2026-09-15 バグ修正②（実機確認で発覚・重要）: この見出しは一覧の表（table）の中に置かれ、
// その表は横スクロール用の `overflow-x-auto` な div に包まれ、さらにカード外枠が
// `overflow-clip`（角丸で切るため）。CSS の position:sticky は「visible 以外の overflow を持つ
// 最も近い祖先」を基準にする ため、overflow-x-auto の div 自体が（横方向しか要らなくても）
// sticky の基準にされてしまい、その div は縦方向には一切スクロールしない箱なので、
// 見出しは実質 position:static と同じ（追従しない）になっていた（実機で「グループ2つ目の見出しが
// 画面外へそのまま流れて消える」ことを検証して発見。inbounds の日付見出しも同様に壊れていた）。
// overflow-clip/overflow-auto な祖先が挟まる限り CSS sticky では解決できないため、stuck 中だけ
// JS で position:fixed に手動で切り替える（左端・幅はセンチネル行の実測値から計算する。
// センチネルは常に通常フローに残るので、いつでも正しい行の位置・幅が取れる）。
//
// 2026-09-15 バグ修正③（本番スクショ）: fixed 化した帯が一覧の行より**後ろ**に描画され、見出しの
// 文字が行に隠れて右端の「次のグループ ▸」だけが見える状態になっていた。原因は重ね順ではなく
// stacking context: 帯の親 `.sb-sticky-cell` は `position:relative; z-index:10` を持つため
// そこで新しい stacking context が作られ、中の `z-index:35` は「10 の中での 35」に閉じ込められる。
// 一覧の各行のセルも同じ z-index:10 を持ち、DOM 順で後ろにある行が帯より前に来てしまう。
// 対策: fixed 中の帯は createPortal で body 直下へ出す（祖先の stacking context・overflow の
// 影響を完全に断つ）。z-index は浮遊カプセル（40）より下・一覧より上の 38。
// body へ出すと `.sb-sticky-row.is-stuck .sb-sticky-inner` のような子孫セレクタが効かなくなるため、
// ガラスの見た目は `.sb-sticky-inner-fixed` 自身に付くスタイル（globals.css）で表現している。
//
// 併せて left/width は「一覧の外枠」（table を包む overflow-x-auto / overflow-clip な箱）の
// 実測値から出す。センチネル行（table 内）の実測だと、表が横スクロールしているときに
// 表の左端＝画面外の位置を拾ってしまい、帯の左端が一覧とずれる。
//
// 2026-09-15: 一覧に見出しが複数あると、スクロールの仕方次第で複数のセクションが同時に stuck
// （通り過ぎた）状態になり得る。position:fixed で描画する都合上、CSS の sticky のように
// 「後ろに隠れる」ができず、素直に両方ガラス表示するとテキストが同じ位置に重なってしまう。
// `visuallyActive=false` を渡すと、内部的には stuck でも通常表示（＝画面外へ素通りして見えなく
// なる）に留める。呼び出し側（useLastStuckSection）が「いちばん後ろの stuck セクションだけ」
// visuallyActive=true にすることで、常に高々1つだけがガラス表示される。
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** 帯の高さ（globals.css の .sb-sticky-inner と揃える）。 */
const BAND_HEIGHT_PX = 32;

/**
 * 帯の left/width の基準にする「一覧の外枠」を探す。
 * table を包む最も近い「overflow が visible でない箱」（横スクロール用の div ／角丸で切るカード）を
 * 使う。見つからなければ table 自身。表が横スクロールしていても画面上の一覧の幅が取れる。
 */
function findListBoundsElement(sentinel: HTMLElement): HTMLElement {
  const table = sentinel.closest('table') ?? sentinel;
  let node = table.parentElement;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    if (style.overflowX !== 'visible' || style.overflowY !== 'visible') return node;
    node = node.parentElement;
  }
  return table as HTMLElement;
}

export function StickySectionHeader({
  topPx,
  colSpan,
  children,
  className,
  id,
  trailing,
  visuallyActive = true,
  onStuckChange,
  dataTour,
}: {
  /** stuck 時に固定する top（px）。畳み時は浮遊カプセルの下（60px 目安）、通常時は上段バーの高さに合わせて呼び出し側が計算する。 */
  topPx: number;
  colSpan: number;
  children: ReactNode;
  className?: string;
  /** 見出しの実体（.sb-sticky-inner）に付ける id。「次のグループ／次の日付」ジャンプ導線の着地点として使う。 */
  id?: string;
  /** 見出し右端に置く要素（「次のグループ ▸」等）。無ければ何も出さない。 */
  trailing?: ReactNode;
  /** false のときは stuck でもガラス化しない（複数セクション同時 stuck の重なり防止。既定 true）。 */
  visuallyActive?: boolean;
  /** stuck 状態が変わるたびに呼ばれる（useLastStuckSection と組み合わせて使う）。 */
  onStuckChange?: (stuck: boolean) => void;
  /**
   * ガイドツアーのスポットライト対象にする data-tour 値。常に通常フローに残る td に付ける
   * （帯の div は stuck 中 body へ portal されるため、位置の基準に使えない）。
   * 同じ値を複数の見出しに付けないこと（querySelector は先頭1件しか見ない）。
   */
  dataTour?: string;
}) {
  const [stuck, setStuck] = useState(false);
  const [fixedBounds, setFixedBounds] = useState<{ left: number; width: number; inView: boolean } | null>(null);
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);
  const showGlass = stuck && visuallyActive;

  // 一覧の左右8px内側（仕様どおり）に合わせて、stuck 中の position:fixed の left/width を
  // 一覧の外枠の実測値から計算する。
  //
  // inView: 一覧そのものが帯の位置より上へ流れ去ったか（レビュー指摘・2026-09-15）。
  // fixed なので CSS sticky と違い「親の下端で止まる」挙動が無く、一覧の最後尾まで
  // スクロールして表がヘッダーの上まで抜けても、最後のセクションの帯だけが画面上端に
  // 残り続けていた。外枠の下端が帯の下端（top + 32px）より上に来たら帯を消す。
  const measureBounds = useCallback(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const rect = findListBoundsElement(el).getBoundingClientRect();
    setFixedBounds((prev) => {
      const next = {
        left: rect.left + 8,
        width: Math.max(0, rect.width - 16),
        inView: rect.bottom > Math.max(0, topPx) + BAND_HEIGHT_PX,
      };
      if (prev && prev.left === next.left && prev.width === next.width && prev.inView === next.inView) return prev;
      return next;
    });
  }, [topPx]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const nowStuck = entry.boundingClientRect.top < Math.max(0, topPx) + 1;
        setStuck(nowStuck);
        if (nowStuck) measureBounds();
      },
      { threshold: 0, rootMargin: `-${Math.max(0, topPx) + 1}px 0px 0px 0px` },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [topPx, measureBounds]);

  // stuck の実測値（=画面上の実際の位置に基づく判定。visuallyActive とは独立）を呼び出し側へ
  // 報告する。unmount 時は false を報告してから離脱する（useLastStuckSection 側の Set に
  // 消し忘れの key が残らないように）。onStuckChange は呼び出し側で key を bind するクロージャで
  // 毎レンダー新しい関数になりがちなので、依存には含めない（含めると report 発火が無限ループしうる）。
  useEffect(() => {
    onStuckChange?.(stuck);
    return () => onStuckChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stuck]);

  // ガラス表示中は、ウィンドウ幅の変化（サイドバー開閉・パネル押しのけ等）にも追従して
  // left/width を測り直す（一覧が横に伸び縮みしても見出しの帯がずれないように）。
  useEffect(() => {
    if (!showGlass) return;
    measureBounds();
    window.addEventListener('resize', measureBounds);
    // スクロール中も測り直す（一覧の下端が帯を追い越したら消すため。上の inView 参照）。
    // capture: 実スクローラーは #app-main（window はスクロールしない）なので window 直付けでは拾えない。
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => { raf = 0; measureBounds(); });
    };
    window.addEventListener('scroll', onScroll, true);
    let ro: ResizeObserver | undefined;
    // 一覧の外枠そのものを監視する（サイドバーの開閉で --sidebar-width が変わると本文の幅が
    // 変わる＝ここが動く）。センチネル行ではなく外枠を見ることで、帯の基準と監視対象を揃える。
    if (typeof ResizeObserver !== 'undefined' && sentinelRef.current) {
      ro = new ResizeObserver(measureBounds);
      ro.observe(findListBoundsElement(sentinelRef.current));
    }
    return () => {
      window.removeEventListener('resize', measureBounds);
      window.removeEventListener('scroll', onScroll, true);
      if (raf) window.cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [showGlass, measureBounds]);

  // 実寸が取れるまでは fixed 化しない（測る前に position:fixed にすると left/width 無しで
  // 画面左上に一瞬飛ぶため）。一覧が帯の位置より上へ流れ去ったとき（inView=false）も出さない。
  const floating = showGlass && !!fixedBounds && fixedBounds.inView;
  const inner = (
    <div
      className={`sb-sticky-inner${floating ? ' sb-sticky-inner-fixed' : ''}`}
      style={floating && fixedBounds ? { top: topPx, left: fixedBounds.left, width: fixedBounds.width } : undefined}
    >
      <span className="flex min-w-0 items-center overflow-hidden">{children}</span>
      {/* 右側（グループへ移動の一覧など）。残り幅を受け取って右寄せする（中の一覧が
          「入り切る分だけ表示して残りは＋n に畳む」計算をするために、実際の余り幅が要る）。 */}
      {trailing && <span className="ml-auto flex min-w-0 flex-1 items-center justify-end pl-3">{trailing}</span>}
    </div>
  );

  return (
    <>
      {/* 高さ0のセンチネル。table 内なので有効な行として tr/td で作る。 */}
      <tr ref={sentinelRef} aria-hidden className="pointer-events-none">
        <td colSpan={colSpan} style={{ padding: 0, border: 0, height: 0, lineHeight: 0 }} />
      </tr>
      <tr className={`sb-sticky-row${floating ? ' is-stuck' : ''}${className ? ` ${className}` : ''}`}>
        {/* 高さは常に32pxで固定する（ガラス表示中は中の div が position:fixed で
            通常フローから抜けるため、td 側で明示しないと行の高さが0に潰れてしまう）。
            id（「次のグループ ▸」の着地点）は常に通常フローに残るこの td に付ける
            （帯の div は fixed 中 body へ portal されるので、位置の基準に使えない）。 */}
        <td id={id} data-tour={dataTour} colSpan={colSpan} className="sb-sticky-cell" style={{ height: 32 }}>
          {floating ? createPortal(inner, document.body) : inner}
        </td>
      </tr>
    </>
  );
}
