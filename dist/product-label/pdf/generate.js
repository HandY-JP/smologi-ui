import { jsx, jsxs } from "react/jsx-runtime";
import { Document, Font, Image, Page, Rect, Svg, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { code128Bars } from "../code128.js";
import { computeExpiryBox, EXPIRY_LINE, computeLabelBox, nameRows, MM } from "../label-layout.js";
import { cellRect } from "../sheets.js";
import { applyLabelPrintPreferences } from "./print-prefs.js";
import { extraTexts, formatExpiry } from "../text.js";
import { createTextMeasurer } from "./text-measure.js";
let registeredFonts = "";
function registerFonts(fonts) {
  const key = `${fonts.regular}
${fonts.bold}`;
  if (registeredFonts === key) return;
  Font.register({
    family: "NotoSansJP",
    fonts: [
      { src: fonts.regular, fontWeight: "normal" },
      { src: fonts.bold, fontWeight: "bold" }
    ]
  });
  registeredFonts = key;
}
Font.registerHyphenationCallback((word) => [word]);
function Barcode({ text, box }) {
  const { bars } = code128Bars(text);
  return /* @__PURE__ */ jsx(Svg, { width: box.w, height: box.h, style: { position: "absolute", left: box.x, top: box.y }, children: bars.map((bar, i) => /* @__PURE__ */ jsx(Rect, { x: (box.offsetModules + bar.x) * box.moduleW, y: 0, width: bar.width * box.moduleW, height: box.h, fill: "#000000" }, i)) });
}
function ProductLabel({ item, image, opts, originXmm = 0 }) {
  const withImage = opts.image && image !== null;
  const box = computeLabelBox({
    sheetId: opts.sheet.id,
    originXmm,
    widthMm: opts.sheet.labelW,
    heightMm: opts.sheet.labelH,
    fnSku: item.fnSku,
    withImage,
    condition: item.conditionLabel ?? null,
    measure: opts.measurer.measure,
    extras: extraTexts(item, opts.extra)
  });
  const fs = box.fontSize;
  const rows = nameRows(item.productName, box.text.w, (t) => opts.measurer.measure(t, box.nameFontSize, false), box.nameLines);
  const condition = item.conditionLabel ?? "";
  const own = box.conditionOwnLine;
  return /* @__PURE__ */ jsxs(View, { style: { width: box.width, height: box.height, position: "relative" }, children: [
    /* @__PURE__ */ jsx(Barcode, { text: item.fnSku, box: box.barcode }),
    box.image && image ? /* @__PURE__ */ jsx(Image, { src: { data: image, format: "jpg" }, style: { position: "absolute", left: box.image.x, top: box.image.y, width: box.image.size, height: box.image.size, objectFit: "contain" } }) : null,
    /* @__PURE__ */ jsxs(View, { style: { position: "absolute", left: box.text.x, top: box.text.y, width: box.text.w, height: box.text.h, overflow: "hidden" }, children: [
      own || !condition ? /* @__PURE__ */ jsx(Text, { style: { fontFamily: "NotoSansJP", fontSize: fs, lineHeight: 1.2 }, wrap: false, children: item.fnSku }) : /* @__PURE__ */ jsxs(View, { style: { flexDirection: "row", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ jsx(Text, { style: { fontFamily: "NotoSansJP", fontSize: fs, lineHeight: 1.2 }, wrap: false, children: item.fnSku }),
        /* @__PURE__ */ jsx(Text, { style: { fontFamily: "NotoSansJP", fontSize: box.conditionFontSize, lineHeight: 1.2 }, wrap: false, children: condition })
      ] }),
      own ? /* @__PURE__ */ jsxs(View, { style: { flexDirection: "row", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ jsx(Text, { style: { fontFamily: "NotoSansJP", fontSize: box.conditionFontSize, lineHeight: 1.2 }, wrap: false, children: condition }),
        box.extras[0]?.placement === "withCondition" ? /* @__PURE__ */ jsx(Text, { style: { fontFamily: "NotoSansJP", fontSize: box.extraFontSize, lineHeight: 1.2 }, wrap: false, children: box.extras[0].text }) : null
      ] }) : null,
      rows.map((row, i) => /* @__PURE__ */ jsx(Text, { style: { fontFamily: "NotoSansJP", fontSize: box.nameFontSize, lineHeight: 1.2 }, wrap: false, children: row }, i)),
      box.extras.filter((e) => e.placement === "row").map((e, i) => /* @__PURE__ */ jsx(Text, { style: { fontFamily: "NotoSansJP", fontSize: box.extraFontSize, lineHeight: 1.2 }, wrap: false, children: e.text }, `x${i}`))
    ] })
  ] });
}
function ExpiryLabel({ item, opts }) {
  const parts = formatExpiry(item.expiration);
  const box = computeExpiryBox(opts.sheet.labelW, opts.sheet.labelH, opts.sheet.id);
  const w = opts.sheet.labelW * MM;
  const h = opts.sheet.labelH * MM;
  const big = { fontFamily: "NotoSansJP", fontSize: box.bigSize, lineHeight: EXPIRY_LINE, fontWeight: "bold" };
  const head = { fontFamily: "NotoSansJP", fontSize: box.headingSize, lineHeight: 1, height: box.headingLineH, textAlign: "center" };
  const left = (w - box.blockW) / 2;
  return /* @__PURE__ */ jsxs(View, { style: { width: w, height: h, position: "relative" }, children: [
    /* @__PURE__ */ jsxs(View, { style: { position: "absolute", left, top: box.centerY - box.blockH / 2, height: box.blockH, flexDirection: "row", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxs(View, { style: { width: box.headingW, marginRight: box.gap }, children: [
        /* @__PURE__ */ jsx(Text, { style: head, wrap: false, children: "\u671F" }),
        /* @__PURE__ */ jsx(Text, { style: head, wrap: false, children: "\u9650" })
      ] }),
      /* @__PURE__ */ jsxs(View, { style: { width: box.columnW, alignItems: "center" }, children: [
        /* @__PURE__ */ jsx(Text, { style: big, wrap: false, children: parts?.year ?? "" }),
        /* @__PURE__ */ jsx(Text, { style: big, wrap: false, children: parts?.monthDay ?? "" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Text, { style: { position: "absolute", left: 0, width: w, top: box.footer.y, textAlign: "center", fontFamily: "NotoSansJP", fontSize: box.footer.size, lineHeight: 1.2 }, wrap: false, children: item.fnSku })
  ] });
}
async function renderDrawnPdf(placements, pageCount, input, fonts) {
  registerFonts(fonts);
  const opts = { ...input, measurer: await createTextMeasurer(fonts) };
  const { sheet } = opts;
  const pageSize = [sheet.pageW * MM, sheet.pageH * MM];
  const byPage = /* @__PURE__ */ new Map();
  for (const p of placements) {
    const list = byPage.get(p.page) ?? [];
    list.push(p);
    byPage.set(p.page, list);
  }
  const pages = Array.from({ length: Math.max(1, pageCount) }, (_, i) => i);
  const raw = await renderToBuffer(
    /* @__PURE__ */ jsx(Document, { title: "\u5546\u54C1\u30E9\u30D9\u30EB", children: pages.map((pageIndex) => /* @__PURE__ */ jsx(Page, { size: pageSize, style: { position: "relative" }, children: (byPage.get(pageIndex) ?? []).map((p, i) => {
      const rect = cellRect(sheet, p.row, p.col, opts.offsetXmm, opts.offsetYmm);
      return /* @__PURE__ */ jsx(View, { style: { position: "absolute", left: rect.x * MM, top: rect.y * MM, width: rect.w * MM, height: rect.h * MM }, children: p.label.kind === "product" ? /* @__PURE__ */ jsx(ProductLabel, { item: p.label.item, image: p.label.image, opts, originXmm: rect.x }) : /* @__PURE__ */ jsx(ExpiryLabel, { item: p.label.item, opts }) }, i);
    }) }, pageIndex)) })
  );
  return applyLabelPrintPreferences(raw);
}
async function renderFacesPdf(labels, input, fonts) {
  registerFonts(fonts);
  const opts = input;
  const full = { ...opts, offsetXmm: 0, offsetYmm: 0, measurer: await createTextMeasurer(fonts) };
  const pageSize = [opts.sheet.labelW * MM, opts.sheet.labelH * MM];
  return renderToBuffer(
    /* @__PURE__ */ jsx(Document, { title: "\u5546\u54C1\u30E9\u30D9\u30EB\u898B\u672C", children: labels.map((label, i) => /* @__PURE__ */ jsx(Page, { size: pageSize, style: { position: "relative" }, wrap: false, children: label.kind === "product" ? /* @__PURE__ */ jsx(ProductLabel, { item: label.item, image: label.image, opts: full }) : /* @__PURE__ */ jsx(ExpiryLabel, { item: label.item, opts: full }) }, i)) })
  );
}
export {
  renderDrawnPdf,
  renderFacesPdf
};
//# sourceMappingURL=generate.js.map