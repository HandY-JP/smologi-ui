"use client";
const MORE_SAMPLE_LABEL = "\uFF0B99 \u25BE";
const FALLBACK_MORE_WIDTH_PX = 44;
let host = null;
const widthCache = /* @__PURE__ */ new Map();
let moreWidthPx = null;
function cacheKey(item) {
  const count = item.count > 999 ? "999+" : String(item.count);
  return `${item.label}${count}${item.dotClassName ? "1" : "0"}`;
}
function ensureHost() {
  if (typeof document === "undefined") return null;
  if (host && host.isConnected) return host;
  host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;left:0;top:0;z-index:-1;visibility:hidden;pointer-events:none;display:flex;gap:3px;white-space:nowrap;";
  document.body.appendChild(host);
  return host;
}
function buildButton(item) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "sb-section-jump";
  if (!item) {
    button.textContent = MORE_SAMPLE_LABEL;
    return button;
  }
  if (item.dotClassName) {
    const dot = document.createElement("span");
    dot.className = `sb-section-jump-dot ${item.dotClassName}`;
    button.appendChild(dot);
  }
  const label = document.createElement("span");
  label.className = "sb-section-jump-label";
  label.textContent = item.label;
  button.appendChild(label);
  const count = document.createElement("b");
  count.textContent = item.count > 999 ? "999+" : String(item.count);
  button.appendChild(count);
  return button;
}
function measureSectionJumpWidths(items) {
  const widths = /* @__PURE__ */ new Map();
  const missing = items.filter((item) => !widthCache.has(cacheKey(item)));
  const needMore = moreWidthPx == null;
  if (missing.length > 0 || needMore) {
    const container = ensureHost();
    if (container) {
      container.textContent = "";
      const nodes = missing.map((item) => {
        const node = buildButton(item);
        container.appendChild(node);
        return node;
      });
      const moreNode = needMore ? container.appendChild(buildButton(null)) : null;
      missing.forEach((item, index) => {
        widthCache.set(cacheKey(item), nodes[index].getBoundingClientRect().width);
      });
      if (moreNode) moreWidthPx = moreNode.getBoundingClientRect().width;
      container.textContent = "";
    }
  }
  for (const item of items) widths.set(item.key, widthCache.get(cacheKey(item)) ?? 0);
  return { widths, moreWidthPx: moreWidthPx ?? FALLBACK_MORE_WIDTH_PX };
}
export {
  measureSectionJumpWidths
};
//# sourceMappingURL=section-jump-measure.js.map
