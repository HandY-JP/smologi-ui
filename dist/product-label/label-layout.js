import { code128Bars } from "./code128.js";
import { getSheet } from "./sheets.js";
import { truncateEndToWidth } from "./text.js";
const MM = 72 / 25.4;
const CONDITION_GAP_EM = 0.3;
const REF_LABEL_HEIGHT_PT = 84.17;
const LINE_RATIO = 1.2;
const MIN_MODULE_PT = 0.25 * MM;
const DOT_300_PT = 72 / 300;
const DOT_600_PT = 72 / 600;
const CORNER_PAD_MM = 2;
const DEFAULT_LAYOUT_TUNING = {
  barcodeWidthRatio: 0.788,
  barcodeMinSideRatio: 0.078,
  barcodeHeightRatio: 0.356,
  textSideMarginRatio: 0.06,
  fnSkuSizePt: 9,
  conditionSizePt: 9,
  nameSizePt: 9,
  extraSizePt: 9,
  fontHeightRefPt: null,
  fontPtMax: null,
  fontPtMin: null,
  barcodeMaxHeightMm: null,
  maxNameLines: 2,
  imageAllowed: true,
  maxExtras: 2,
  expiryMinVMarginRatio: 0.15,
  expiryMinHMarginRatio: 0.1,
  expiryHeadingRatio: 0.7,
  expiryGapEm: 0.6,
  expiryOpticalShiftRatio: 0.043
};
const H40_PT = 29.46 * MM;
const BARCODE_MAX_HEIGHT_MM = 10.6;
const SAME_AS_40 = { fontHeightRefPt: H40_PT };
const LARGE = { fontPtMax: 10, barcodeMaxHeightMm: BARCODE_MAX_HEIGHT_MM };
const SMALL = { fontPtMin: 8, maxNameLines: 1, imageAllowed: false, maxExtras: 0 };
const SHEET_LAYOUT_OVERRIDES = {
  "ROLL_50x30": SAME_AS_40,
  "ROLL_62x29": SAME_AS_40,
  A4_21: LARGE,
  A4_24: LARGE,
  A4_44_48x25: SMALL,
  "ROLL_50.8x25.4": SMALL
};
function scaledPt(basePt, heightPt, t) {
  let pt = basePt * ((t.fontHeightRefPt ?? heightPt) / REF_LABEL_HEIGHT_PT);
  if (t.fontPtMax !== null) pt = Math.min(pt, t.fontPtMax);
  if (t.fontPtMin !== null) pt = Math.max(pt, t.fontPtMin);
  return pt;
}
function layoutTuningFor(sheetId) {
  const override = sheetId ? SHEET_LAYOUT_OVERRIDES[sheetId] : void 0;
  return override ? { ...DEFAULT_LAYOUT_TUNING, ...override } : DEFAULT_LAYOUT_TUNING;
}
function baseGeometry(widthMm, heightMm, t) {
  const width = widthMm * MM;
  const height = heightMm * MM;
  const pad = Math.min(CORNER_PAD_MM * MM, Math.min(width, height) * 0.1);
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const barH = Math.min(height * t.barcodeHeightRatio, t.barcodeMaxHeightMm !== null ? t.barcodeMaxHeightMm * MM : Infinity);
  const barTop = pad;
  const gap = Math.max(1.5, innerH * 0.04);
  const bodyY = barTop + barH + gap;
  const sideMargin = Math.max(pad, width * t.textSideMarginRatio);
  const body = { x: sideMargin, y: bodyY, w: width - sideMargin * 2, h: height - pad - bodyY };
  return { width, height, pad, innerW, barH, barTop, body };
}
const capabilityCache = /* @__PURE__ */ new Map();
function sheetCapabilities(sheet) {
  const key = `${sheet.id}|${sheet.labelW}|${sheet.labelH}`;
  const hit = capabilityCache.get(key);
  if (hit) return hit;
  const t = layoutTuningFor(sheet.id);
  const g = baseGeometry(sheet.labelW, sheet.labelH, t);
  const lh = (base) => scaledPt(base, g.height, t) * LINE_RATIO;
  const free = g.body.h - lh(t.fnSkuSizePt) - lh(t.nameSizePt);
  const fit = Math.floor(free / lh(t.extraSizePt) + 1e-6);
  const out = { image: t.imageAllowed, maxExtras: Math.max(0, Math.min(2, t.maxExtras, fit)) };
  capabilityCache.set(key, out);
  return out;
}
function computeLabelBox(input) {
  const t = layoutTuningFor(input.sheetId);
  const g = baseGeometry(input.widthMm, input.heightMm, t);
  const { width, height, pad, innerW, barH, barTop, body } = g;
  const { totalModules } = code128Bars(input.fnSku);
  let barW = width * t.barcodeWidthRatio;
  let barX = Math.max(width * t.barcodeMinSideRatio, (width - barW) / 2);
  if (input.sheetId && getSheet(input.sheetId)?.kind === "sheet") {
    const n = Math.floor(barW / totalModules / DOT_300_PT + 1e-9);
    if (n >= 3) {
      barW = n * DOT_300_PT * totalModules;
      const originPt = (input.originXmm ?? 0) * MM;
      const centered = (width - barW) / 2;
      barX = Math.round((originPt + centered) / DOT_300_PT) * DOT_300_PT - originPt;
    }
  }
  const barcode = { x: barX, y: barTop, w: barW, h: barH, moduleW: barW / totalModules, offsetModules: 0 };
  const withImage = input.withImage && t.imageAllowed;
  const imageSize = withImage ? Math.min(body.h, innerW * 0.4) : 0;
  const image = withImage ? { x: body.x, y: body.y, size: imageSize } : null;
  const textGap = withImage ? Math.max(2, pad * 0.8) : 0;
  const text = {
    x: body.x + imageSize + textGap,
    y: body.y,
    w: body.w - imageSize - textGap,
    h: body.h
  };
  const fontSize = scaledPt(t.fnSkuSizePt, height, t);
  const conditionFontSize = scaledPt(t.conditionSizePt, height, t);
  const nameFontSize = scaledPt(t.nameSizePt, height, t);
  const extraFontSize = scaledPt(t.extraSizePt, height, t);
  const lh = (size) => size * LINE_RATIO;
  let conditionOwnLine = false;
  if (input.condition) {
    const joinedW = input.measure(input.fnSku, fontSize, false) + conditionFontSize * CONDITION_GAP_EM + input.measure(input.condition, conditionFontSize, false);
    conditionOwnLine = joinedW > text.w;
  }
  const wanted = (input.extras ?? []).slice(0, t.maxExtras > 0 ? 2 : 0).map((x) => truncateEndToWidth(x, text.w, (s) => input.measure(s, extraFontSize, false)));
  const ride = conditionOwnLine && wanted.length > 0 ? input.measure(input.condition ?? "", conditionFontSize, false) + Math.min(conditionFontSize, extraFontSize) * CONDITION_GAP_EM + input.measure(wanted[0], extraFontSize, false) <= text.w : false;
  const baseH = lh(fontSize) + (conditionOwnLine ? lh(conditionFontSize) : 0);
  const usedH = (placed2, nameLines2) => {
    const rideUp = ride && placed2 >= 1 ? lh(Math.max(conditionFontSize, extraFontSize)) - lh(conditionFontSize) : 0;
    const rows = placed2 - (ride && placed2 >= 1 ? 1 : 0);
    return baseH + rideUp + lh(nameFontSize) * nameLines2 + lh(extraFontSize) * rows;
  };
  let placed = wanted.length;
  while (placed > 0 && usedH(placed, 1) > text.h + 1e-6) placed -= 1;
  let nameLines = 1;
  for (let n = Math.max(1, t.maxNameLines); n > 1; n -= 1) {
    if (usedH(placed, n) <= text.h + 1e-6) {
      nameLines = n;
      break;
    }
  }
  const extras = wanted.slice(0, placed).map((txt, i) => ({ text: txt, placement: ride && i === 0 ? "withCondition" : "row" }));
  return {
    pad,
    width,
    height,
    barcode,
    body,
    image,
    text,
    fontSize,
    lineHeight: fontSize * LINE_RATIO,
    conditionFontSize,
    nameFontSize,
    extraFontSize,
    nameLines,
    conditionOwnLine,
    extras,
    extrasOmitted: Math.max(0, (input.extras ?? []).length - placed)
  };
}
const ALNUM = /[0-9A-Za-z.]/;
const SEPARATOR = /[\s\u3000\-/・、。,，（）()［］\[\]【】「」『』〈〉|｜_:：;；]/;
function canCutAt(chars, i) {
  if (i <= 0 || i >= chars.length) return true;
  return !(ALNUM.test(chars[i - 1]) && ALNUM.test(chars[i]));
}
function isNiceCut(chars, i) {
  if (i <= 0 || i >= chars.length) return true;
  return SEPARATOR.test(chars[i - 1]) || SEPARATOR.test(chars[i]);
}
function headCut(chars, width, measure) {
  let fit = 0;
  while (fit < chars.length && measure(chars.slice(0, fit + 1).join("")) <= width + 1e-6) fit++;
  if (fit >= chars.length) return chars.length;
  let nice = -1;
  let ok = -1;
  for (let i = fit; i >= 1; i--) {
    if (ok < 0 && canCutAt(chars, i)) ok = i;
    if (isNiceCut(chars, i) && canCutAt(chars, i)) {
      nice = i;
      break;
    }
  }
  if (nice > 0 && measure(chars.slice(0, nice).join("").trimEnd()) >= width * 0.5) return nice;
  return ok > 0 ? ok : Math.max(1, fit);
}
function tailCut(chars, width, measure) {
  const n = chars.length;
  let fit = n;
  while (fit > 0 && measure(chars.slice(fit - 1).join("")) <= width + 1e-6) fit--;
  if (fit <= 0) return 0;
  let nice = -1;
  let ok = -1;
  for (let i = fit; i < n; i++) {
    if (ok < 0 && canCutAt(chars, i)) ok = i;
    if (SEPARATOR.test(chars[i - 1]) && canCutAt(chars, i)) {
      nice = i;
      break;
    }
  }
  if (nice >= 0 && measure(chars.slice(nice).join("").trimStart()) >= width * 0.5) return nice;
  return ok >= 0 ? ok : Math.min(n - 1, fit);
}
function wrapAll(name, widthPt, measure) {
  const tokens = name.match(/[\x21-\x7e\u00a0-\u00ff]+|\s+|[^\s]/gu) ?? [];
  const lines = [];
  let cur = "";
  const push = () => {
    lines.push(cur.trimEnd());
    cur = "";
  };
  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      if (cur) cur += " ";
      continue;
    }
    if (measure(cur + token) <= widthPt + 1e-6) {
      cur += token;
      continue;
    }
    if (cur) push();
    for (const ch of Array.from(token)) {
      if (cur && measure(cur + ch) > widthPt + 1e-6) push();
      cur += ch;
    }
  }
  if (cur) push();
  return lines.filter((l) => l !== "");
}
function nameRows(name, widthPt, measure, lines) {
  const text = name.trim();
  if (!text) return [];
  const all = wrapAll(text, widthPt, measure);
  if (all.length <= Math.max(1, lines)) return all;
  const chars = Array.from(text);
  const ellW = measure("\u2026");
  if (lines <= 1) {
    const avail = widthPt - ellW;
    const tailStart2 = tailCut(chars, avail * 0.35, measure);
    const tail = chars.slice(tailStart2).join("").trimStart();
    const headChars = chars.slice(0, tailStart2);
    const headEnd2 = headCut(headChars, avail - measure(tail), measure);
    return [`${headChars.slice(0, headEnd2).join("").trimEnd()}\u2026${tail}`];
  }
  const headEnd = headCut(chars, widthPt, measure);
  const head = chars.slice(0, headEnd).join("").trimEnd();
  const rest = chars.slice(headEnd);
  const tailStart = tailCut(rest, widthPt - ellW, measure);
  return [head, `\u2026${rest.slice(tailStart).join("").trimStart()}`];
}
const EXPIRY_LINE = 1.15;
const EXPIRY_WIDEST_LINE_EM = 4.4;
const HEADING_LINE = 1.1;
function computeExpiryBox(widthMm, heightMm, sheetId) {
  const t = layoutTuningFor(sheetId);
  const width = widthMm * MM;
  const height = heightMm * MM;
  const pad = Math.min(CORNER_PAD_MM * MM, Math.min(width, height) * 0.1);
  const footerSize = scaledPt(t.fnSkuSizePt, height, t);
  const footerLineH = footerSize * LINE_RATIO;
  const footerY = height - pad - footerLineH;
  const areaTop = height * t.expiryMinVMarginRatio;
  const areaBottom = footerY - footerSize * 0.3;
  const headingEm = t.expiryHeadingRatio;
  const gapEm = t.expiryGapEm * t.expiryHeadingRatio;
  const blockEm = headingEm + gapEm + EXPIRY_WIDEST_LINE_EM;
  const bigByHeight = (areaBottom - areaTop) / (2 * EXPIRY_LINE);
  const bigByWidth = width * (1 - 2 * t.expiryMinHMarginRatio) / blockEm;
  const bigSize = Math.max(5, Math.min(bigByHeight, bigByWidth));
  return {
    headingSize: bigSize * t.expiryHeadingRatio,
    headingLineH: bigSize * t.expiryHeadingRatio * HEADING_LINE,
    bigSize,
    headingW: bigSize * headingEm,
    gap: bigSize * gapEm,
    columnW: bigSize * EXPIRY_WIDEST_LINE_EM,
    blockW: bigSize * blockEm,
    blockH: bigSize * 2 * EXPIRY_LINE,
    centerY: Math.max(areaTop + bigSize * EXPIRY_LINE, (areaTop + areaBottom) / 2 - height * t.expiryOpticalShiftRatio),
    footer: { size: footerSize, lineH: footerLineH, y: footerY }
  };
}
export {
  BARCODE_MAX_HEIGHT_MM,
  CONDITION_GAP_EM,
  CORNER_PAD_MM,
  DEFAULT_LAYOUT_TUNING,
  DOT_300_PT,
  DOT_600_PT,
  EXPIRY_LINE,
  H40_PT,
  MIN_MODULE_PT,
  MM,
  REF_LABEL_HEIGHT_PT,
  SHEET_LAYOUT_OVERRIDES,
  computeExpiryBox,
  computeLabelBox,
  layoutTuningFor,
  nameRows,
  scaledPt,
  sheetCapabilities
};
//# sourceMappingURL=label-layout.js.map