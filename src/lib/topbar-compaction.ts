// 管理画面トップバー再設計（2026-09）の純粋ロジック。
// スクロールに応じた「畳み」判定（単純な閾値）と、畳んだときに浮かぶガラスカプセルの
// チップ溢れ計算、最後に見た工程を覚えるストレージキーの組み立てをここへ集約する。
// DOM / React に依存しないので vitest でそのままテストできる。
//
// 仕様（2026-09-15 変更・ユーザー決定）: **スクロール位置だけ**で決める。
//   畳む: scrollTop > 24px ／ 戻す: scrollTop <= 8px（あいだは現状維持＝ジッター防止の
//   ヒステリシス。同日の「一覧が揺れる」指摘への対策で 1本閾値から 2本閾値へ）。
// 以前は「下24pxで畳む／上8px戻すと復帰」という方向ヒステリシスだったが、一覧を少し見返す
// ために上へ小さく戻すだけでトップバーが開いてしまい、畳んだカプセル（浮遊ガラス）が
// 消えたり出たりしてちらつくのが不評だった。畳んだ状態は**最上部まで戻るまで維持**する。

export interface CompactionState {
  /** 現在「畳み」表示中か。 */
  compact: boolean;
}

/** この位置より下（scrollTop > 24px）なら畳む。 */
export const COMPACT_THRESHOLD_PX = 24;

/**
 * 畳みを解除する位置（scrollTop <= 8px）。畳む閾値より**低い**位置に置く＝ヒステリシス。
 *
 * 本番不具合（2026-09-15 ユーザー指摘「一覧が揺れる」）: 閾値が1本（24px）だけだと、
 * 畳み／展開でトップバーの高さが変わる→本文が上下に動く→スクロール量が閾値をまたぐ→
 * また切り替わる、という往復（ジッター）が閾値付近で起こりうる。畳む位置と戻す位置を
 * 離して、同じスクロール位置で両方の判定が成立しないようにする。
 * 「最上部まで戻るまで畳みを維持する」という 2026-09-15 の決定はそのまま
 * （戻す位置をさらに上＝8px にするだけで、途中で勝手に開くことは無い）。
 */
export const EXPAND_THRESHOLD_PX = 8;

export const INITIAL_COMPACTION_STATE: CompactionState = { compact: false };

/**
 * 現在の scrollTop を渡して次の状態を計算する。状態が変わらない呼び出しでは
 * （参照が変わらないよう）同じオブジェクトを返す — React の setState 呼び出しを
 * 不要な再レンダーなしでスキップできるようにするため。
 *
 * 方向（上へ／下へ）は見ない。最上部付近（24px以下）まで戻ったときだけ通常表示へ戻る。
 */
export function nextCompactionState(state: CompactionState, scrollY: number): CompactionState {
  const y = Math.max(0, scrollY);
  // 畳む: 24px より下。戻す: 8px 以下。あいだ（8px 超〜24px 以下）は現状維持＝ヒステリシス。
  const compact = state.compact ? y > EXPAND_THRESHOLD_PX : y > COMPACT_THRESHOLD_PX;
  if (compact === state.compact) return state;
  return { compact };
}

/**
 * トップバーの畳み判定に使う「現在のスクロール量」を決める。
 *
 * 管理画面のスクローラーは window ではなく `#app-main`（ChromeMain, overflow-y-auto）で、
 * window.scrollY は常に 0 のまま変化しない（Opus レビュー指摘: 畳みが一切発火しないバグの原因）。
 * scroller（#app-main 相当の要素）が見つかればその scrollTop を、見つからなければ
 * window.scrollY 相当のフォールバック値を使う。DOM に依存しない純粋関数にして、
 * 要素の有無ぶんだけをテストで確認できるようにしてある。
 */
export function resolveScrollTop(
  scroller: { scrollTop: number } | null | undefined,
  fallbackScrollY: number,
): number {
  return scroller ? scroller.scrollTop : fallbackScrollY;
}

/** 最後に見た工程（stage）を覚える localStorage キー。ページ・ユーザー単位で分ける。 */
export function topbarStageStorageKey(pageKey: string, userId?: string | null): string {
  return `smologi:topbar-stage:${pageKey}:${userId ?? 'anon'}`;
}

export interface OverflowChip {
  id: string;
  widthPx: number;
}

export interface ChipOverflowResult {
  /** 表示するチップの id（先頭から詰めた分）。 */
  shownIds: string[];
  /** あふれて隠れた件数。 */
  hiddenCount: number;
  totalCount: number;
  /** 1件も出せない幅で「絞り込み n」に畳んだ状態か（true のときは shownIds は空）。 */
  collapsedToCount: boolean;
}

/**
 * 与えられた幅の中に先頭から入り切るチップだけを選ぶ。
 * あふれる場合は末尾から間引き、「＋n」チップ自身の幅（moreChipWidthPx）を差し引いた
 * 残り幅で入る数までを表示する。1件も入らない幅なら shownIds を空にして呼び出し側に
 * 「絞り込み n」表記へ切り替えさせる（collapsedToCount）。
 */
export function computeChipOverflow(
  chips: OverflowChip[],
  availablePx: number,
  moreChipWidthPx: number,
): ChipOverflowResult {
  const totalCount = chips.length;
  if (totalCount === 0) return { shownIds: [], hiddenCount: 0, totalCount: 0, collapsedToCount: false };
  if (availablePx <= 0) return { shownIds: [], hiddenCount: totalCount, totalCount, collapsedToCount: true };

  const widths = chips.map((c) => c.widthPx);
  const totalWidth = widths.reduce((a, b) => a + b, 0);
  if (totalWidth <= availablePx) {
    return { shownIds: chips.map((c) => c.id), hiddenCount: 0, totalCount, collapsedToCount: false };
  }

  const remaining = availablePx - moreChipWidthPx;
  let used = 0;
  let shown = 0;
  for (let i = 0; i < totalCount; i += 1) {
    const next = used + widths[i];
    if (next > remaining) break;
    used = next;
    shown += 1;
  }
  if (shown === 0) {
    return { shownIds: [], hiddenCount: totalCount, totalCount, collapsedToCount: true };
  }
  return {
    shownIds: chips.slice(0, shown).map((c) => c.id),
    hiddenCount: totalCount - shown,
    totalCount,
    collapsedToCount: false,
  };
}
