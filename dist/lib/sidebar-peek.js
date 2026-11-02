const SIDEBAR_PEEK_REGION_ATTR = "data-sidebar-peek-region";
const sidebarPeekRegionProps = { "data-sidebar-peek-region": "" };
const SIDEBAR_PEEK_REGION_SELECTOR = `[${SIDEBAR_PEEK_REGION_ATTR}]`;
const SIDEBAR_PEEK_NEAR_PX = 32;
function sidebarPeekRegions() {
  if (typeof document === "undefined") return [];
  return Array.from(document.querySelectorAll(SIDEBAR_PEEK_REGION_SELECTOR));
}
function isInsideSidebarPeekRegion(node) {
  if (!node) return false;
  const el = node.nodeType === 1 ? node : node.parentElement;
  if (!el || typeof el.closest !== "function") return false;
  return !!el.closest(SIDEBAR_PEEK_REGION_SELECTOR);
}
function rectDistanceFromPoint(rect, x, y) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}
function distanceToSidebarPeekRegion(x, y) {
  let best = Number.POSITIVE_INFINITY;
  for (const el of sidebarPeekRegions()) {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    const distance = rectDistanceFromPoint(rect, x, y);
    if (distance < best) best = distance;
    if (best === 0) return 0;
  }
  return best;
}
function isPointInsideSidebarPeekRegion(x, y) {
  return distanceToSidebarPeekRegion(x, y) === 0;
}
function isKeyboardFocusInsideSidebarPeekRegion() {
  if (typeof document === "undefined") return false;
  const active = document.activeElement;
  if (!active || active === document.body) return false;
  if (!isInsideSidebarPeekRegion(active)) return false;
  try {
    return active.matches(":focus-visible");
  } catch {
    return true;
  }
}
const SIDEBAR_PEEK_HOLD_EVENT = "handy-sidebar-peek-hold-change";
const holds = /* @__PURE__ */ new Set();
function emitHoldChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SIDEBAR_PEEK_HOLD_EVENT, { detail: holds.size > 0 }));
}
function holdSidebarPeek(id) {
  if (holds.has(id)) return;
  holds.add(id);
  emitHoldChange();
}
function releaseSidebarPeek(id) {
  if (!holds.delete(id)) return;
  emitHoldChange();
}
function hasSidebarPeekHold() {
  return holds.size > 0;
}
function onSidebarPeekHoldChange(listener) {
  if (typeof window === "undefined") return () => {
  };
  window.addEventListener(SIDEBAR_PEEK_HOLD_EVENT, listener);
  return () => window.removeEventListener(SIDEBAR_PEEK_HOLD_EVENT, listener);
}
function resetSidebarPeekHolds() {
  if (holds.size === 0) return;
  holds.clear();
  emitHoldChange();
}
export {
  SIDEBAR_PEEK_NEAR_PX,
  SIDEBAR_PEEK_REGION_ATTR,
  distanceToSidebarPeekRegion,
  hasSidebarPeekHold,
  holdSidebarPeek,
  isInsideSidebarPeekRegion,
  isKeyboardFocusInsideSidebarPeekRegion,
  isPointInsideSidebarPeekRegion,
  onSidebarPeekHoldChange,
  rectDistanceFromPoint,
  releaseSidebarPeek,
  resetSidebarPeekHolds,
  sidebarPeekRegionProps,
  sidebarPeekRegions
};
//# sourceMappingURL=sidebar-peek.js.map
