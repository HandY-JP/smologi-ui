function isAlwaysOnBar(item) {
  return !!item.primary || item.key === "refresh";
}
function selectBarItemKeys(items, maxBarItems) {
  const candidates = items.filter((item) => (item.placement ?? "bar") === "bar");
  if (candidates.length <= maxBarItems) return new Set(candidates.map((item) => item.key));
  const kept = /* @__PURE__ */ new Set();
  for (const item of candidates) {
    if (kept.size >= maxBarItems) break;
    if (isAlwaysOnBar(item)) kept.add(item.key);
  }
  for (const item of candidates) {
    if (kept.size >= maxBarItems) break;
    kept.add(item.key);
  }
  return kept;
}
function overflowedBarItems(items, barKeys) {
  return items.filter((item) => (item.placement ?? "bar") === "bar" && !barKeys.has(item.key));
}
export {
  overflowedBarItems,
  selectBarItemKeys
};
//# sourceMappingURL=top-tool-placement.js.map
