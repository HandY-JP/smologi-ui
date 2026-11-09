import { isCode128BEncodable } from "./code128.js";
import { buildNameCharEm } from "./dialog-model.js";
import { resolveSourceSheetId } from "./sheets.js";
import { conditionDisplayName, extraText } from "./text.js";
function str(value) {
  return typeof value === "string" ? value.trim() : "";
}
function positiveIntOrNull(value) {
  const n = typeof value === "number" ? value : Number.NaN;
  return Number.isInteger(n) && n > 0 ? n : null;
}
function strList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((v) => str(v)).filter((v) => v !== "");
}
function strOrNull(value) {
  const s = str(value);
  return s ? s : null;
}
function parseLabelDocMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") return null;
  const meta = metadata;
  if (!Array.isArray(meta.items)) return null;
  const items = [];
  let hasDroppedItems = false;
  for (const raw of meta.items) {
    if (!raw || typeof raw !== "object") continue;
    const it = raw;
    const quantity = Math.trunc(Number(it.quantity));
    const fnSku = str(it.fnSku);
    if (!fnSku || !Number.isFinite(quantity) || quantity <= 0) {
      if (!fnSku && Number.isFinite(quantity) && quantity > 0) hasDroppedItems = true;
      continue;
    }
    items.push({
      sellerSku: str(it.sellerSku),
      asin: str(it.asin),
      fnSku,
      productName: str(it.productName),
      quantity,
      condition: strOrNull(it.condition),
      conditionLabel: conditionDisplayName(strOrNull(it.condition), strOrNull(it.conditionLabel)),
      imageUrl: strOrNull(it.imageUrl),
      expiration: strOrNull(it.expiration),
      unitsPerSet: positiveIntOrNull(it.unitsPerSet),
      expiryManaged: typeof it.expiryManaged === "boolean" ? it.expiryManaged : null,
      prepInstructions: strList(it.prepInstructions)
    });
  }
  const sourceSheet = resolveSourceSheetId(meta.officialPageType) ?? resolveSourceSheetId(meta.pageType);
  return { items, ...hasDroppedItems ? { hasDroppedItems } : {}, sourceSheet };
}
function asisReason(doc) {
  if (!doc) return "Seller \u306E\u30E9\u30D9\u30EB\u306E\u30C7\u30FC\u30BF\u3092\u8AAD\u307F\u8FBC\u3081\u306A\u3044\u305F\u3081\u4F5C\u308A\u76F4\u305B\u307E\u305B\u3093";
  if (doc.items.length === 0) return "\u30E9\u30D9\u30EB\u306E\u54C1\u76EE\u306E\u30C7\u30FC\u30BF\u304C\u306A\u3044\u305F\u3081\u4F5C\u308A\u76F4\u305B\u307E\u305B\u3093";
  if (doc.hasDroppedItems) return "FNSKU \u304C\u5165\u3063\u3066\u3044\u306A\u3044\u54C1\u76EE\u304C\u3042\u308B\u305F\u3081\u4F5C\u308A\u76F4\u305B\u307E\u305B\u3093";
  if (doc.items.some((item) => !item.productName)) return "\u5546\u54C1\u540D\u304C\u5165\u3063\u3066\u3044\u306A\u3044\u54C1\u76EE\u304C\u3042\u308B\u305F\u3081\u4F5C\u308A\u76F4\u305B\u307E\u305B\u3093";
  if (doc.items.some((item) => !item.condition || !item.conditionLabel)) return "\u30B3\u30F3\u30C7\u30A3\u30B7\u30E7\u30F3\u304C\u5206\u304B\u3089\u306A\u3044\u54C1\u76EE\u304C\u3042\u308B\u305F\u3081\u4F5C\u308A\u76F4\u305B\u307E\u305B\u3093";
  if (doc.items.some((item) => !isCode128BEncodable(item.fnSku))) return "FNSKU \u3092\u30D0\u30FC\u30B3\u30FC\u30C9\u306B\u3067\u304D\u306A\u3044\u54C1\u76EE\u304C\u3042\u308B\u305F\u3081\u4F5C\u308A\u76F4\u305B\u307E\u305B\u3093";
  return null;
}
function decideLabelMode(doc) {
  return asisReason(doc) === null ? "generate" : "asis";
}
function totalLabelCount(doc) {
  return doc.items.reduce((sum, item) => sum + item.quantity, 0);
}
function toPreviewItem(item, measureEm) {
  return {
    productName: item.productName,
    fnSku: item.fnSku,
    sellerSku: item.sellerSku,
    quantity: item.quantity,
    hasImage: Boolean(item.imageUrl),
    expiration: item.expiration,
    unitsPerSet: item.unitsPerSet,
    expiryManaged: item.expiryManaged,
    prepInstructions: item.prepInstructions,
    conditionLabel: item.conditionLabel ?? null,
    fnSkuEm: measureEm(item.fnSku),
    conditionEm: item.conditionLabel ? measureEm(item.conditionLabel) : 0,
    skuEm: item.sellerSku ? measureEm(item.sellerSku) : 0,
    // 追加項目（要期限・◯点入）の幅。クライアントの判定が印刷と一致するために、出せる文字だけ実測して渡す。
    extraEm: Object.fromEntries(
      ["needsExpiry", "setUnits"].map((k) => extraText(k, item)).filter((t) => t !== null).map((t) => [t, measureEm(t)])
    ),
    nameCharEm: buildNameCharEm(item.productName, (t) => measureEm(t))
  };
}
export {
  asisReason,
  decideLabelMode,
  parseLabelDocMetadata,
  toPreviewItem,
  totalLabelCount
};
//# sourceMappingURL=label-doc.js.map