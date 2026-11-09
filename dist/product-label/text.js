function truncateMiddle(text, maxChars) {
  const chars = Array.from(text.trim());
  const max = Math.max(1, Math.floor(maxChars));
  if (chars.length <= max) return chars.join("");
  if (max === 1) return "\u2026";
  if (max === 2) return `${chars[0]}\u2026`;
  const rest = max - 1;
  const tail = Math.max(1, Math.floor(rest / 3));
  const head = rest - tail;
  return `${chars.slice(0, head).join("")}\u2026${chars.slice(chars.length - tail).join("")}`;
}
function visualLength(text) {
  let total = 0;
  for (const ch of text) total += ch.charCodeAt(0) <= 255 ? 0.5 : 1;
  return total;
}
function fitName(text, maxWidth) {
  const trimmed = text.trim();
  if (visualLength(trimmed) <= maxWidth) return trimmed;
  let lo = 1;
  let hi = Array.from(trimmed).length;
  let best = truncateMiddle(trimmed, 1);
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const candidate = truncateMiddle(trimmed, mid);
    if (visualLength(candidate) <= maxWidth) {
      best = candidate;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}
function formatExpiry(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year: `${year}\u5E74`, monthDay: `${month}\u6708${day}\u65E5` };
}
const CONDITION_NAMES = {
  newitem: "\u65B0\u54C1",
  newnew: "\u65B0\u54C1",
  new: "\u65B0\u54C1",
  usedlikenew: "\u4E2D\u53E4-\u307B\u307C\u65B0\u54C1",
  usedverygood: "\u4E2D\u53E4-\u975E\u5E38\u306B\u826F\u3044",
  usedgood: "\u4E2D\u53E4-\u826F\u3044",
  usedacceptable: "\u4E2D\u53E4-\u53EF"
};
function conditionDisplayName(condition, _conditionLabel) {
  const key = String(condition ?? "").toLowerCase().replace(/[\s_-]/g, "");
  return key && CONDITION_NAMES[key] || null;
}
function truncateEndToWidth(text, maxWidth, measure) {
  const chars = Array.from(text.trim());
  const full = chars.join("");
  if (measure(full) <= maxWidth + 1e-6) return full;
  let lo = 0;
  let hi = chars.length - 1;
  let best = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (measure(`${chars.slice(0, mid).join("")}\u2026`) <= maxWidth + 1e-6) {
      best = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return `${chars.slice(0, best).join("")}\u2026`;
}
const LABEL_EXTRA_OPTIONS = [
  { key: "sku", label: "\u51FA\u54C1\u8005SKU" },
  { key: "needsExpiry", label: "\u8981\u671F\u9650" },
  { key: "setUnits", label: "\u25EF\u70B9\u5165\uFF08\u30BB\u30C3\u30C8\u5546\u54C1\uFF09" }
];
const LABEL_EXTRA_KEYS = new Set(LABEL_EXTRA_OPTIONS.map((o) => o.key));
function isLabelExtraKey(value) {
  return typeof value === "string" && LABEL_EXTRA_KEYS.has(value);
}
function labelExtraName(key) {
  return LABEL_EXTRA_OPTIONS.find((o) => o.key === key)?.label.replace("\uFF08\u30BB\u30C3\u30C8\u5546\u54C1\uFF09", "") ?? key;
}
function extraText(key, src) {
  if (key === "sku") {
    const sku = String(src.sellerSku ?? "").trim();
    return sku || null;
  }
  if (key === "needsExpiry") return src.expiryManaged === true ? "\u8981\u671F\u9650" : null;
  const n = src.unitsPerSet;
  return typeof n === "number" && Number.isInteger(n) && n > 1 ? `${n}\u70B9\u5165` : null;
}
function extraTexts(src, extras) {
  return extras.map((k) => extraText(k, src)).filter((t) => t !== null);
}
export {
  LABEL_EXTRA_OPTIONS,
  conditionDisplayName,
  extraText,
  extraTexts,
  fitName,
  formatExpiry,
  isLabelExtraKey,
  labelExtraName,
  truncateEndToWidth,
  truncateMiddle,
  visualLength
};
//# sourceMappingURL=text.js.map