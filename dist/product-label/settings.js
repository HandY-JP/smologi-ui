import { sheetCapabilities } from "./label-layout.js";
import { DEFAULT_SHEET_ID, getSheet } from "./sheets.js";
import { isLabelExtraKey } from "./text.js";
const DEFAULT_PRODUCT_LABEL_SETTINGS = {
  sheet: DEFAULT_SHEET_ID,
  order: "row",
  image: false,
  extra: [],
  expirySticker: false,
  offsetXmm: 0,
  offsetYmm: 0
};
const MAX_OFFSET_MM = 10;
function clampOffset(value) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  const stepped = Math.round(n * 2) / 2;
  return Math.min(MAX_OFFSET_MM, Math.max(-MAX_OFFSET_MM, stepped));
}
function normalizeExtras(raw) {
  if (raw === "sku") return ["sku"];
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const v of raw) if (isLabelExtraKey(v) && !out.includes(v)) out.push(v);
  return out;
}
function trimExtras(extras, max) {
  const n = Math.max(0, max);
  return { kept: extras.slice(0, n), removed: extras.slice(n) };
}
function normalizeProductLabelSettings(input) {
  const raw = input && typeof input === "object" ? input : {};
  const d = DEFAULT_PRODUCT_LABEL_SETTINGS;
  const sheet = typeof raw.sheet === "string" && getSheet(raw.sheet) ? raw.sheet : d.sheet;
  const caps = sheetCapabilities(getSheet(sheet) ?? getSheet(DEFAULT_SHEET_ID));
  return {
    sheet,
    order: raw.order === "column" ? "column" : "row",
    image: raw.image === true && caps.image,
    extra: trimExtras(normalizeExtras(raw.extra), caps.maxExtras).kept,
    expirySticker: raw.expirySticker === true,
    offsetXmm: clampOffset(raw.offsetXmm),
    offsetYmm: clampOffset(raw.offsetYmm)
  };
}
function withSheet(settings, sheetId) {
  if (!getSheet(sheetId)) return settings;
  return normalizeProductLabelSettings({ ...settings, sheet: sheetId });
}
export {
  DEFAULT_PRODUCT_LABEL_SETTINGS,
  MAX_OFFSET_MM,
  normalizeExtras,
  normalizeProductLabelSettings,
  trimExtras,
  withSheet
};
//# sourceMappingURL=settings.js.map