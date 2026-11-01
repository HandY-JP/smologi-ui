// 共有パッケージ版。amazon-app（a85522311）と smologi の src/lib/sidebar-peek.ts の挙動をそのまま移したもの。
// 数値・属性名（data-sidebar-peek-region）を変えないこと。アプリ側の複製は AppSidebar へ切り替えたあと削除する。
//
// 折りたたみサイドバーの一時展開（ピーク）を「閉じてよいか」だけを扱う小さな土台。
//
// 背景（smologi 2026-09-22 の不具合）:
//   畳んだサイドバーにマウスを寄せるとピークで開くが、そのまま上部の開閉ドック
//   （▶／⋮⋮⋮ 等）へ動かすとサイドバーが閉じてしまい、アイコンが押せなかった。
//   原因は「開いたままにする領域」が要素ごとにバラバラだったこと。ドックは <aside> の**外**に
//   ある別の fixed 要素で、しかもホバー用ハンドラは一部のボタンにしか付いていなかったため、
//   ボタン間の移動で <aside>/ボタンの pointerleave だけが起き、誰も「まだ中にいる」と言えなかった。
//
// ここでの解き方:
//   ピークを保つ領域（<aside>／ドック／左端の当たり判定／そこから開くポップオーバー）に
//   共通の目印（data-sidebar-peek-region）を付け、閉じる判定は「ポインター位置・フォーカス位置が
//   **どれか1つの領域**の中か」で行う。要素の出入りイベントに頼らないので、領域どうしが
//   DOM 上で親子でなくても（body への portal でも）正しく1つの領域として扱える。
//
// さらに、ポップオーバーを開いている間など「ポインターが外にあっても閉じてはいけない」場面のため、
// 明示的な保持（hold）も置く。いずれも DOM/モジュールスコープの素朴な仕組みで、
// サイドバーが複数インスタンス（<aside> と SidebarToggleDock）あっても共有できる。

/** ピークを開いたままにする領域の目印。 */
export const SIDEBAR_PEEK_REGION_ATTR = 'data-sidebar-peek-region';

/**
 * 領域にする要素へそのまま spread する属性。
 * キーは SIDEBAR_PEEK_REGION_ATTR と同じ文字列（型を素直に保つためリテラルで書く。ずらさないこと）。
 */
export const sidebarPeekRegionProps = { 'data-sidebar-peek-region': '' };

const SIDEBAR_PEEK_REGION_SELECTOR = `[${SIDEBAR_PEEK_REGION_ATTR}]`;

/**
 * 領域の「すぐ外」と見なす余白（px）。
 * ドックとポップオーバーの間など、見た目の隙間をポインターが通過するだけで閉じないようにする。
 */
export const SIDEBAR_PEEK_NEAR_PX = 32;

/** いま登録されているピーク領域（＝目印の付いた要素）。 */
export function sidebarPeekRegions(): HTMLElement[] {
  if (typeof document === 'undefined') return [];
  return Array.from(document.querySelectorAll<HTMLElement>(SIDEBAR_PEEK_REGION_SELECTOR));
}

/** node（イベントの target やフォーカス中の要素）がピーク領域の中にあるか。 */
export function isInsideSidebarPeekRegion(node: Node | null | undefined): boolean {
  if (!node) return false;
  // 1 = Node.ELEMENT_NODE（DOM の無い環境でも参照できるよう数値で書く）。
  const el = node.nodeType === 1 ? (node as Element) : node.parentElement;
  if (!el || typeof el.closest !== 'function') return false;
  return !!el.closest(SIDEBAR_PEEK_REGION_SELECTOR);
}

/** 矩形と点の距離（px）。点が矩形の中なら 0。distanceToSidebarPeekRegion の中身。 */
export function rectDistanceFromPoint(
  rect: { left: number; right: number; top: number; bottom: number },
  x: number,
  y: number,
): number {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}

/**
 * 座標がピーク領域の矩形からどれだけ離れているか（px）。中にいれば 0。
 * 領域が1つも無ければ Infinity（＝閉じてよい）。
 * elementFromPoint ではなく矩形で測るのは、上に別の要素（モーダル等）が載っていても
 * 「サイドバーの上にいる」と判定したいから＋隙間の距離を測りたいため。
 */
export function distanceToSidebarPeekRegion(x: number, y: number): number {
  let best = Number.POSITIVE_INFINITY;
  for (const el of sidebarPeekRegions()) {
    const rect = el.getBoundingClientRect();
    // 非表示（幅0・高さ0）の領域は無視する。折りたたみ中の <aside> は幅0になるため。
    if (rect.width <= 0 || rect.height <= 0) continue;
    const distance = rectDistanceFromPoint(rect, x, y);
    if (distance < best) best = distance;
    if (best === 0) return 0;
  }
  return best;
}

/** 座標がピーク領域の中か。 */
export function isPointInsideSidebarPeekRegion(x: number, y: number): boolean {
  return distanceToSidebarPeekRegion(x, y) === 0;
}

/**
 * キーボード操作でピーク領域にフォーカスがあるか（Tab で入ってきた状態）。
 *
 * :focus-visible で見るのが肝。単に activeElement が領域内かで見ると、
 * マウスでサイドバーのリンクを押した直後（クリックした <a> にフォーカスが残る）まで
 * 「使用中」と見なされ、マウスを離してもサイドバーが引っ込まなくなる。
 */
export function isKeyboardFocusInsideSidebarPeekRegion(): boolean {
  if (typeof document === 'undefined') return false;
  const active = document.activeElement;
  if (!active || active === document.body) return false;
  if (!isInsideSidebarPeekRegion(active)) return false;
  try {
    return active.matches(':focus-visible');
  } catch {
    // :focus-visible 非対応（古い環境・テスト環境）ではフォーカスがあるだけで保持する。
    return true;
  }
}

// ---- 明示的な保持（hold）------------------------------------------------
// ポップオーバー／ドロワーを開いている間のように、ポインターが領域の外にあっても
// 閉じてはいけない場面で使う。呼び出し側は id で登録・解除する（同じ id の二重登録は無害）。

const SIDEBAR_PEEK_HOLD_EVENT = 'handy-sidebar-peek-hold-change';
const holds = new Set<string>();

function emitHoldChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SIDEBAR_PEEK_HOLD_EVENT, { detail: holds.size > 0 }));
}

export function holdSidebarPeek(id: string): void {
  if (holds.has(id)) return;
  holds.add(id);
  emitHoldChange();
}

export function releaseSidebarPeek(id: string): void {
  if (!holds.delete(id)) return;
  emitHoldChange();
}

export function hasSidebarPeekHold(): boolean {
  return holds.size > 0;
}

/** 保持の増減を購読する（解除された瞬間に閉じ判定をやり直すため）。 */
export function onSidebarPeekHoldChange(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(SIDEBAR_PEEK_HOLD_EVENT, listener);
  return () => window.removeEventListener(SIDEBAR_PEEK_HOLD_EVENT, listener);
}

/** テスト用。保持を全部落とす。 */
export function resetSidebarPeekHolds(): void {
  if (holds.size === 0) return;
  holds.clear();
  emitHoldChange();
}
