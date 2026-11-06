const COLUMN_WIDTH_DEFAULT_MIN = 48;
const COLUMN_WIDTH_SANITY_MAX = 4e3;
function columnMinWidth(spec) {
  const m = spec.minWidth;
  return typeof m === "number" && Number.isFinite(m) && m > 0 ? Math.round(m) : COLUMN_WIDTH_DEFAULT_MIN;
}
function isColumnResizable(spec) {
  return spec.resizable !== false;
}
function clampColumnWidth(px, minWidth = COLUMN_WIDTH_DEFAULT_MIN) {
  if (!Number.isFinite(px)) return minWidth;
  return Math.max(minWidth, Math.round(px));
}
function parseSavedColumnWidths(raw, specs) {
  if (!raw) return {};
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const source = parsed;
  const out = {};
  for (const spec of specs) {
    if (!isColumnResizable(spec)) continue;
    const v = source[spec.key];
    if (typeof v !== "number" || !Number.isFinite(v) || v <= 0 || v > COLUMN_WIDTH_SANITY_MAX) continue;
    out[spec.key] = clampColumnWidth(v, columnMinWidth(spec));
  }
  return diffColumnWidthsFromDefaults(out, specs);
}
function diffColumnWidthsFromDefaults(widths, specs) {
  const out = {};
  for (const spec of specs) {
    const v = widths[spec.key];
    if (typeof v !== "number" || !Number.isFinite(v)) continue;
    if (spec.defaultWidth !== null && v === spec.defaultWidth) continue;
    out[spec.key] = v;
  }
  return out;
}
function serializeColumnWidths(overrides, specs) {
  return JSON.stringify(diffColumnWidthsFromDefaults(overrides, specs));
}
function resolveColumnWidths(specs, overrides) {
  const out = {};
  for (const spec of specs) {
    const v = overrides[spec.key];
    out[spec.key] = typeof v === "number" && isColumnResizable(spec) ? v : spec.defaultWidth;
  }
  return out;
}
function withColumnWidth(overrides, specs, key, px) {
  const spec = specs.find((s) => s.key === key);
  if (!spec || !isColumnResizable(spec)) return { ...overrides };
  return diffColumnWidthsFromDefaults({ ...overrides, [key]: clampColumnWidth(px, columnMinWidth(spec)) }, specs);
}
function withoutColumnWidth(overrides, key) {
  const { [key]: _removed, ...rest } = overrides;
  return rest;
}
export {
  COLUMN_WIDTH_DEFAULT_MIN,
  COLUMN_WIDTH_SANITY_MAX,
  clampColumnWidth,
  columnMinWidth,
  diffColumnWidthsFromDefaults,
  isColumnResizable,
  parseSavedColumnWidths,
  resolveColumnWidths,
  serializeColumnWidths,
  withColumnWidth,
  withoutColumnWidth
};
//# sourceMappingURL=column-widths.js.map
