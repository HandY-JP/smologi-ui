const A4_W = 210;
const A4_H = 297;
function sheet(def) {
  return { ...def, kind: "sheet", faces: def.cols * def.rows, pageW: A4_W, pageH: A4_H };
}
function roll(id, w, h) {
  return {
    id,
    group: "roll",
    label: `\u30ED\u30FC\u30EB\u7D19 ${w}\xD7${h}mm`,
    kind: "roll",
    cols: 1,
    rows: 1,
    faces: 1,
    pageW: w,
    pageH: h,
    labelW: w,
    labelH: h,
    pitchX: w,
    pitchY: h,
    marginLeft: 0,
    marginTop: 0
  };
}
const SHEETS = [
  // A4_21: Amazon の PDF で x ピッチ 66.63mm・y ピッチ 38.1mm、バーコード中心から余白を逆算。
  sheet({ id: "A4_21", group: "21", label: "21\u9762\uFF0863.5\xD738.1mm\uFF09", cols: 3, rows: 7, labelW: 63.5, labelH: 38.1, pitchX: 66.63, pitchY: 38.1, marginLeft: 3.35, marginTop: 16.3 }),
  // A4_24: エーワン 72224／エレコム EDT-FBA24100（66×33.9mm、上余白 12.9・左余白 6）。
  sheet({ id: "A4_24", group: "24", label: "24\u9762\uFF0866\xD733.9mm\uFF09", cols: 3, rows: 8, labelW: 66, labelH: 33.9, pitchX: 66, pitchY: 33.9, marginLeft: 6, marginTop: 12.9 }),
  // A4_40: Amazon の PDF で x ピッチ 52.5mm・y ピッチ 29.46mm。
  sheet({ id: "A4_40_52x29", group: "40", label: "40\u9762\uFF0852.5\xD729mm\uFF09", cols: 4, rows: 10, labelW: 52.5, labelH: 29.46, pitchX: 52.5, pitchY: 29.46, marginLeft: 0, marginTop: 0.34 }),
  // A4_44: エーワン 31516（48.3×25.4mm、隙間なし、上余白 8.8・左余白 8.4）。
  sheet({ id: "A4_44_48x25", group: "44", label: "44\u9762\uFF0848.3\xD725.4mm\uFF09", cols: 4, rows: 11, labelW: 48.3, labelH: 25.4, pitchX: 48.3, pitchY: 25.4, marginLeft: 8.4, marginTop: 8.8 }),
  roll("ROLL_50x30", 50, 30),
  roll("ROLL_62x29", 62, 29),
  roll("ROLL_50.8x25.4", 50.8, 25.4)
];
const DEFAULT_SHEET_ID = "A4_40_52x29";
const SHEET_GROUP_LABELS = {
  "21": "21\u9762",
  "24": "24\u9762",
  "40": "40\u9762",
  "44": "44\u9762",
  roll: "\u30ED\u30FC\u30EB\u7D19"
};
const SHEET_GROUP_ORDER = ["21", "24", "40", "44", "roll"];
const SHEET_BY_ID = new Map(SHEETS.map((s) => [s.id, s]));
function getSheet(id) {
  return id && SHEET_BY_ID.get(id) || null;
}
function sheetOrDefault(id) {
  return getSheet(id) ?? SHEET_BY_ID.get(DEFAULT_SHEET_ID);
}
function groupedSheets() {
  return SHEET_GROUP_ORDER.map((group) => ({
    group,
    label: SHEET_GROUP_LABELS[group],
    sheets: SHEETS.filter((s) => s.group === group)
  })).filter((g) => g.sheets.length > 0);
}
function cellOfIndex(def, order, index) {
  if (order === "column") return { col: Math.floor(index / def.rows), row: index % def.rows };
  return { row: Math.floor(index / def.cols), col: index % def.cols };
}
function numberOfCell(def, order, row, col) {
  return (order === "column" ? col * def.rows + row : row * def.cols + col) + 1;
}
function cellRect(def, row, col, offsetXmm = 0, offsetYmm = 0) {
  return {
    x: def.marginLeft + col * def.pitchX + offsetXmm,
    y: def.marginTop + row * def.pitchY + offsetYmm,
    w: def.labelW,
    h: def.labelH
  };
}
function clampStart(def, start) {
  if (def.kind === "roll") return 1;
  const n = Number.isFinite(start) ? Math.trunc(start) : 1;
  return Math.min(def.faces, Math.max(1, n));
}
function layoutLabels(def, order, start, count) {
  const n = Math.max(0, Math.trunc(count));
  if (def.kind === "roll") {
    return Array.from({ length: n }, (_, i) => ({ page: i, row: 0, col: 0 }));
  }
  const first = clampStart(def, start) - 1;
  return Array.from({ length: n }, (_, i) => {
    const slot = first + i;
    const page = Math.floor(slot / def.faces);
    const { row, col } = cellOfIndex(def, order, slot % def.faces);
    return { page, row, col };
  });
}
function summarizeLabels(def, start, count) {
  const labels = Math.max(0, Math.trunc(count));
  if (def.kind === "roll") return { labels, start: 1, pages: labels, leftover: 0 };
  const s = clampStart(def, start);
  if (labels === 0) return { labels, start: s, pages: 0, leftover: 0 };
  const used = s - 1 + labels;
  const pages = Math.ceil(used / def.faces);
  return { labels, start: s, pages, leftover: pages * def.faces - used };
}
function sheetFacesName(def) {
  return def.kind === "roll" ? SHEET_GROUP_LABELS.roll : SHEET_GROUP_LABELS[def.group];
}
function resolveSourceSheetId(pageType) {
  if (typeof pageType !== "string") return null;
  const id = pageType.trim() === "A4_40" ? "A4_40_52x29" : pageType.trim();
  return getSheet(id)?.id ?? null;
}
function sourceFacesName(sheetId) {
  const def = getSheet(sheetId);
  return def ? sheetFacesName(def) : null;
}
export {
  DEFAULT_SHEET_ID,
  SHEETS,
  SHEET_GROUP_LABELS,
  SHEET_GROUP_ORDER,
  cellOfIndex,
  cellRect,
  clampStart,
  getSheet,
  groupedSheets,
  layoutLabels,
  numberOfCell,
  resolveSourceSheetId,
  sheetFacesName,
  sheetOrDefault,
  sourceFacesName,
  summarizeLabels
};
//# sourceMappingURL=sheets.js.map