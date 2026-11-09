import { computeLabelBox } from "./label-layout.js";
import { extraTexts, formatExpiry, visualLength } from "./text.js";
import { getSheet, sheetFacesName, sourceFacesName } from "./sheets.js";
function faceKey(ref, kind) {
  return `${ref.targetIndex}:${ref.itemIndex}:${kind}`;
}
function faceSlots(targets, opts) {
  const out = [];
  targets.forEach((t, targetIndex) => {
    if (t.mode !== "generate") return;
    t.items.forEach((item, itemIndex) => {
      out.push({ ref: { targetIndex, itemIndex }, kind: "label", page: out.length });
      if (opts.expirySticker && formatExpiry(item.expiration)) out.push({ ref: { targetIndex, itemIndex }, kind: "expiry", page: out.length });
    });
  });
  return out;
}
function cellLabelBox(label, sheet, opts) {
  const fnSku = label.fnSku ?? "";
  const condition = label.conditionLabel ?? null;
  const sku = label.sellerSku ?? "";
  const fnEm = label.fnSkuEm ?? 0;
  const condEm = label.conditionEm ?? 0;
  const skuEm = label.skuEm ?? 0;
  const extraEm = label.extraEm ?? {};
  return computeLabelBox({
    sheetId: sheet.id,
    widthMm: sheet.labelW,
    heightMm: sheet.labelH,
    fnSku,
    withImage: opts.image && Boolean(label.hasImage),
    condition,
    measure: (text, fontSize) => fontSize * (text === fnSku ? fnEm : text === condition ? condEm : text === sku ? skuEm : extraEm[text] ?? condEm),
    extras: extraTexts(label, opts.extra)
  });
}
function nameMeasurer(charEm, fontSize) {
  if (!charEm) return (t) => visualLength(t) * fontSize * 1.2;
  return (t) => {
    let sum = 0;
    for (const ch of t) sum += charEm[ch] ?? (ch.charCodeAt(0) <= 255 ? 0.6 : 1.2);
    return sum * fontSize;
  };
}
function buildNameCharEm(name, measureEm, maxKinds = 400) {
  const out = { " ": measureEm(" "), "\u2026": measureEm("\u2026") };
  for (const ch of new Set(Array.from(name.trim()))) {
    out[ch] = measureEm(ch);
    if (Object.keys(out).length > maxKinds) return void 0;
  }
  return out;
}
function hasExtraOmitted(targets, sheet, opts) {
  if (opts.extra.length === 0) return false;
  return targets.some(
    (t) => t.mode === "generate" && t.items.some((i) => cellLabelBox({ ...i, kind: "label", fnSku: i.fnSku, name: i.productName }, sheet, opts).extrasOmitted > 0)
  );
}
function targetLabelCount(target, opts) {
  if (target.mode === "generate") {
    const base = target.labelCount ?? target.items.reduce((s, i) => s + i.quantity, 0);
    const expiry = opts.expirySticker ? target.items.reduce((s, i) => s + (i.expiration ? i.quantity : 0), 0) : 0;
    return base + expiry;
  }
  return null;
}
function totalCount(targets, opts) {
  let sum = 0;
  for (const t of targets) {
    const n = targetLabelCount(t, opts);
    if (n === null) return null;
    sum += n;
  }
  return sum;
}
function cellLabels(targets, opts, limit) {
  const out = [];
  for (const [targetIndex, t] of targets.entries()) {
    if (out.length >= limit) break;
    if (t.mode === "generate") {
      for (const [itemIndex, item] of t.items.entries()) {
        const faceRef = { targetIndex, itemIndex };
        for (let i = 0; i < item.quantity && out.length < limit; i++) {
          out.push({
            kind: "label",
            fnSku: item.fnSku,
            name: item.productName,
            sellerSku: item.sellerSku,
            conditionLabel: item.conditionLabel,
            fnSkuEm: item.fnSkuEm,
            conditionEm: item.conditionEm,
            skuEm: item.skuEm,
            extraEm: item.extraEm,
            unitsPerSet: item.unitsPerSet,
            expiryManaged: item.expiryManaged,
            nameCharEm: item.nameCharEm,
            hasImage: item.hasImage,
            faceRef
          });
        }
        if (opts.expirySticker && item.expiration) {
          for (let i = 0; i < item.quantity && out.length < limit; i++) {
            out.push({ kind: "expiry", name: item.productName, fnSku: item.fnSku, expiration: item.expiration, faceRef });
          }
        }
      }
    }
  }
  return out;
}
function diagramPage(def, order, start, labels, total, page) {
  const cells = [];
  for (let row = 0; row < def.rows; row++) {
    for (let col = 0; col < def.cols; col++) {
      const no = (order === "column" ? col * def.rows + row : row * def.cols + col) + 1;
      const slot = page * def.faces + no - 1;
      const li = slot - (start - 1);
      let state = "spare";
      if (page === 0 && no < start) state = "used";
      else if (li >= 0 && li < total) state = "print";
      cells.push({ row, col, no, state, label: state === "print" ? labels[li] ?? null : null });
    }
  }
  return cells;
}
function labelCardRowSub(r) {
  const parts = [`FNSKU ${r.fnSku}`];
  if (r.conditionLabel && r.conditionLabel !== "\u65B0\u54C1") parts.push(r.conditionLabel);
  if (r.expiration) parts.push(`\u671F\u9650 ${formatCardExpiry(r.expiration)}`);
  if (r.prepInstructions && r.prepInstructions.length > 0) parts.push(`\u68B1\u5305 ${r.prepInstructions.join(" / ")}`);
  return parts.join("\u30FB");
}
function labelCardSummary(targets, opts, sheet) {
  const anyGenerate = targets.some((t) => t.mode === "generate");
  const countOpts = { expirySticker: opts.expirySticker && anyGenerate };
  const rows = targets.flatMap(
    (t, targetIndex) => t.mode !== "generate" ? [] : t.items.map((i, itemIndex) => ({
      name: i.productName,
      fnSku: i.fnSku,
      quantity: i.quantity,
      conditionLabel: i.conditionLabel,
      expiration: i.expiration,
      prepInstructions: i.prepInstructions ?? [],
      label: {
        kind: "label",
        fnSku: i.fnSku,
        name: i.productName,
        sellerSku: i.sellerSku,
        conditionLabel: i.conditionLabel,
        fnSkuEm: i.fnSkuEm,
        conditionEm: i.conditionEm,
        skuEm: i.skuEm,
        extraEm: i.extraEm,
        unitsPerSet: i.unitsPerSet,
        expiryManaged: i.expiryManaged,
        nameCharEm: i.nameCharEm,
        hasImage: i.hasImage,
        faceRef: { targetIndex, itemIndex }
      }
    }))
  );
  const total = totalCount(targets, countOpts);
  const pages = total !== null && sheet.kind === "sheet" ? Math.ceil(total / sheet.faces) : null;
  return { rows, total, faces: sheet.faces, pages, first: cellLabels(targets, countOpts, 1)[0] ?? null };
}
function formatCardExpiry(iso) {
  return iso.slice(0, 10).replace(/-/g, "/");
}
function formatCardTotal(s) {
  if (s.total === null) return "\u679A\u6570\u306F\u5370\u5237\u753B\u9762\u3067\u78BA\u8A8D\u3067\u304D\u307E\u3059";
  if (s.pages === null) return `${s.total.toLocaleString()}\u679A`;
  return `${s.total.toLocaleString()}\u679A\uFF08${s.faces}\u9762\u306E\u7528\u7D19\u3067\u7D04${s.pages.toLocaleString()}\u679A\uFF09`;
}
function canPrintWithLabelDialog(preview) {
  return preview.length > 0 && preview.every((t) => t.mode === "generate" && t.hasItems);
}
function printButtonLabel(sheet) {
  return `${sheetFacesName(sheet)}\u3067\u5370\u5237`;
}
function sheetPillName(sheet) {
  return sheet.label;
}
function commonSourceSheet(targets) {
  if (targets.length === 0) return null;
  const first = targets[0].sourceSheet ?? null;
  if (!first || !getSheet(first)) return null;
  return targets.every((t) => (t.sourceSheet ?? null) === first) ? first : null;
}
function asisCardInfo(targets) {
  const blocked = targets.find((t) => t.mode !== "generate" || !t.hasItems);
  const faces = sourceFacesName(commonSourceSheet(targets));
  return {
    bandText: faces ? `${faces}\uFF08\u5C4A\u3044\u305FPDF\u306E\u307E\u307E\uFF09` : "\u5C4A\u3044\u305FPDF\u306E\u307E\u307E",
    buttonLabel: faces ? `${faces}\u306E\u307E\u307E\u5370\u5237` : "\u305D\u306E\u307E\u307E\u5370\u5237",
    reason: blocked?.asisReason || "\u3053\u306E\u7D0D\u54C1\u30D7\u30E9\u30F3\u306F\u4F5C\u308A\u76F4\u305B\u307E\u305B\u3093",
    sourceFaces: faces
  };
}
function originalPdfName(sourceSheetId) {
  const faces = sourceFacesName(sourceSheetId);
  return faces ? `\u5143\u306EPDF\uFF08Amazon\u30FB${faces}\uFF09` : "\u5143\u306EPDF\uFF08Amazon\uFF09";
}
export {
  asisCardInfo,
  buildNameCharEm,
  canPrintWithLabelDialog,
  cellLabelBox,
  cellLabels,
  commonSourceSheet,
  diagramPage,
  faceKey,
  faceSlots,
  formatCardExpiry,
  formatCardTotal,
  hasExtraOmitted,
  labelCardRowSub,
  labelCardSummary,
  nameMeasurer,
  originalPdfName,
  printButtonLabel,
  sheetPillName,
  targetLabelCount,
  totalCount
};
//# sourceMappingURL=dialog-model.js.map