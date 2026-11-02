import { SIZE_COLS, WIDGET_SIZES } from "./sizes.js";
function isWidgetSize(value) {
  return typeof value === "string" && WIDGET_SIZES.includes(value);
}
function legacyWidthToSize(w) {
  switch (w) {
    case 4:
      return "S";
    case 6:
      return "M";
    case 8:
      return "L";
    case 12:
      return "W";
    default:
      return null;
  }
}
function snapSize(allowed, desired) {
  if (allowed.includes(desired)) return desired;
  const target = SIZE_COLS[desired];
  let best = allowed[0];
  for (const s of allowed) {
    const d = Math.abs(SIZE_COLS[s] - target);
    const bd = Math.abs(SIZE_COLS[best] - target);
    if (d < bd || d === bd && SIZE_COLS[s] > SIZE_COLS[best]) best = s;
  }
  return best;
}
function defaultLayoutFor(defs) {
  return defs.map((d) => ({ id: d.id, on: d.defaultOn, size: d.defaultSize }));
}
function emptyLayoutFor(defs) {
  return defs.map((d) => ({ id: d.id, on: false, size: d.defaultSize }));
}
function recommendedLayoutFor(defs) {
  return defaultLayoutFor(defs);
}
function hasShownItems(layout, hiddenIds) {
  return layout.some((i) => i.on && !hiddenIds?.has(i.id));
}
function normalizeItems(defs, raw) {
  if (!Array.isArray(raw)) return defaultLayoutFor(defs);
  const byId = new Map(defs.map((d) => [d.id, d]));
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const { id, on, size, w } = entry;
    if (typeof id !== "string" || !byId.has(id) || seen.has(id)) continue;
    seen.add(id);
    const def = byId.get(id);
    const desired = isWidgetSize(size) ? size : legacyWidthToSize(w) ?? def.defaultSize;
    result.push({
      id,
      on: typeof on === "boolean" ? on : def.defaultOn,
      size: snapSize(def.sizes, desired)
    });
  }
  for (const d of defs) {
    if (!seen.has(d.id)) result.push({ id: d.id, on: d.defaultOn, size: d.defaultSize });
  }
  return result;
}
function visibleItems(layout) {
  return layout.filter((i) => i.on);
}
function reorderItems(layout, activeId, overId) {
  const from = layout.findIndex((i) => i.id === activeId);
  const to = layout.findIndex((i) => i.id === overId);
  if (from < 0 || to < 0 || from === to) return layout;
  const next = layout.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
function cycleItemSize(layout, id, defs) {
  const def = defs.find((d) => d.id === id);
  if (!def || def.sizes.length < 2) return layout;
  return layout.map((i) => {
    if (i.id !== id) return i;
    const idx = def.sizes.indexOf(i.size);
    return { ...i, size: def.sizes[(idx + 1) % def.sizes.length] };
  });
}
function removeItem(layout, id) {
  return layout.map((i) => i.id === id ? { ...i, on: false } : i);
}
function appendItem(layout, id) {
  const target = layout.find((i) => i.id === id);
  if (!target || target.on) return layout;
  const rest = layout.filter((i) => i.id !== id);
  let lastOn = -1;
  rest.forEach((i, idx) => {
    if (i.on) lastOn = idx;
  });
  const next = rest.slice();
  next.splice(lastOn + 1, 0, { ...target, on: true });
  return next;
}
function draftFor(state, key) {
  return state && state.key === key ? state.items : null;
}
export {
  appendItem,
  cycleItemSize,
  defaultLayoutFor,
  draftFor,
  emptyLayoutFor,
  hasShownItems,
  isWidgetSize,
  legacyWidthToSize,
  normalizeItems,
  recommendedLayoutFor,
  removeItem,
  reorderItems,
  snapSize,
  visibleItems
};
//# sourceMappingURL=layout.js.map