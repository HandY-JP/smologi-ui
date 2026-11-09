"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { memo } from "react";
import { code128Bars } from "../code128.js";
import { cellLabelBox, nameMeasurer } from "../dialog-model.js";
import { computeExpiryBox, EXPIRY_LINE, nameRows, MM } from "../label-layout.js";
import { formatExpiry } from "../text.js";
const FONT = "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif";
const INK = "#000";
function Txt({ x, y, size, bold, end, children }) {
  return /* @__PURE__ */ jsx("text", { x, y, fontSize: size, fontWeight: bold ? 700 : 400, fontFamily: FONT, fill: INK, dominantBaseline: "central", textAnchor: end ? "end" : "start", children });
}
function productFace(label, o) {
  const box = cellLabelBox(label, { labelW: o.labelW, labelH: o.labelH, id: o.sheetId }, o);
  const fnSku = label.fnSku ?? "";
  const condition = label.conditionLabel ?? "";
  const fs = box.fontSize;
  const lh = box.lineHeight;
  const { bars } = code128Bars(fnSku);
  const withCond = box.extras.find((e) => e.placement === "withCondition");
  const nameLines = nameRows(label.name ?? "", box.text.w, nameMeasurer(label.nameCharEm, box.nameFontSize), box.nameLines);
  const tx = box.text.x;
  let y = box.text.y;
  const rows = [];
  const mid = (h) => y + h / 2;
  if (box.conditionOwnLine || !condition) {
    rows.push(/* @__PURE__ */ jsx(Txt, { x: tx, y: mid(lh), size: fs, children: fnSku }, "f"));
  } else {
    rows.push(/* @__PURE__ */ jsx(Txt, { x: tx, y: mid(lh), size: fs, children: fnSku }, "f"));
    rows.push(/* @__PURE__ */ jsx(Txt, { x: tx + box.text.w, y: mid(lh), size: box.conditionFontSize, end: true, children: condition }, "c"));
  }
  y += lh;
  if (box.conditionOwnLine) {
    const rowH = Math.max(box.conditionFontSize, withCond ? box.extraFontSize : 0) * 1.2;
    rows.push(/* @__PURE__ */ jsx(Txt, { x: tx, y: mid(rowH), size: box.conditionFontSize, children: condition }, "c2"));
    if (withCond) rows.push(/* @__PURE__ */ jsx(Txt, { x: tx + box.text.w, y: mid(rowH), size: box.extraFontSize, end: true, children: withCond.text }, "e2"));
    y += rowH;
  }
  nameLines.forEach((line, i) => {
    rows.push(/* @__PURE__ */ jsx(Txt, { x: tx, y: mid(box.nameFontSize * 1.2), size: box.nameFontSize, children: line }, `n${i}`));
    y += box.nameFontSize * 1.2;
  });
  box.extras.filter((e) => e.placement === "row").forEach((e, i) => {
    rows.push(/* @__PURE__ */ jsx(Txt, { x: tx, y: mid(box.extraFontSize * 1.2), size: box.extraFontSize, children: e.text }, `e${i}`));
    y += box.extraFontSize * 1.2;
  });
  const b = box.barcode;
  return /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${box.width} ${box.height}`, width: "100%", height: "100%", preserveAspectRatio: "xMidYMid meet", "aria-hidden": true, style: { display: "block" }, children: [
    bars.map((bar, i) => /* @__PURE__ */ jsx("rect", { x: b.x + (b.offsetModules + bar.x) * b.moduleW, y: b.y, width: bar.width * b.moduleW, height: b.h, fill: INK }, i)),
    box.image && /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx("rect", { x: box.image.x, y: box.image.y, width: box.image.size, height: box.image.size, fill: "#e5e5e5", stroke: "#bdbdbd", strokeWidth: 0.4 }),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: `M${box.image.x + box.image.size * 0.2} ${box.image.y + box.image.size * 0.72} L${box.image.x + box.image.size * 0.42} ${box.image.y + box.image.size * 0.45} L${box.image.x + box.image.size * 0.58} ${box.image.y + box.image.size * 0.62} L${box.image.x + box.image.size * 0.68} ${box.image.y + box.image.size * 0.52} L${box.image.x + box.image.size * 0.8} ${box.image.y + box.image.size * 0.72} Z`,
          fill: "#bdbdbd"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("svg", { x: box.text.x, y: box.text.y, width: box.text.w, height: box.text.h, viewBox: `${box.text.x} ${box.text.y} ${box.text.w} ${box.text.h}`, overflow: "hidden", children: rows })
  ] });
}
function expiryFace(label, o) {
  const parts = formatExpiry(label.expiration);
  const box = computeExpiryBox(o.labelW, o.labelH, o.sheetId);
  const w = o.labelW * MM;
  const h = o.labelH * MM;
  const x0 = (w - box.blockW) / 2;
  const cy = box.centerY;
  const lineH = box.bigSize * EXPIRY_LINE;
  const headX = x0 + box.headingW / 2;
  const colX = x0 + box.headingW + box.gap + box.columnW / 2;
  return /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${w} ${h}`, width: "100%", height: "100%", preserveAspectRatio: "xMidYMid meet", "aria-hidden": true, style: { display: "block" }, children: [
    /* @__PURE__ */ jsxs("g", { textAnchor: "middle", fontSize: box.headingSize, fontFamily: FONT, fill: INK, dominantBaseline: "central", children: [
      /* @__PURE__ */ jsx("text", { x: headX, y: cy - box.headingLineH / 2, children: "\u671F" }),
      /* @__PURE__ */ jsx("text", { x: headX, y: cy + box.headingLineH / 2, children: "\u9650" })
    ] }),
    /* @__PURE__ */ jsxs("g", { textAnchor: "middle", children: [
      /* @__PURE__ */ jsx("text", { x: colX, y: cy - lineH / 2, fontSize: box.bigSize, fontWeight: 700, fontFamily: FONT, fill: INK, dominantBaseline: "central", children: parts?.year ?? "" }),
      /* @__PURE__ */ jsx("text", { x: colX, y: cy + lineH / 2, fontSize: box.bigSize, fontWeight: 700, fontFamily: FONT, fill: INK, dominantBaseline: "central", children: parts?.monthDay ?? "" })
    ] }),
    /* @__PURE__ */ jsx("text", { x: w / 2, y: box.footer.y + box.footer.lineH / 2, fontSize: box.footer.size, fontFamily: FONT, fill: INK, dominantBaseline: "central", textAnchor: "middle", children: label.fnSku ?? "" })
  ] });
}
const cache = /* @__PURE__ */ new Map();
function ProductLabelFaceBase({ label, options }) {
  const key = [
    label.kind,
    label.fnSku,
    label.name,
    label.expiration,
    label.sellerSku,
    label.conditionLabel,
    label.fnSkuEm,
    label.conditionEm,
    label.skuEm,
    label.hasImage,
    label.unitsPerSet,
    label.expiryManaged,
    JSON.stringify(label.extraEm ?? null),
    options.sheetId,
    options.labelW,
    options.labelH,
    options.image,
    options.extra.join(",")
  ].join("");
  let node = cache.get(key);
  if (!node) {
    node = label.kind === "expiry" ? expiryFace(label, options) : productFace(label, options);
    if (cache.size > 300) cache.clear();
    cache.set(key, node);
  }
  return /* @__PURE__ */ jsx(Fragment, { children: node });
}
const ProductLabelFace = memo(
  ProductLabelFaceBase,
  (a, b) => a.label === b.label || a.label.kind === b.label.kind && a.label.fnSku === b.label.fnSku && a.label.name === b.label.name && a.label.expiration === b.label.expiration && a.label.sellerSku === b.label.sellerSku && a.label.conditionLabel === b.label.conditionLabel && a.label.hasImage === b.label.hasImage && a.options.sheetId === b.options.sheetId && a.options.labelW === b.options.labelW && a.options.labelH === b.options.labelH && a.options.image === b.options.image && a.label.unitsPerSet === b.label.unitsPerSet && a.label.expiryManaged === b.label.expiryManaged && a.options.extra.join(",") === b.options.extra.join(",")
);
export {
  ProductLabelFace
};
//# sourceMappingURL=ProductLabelFace.js.map