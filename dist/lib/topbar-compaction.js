const COMPACT_THRESHOLD_PX = 24;
const EXPAND_THRESHOLD_PX = 8;
const INITIAL_COMPACTION_STATE = { compact: false };
function nextCompactionState(state, scrollY) {
  const y = Math.max(0, scrollY);
  const compact = state.compact ? y > EXPAND_THRESHOLD_PX : y > COMPACT_THRESHOLD_PX;
  if (compact === state.compact) return state;
  return { compact };
}
function resolveScrollTop(scroller, fallbackScrollY) {
  return scroller ? scroller.scrollTop : fallbackScrollY;
}
function topbarStageStorageKey(pageKey, userId) {
  return `smologi:topbar-stage:${pageKey}:${userId ?? "anon"}`;
}
function computeChipOverflow(chips, availablePx, moreChipWidthPx) {
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
    collapsedToCount: false
  };
}
export {
  COMPACT_THRESHOLD_PX,
  EXPAND_THRESHOLD_PX,
  INITIAL_COMPACTION_STATE,
  computeChipOverflow,
  nextCompactionState,
  resolveScrollTop,
  topbarStageStorageKey
};
//# sourceMappingURL=topbar-compaction.js.map
