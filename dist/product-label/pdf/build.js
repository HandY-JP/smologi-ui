import { LabelPrintError } from "../errors.js";
import { layoutLabels, sheetOrDefault } from "../sheets.js";
import { formatExpiry } from "../text.js";
import { renderDrawnPdf, renderFacesPdf } from "./generate.js";
import { fetchLabelImage } from "./image-fetch.js";
const MAX_TOTAL_LABELS = 5e3;
const MAX_FACE_PAGES = 300;
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (; ; ) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}
async function collectImages(groups, fetchImage) {
  const images = /* @__PURE__ */ new Map();
  const urls = Array.from(new Set(groups.flatMap((g) => g.items.map((i) => i.imageUrl).filter((u) => Boolean(u)))));
  const fetched = await mapLimit(urls, 4, (url) => fetchImage(url));
  urls.forEach((url, i) => images.set(url, fetched[i]));
  return images;
}
async function buildFacesPdf(input) {
  const { groups, options } = input;
  const dest = sheetOrDefault(options.sheet);
  const fetchImage = input.fetchImage ?? fetchLabelImage;
  const images = options.image ? await collectImages(groups, fetchImage) : /* @__PURE__ */ new Map();
  const labels = [];
  for (const g of groups) {
    for (const item of g.items) {
      labels.push({ kind: "product", item, image: item.imageUrl ? images.get(item.imageUrl) ?? null : null });
      if (options.expirySticker && formatExpiry(item.expiration)) labels.push({ kind: "expiry", item, image: null });
    }
  }
  if (labels.length === 0) throw new LabelPrintError("\u898B\u672C\u306B\u3067\u304D\u308B\u30E9\u30D9\u30EB\u304C\u3042\u308A\u307E\u305B\u3093\u3002");
  if (labels.length > MAX_FACE_PAGES) throw new LabelPrintError(`\u898B\u672C\u306B\u3067\u304D\u308B\u30E9\u30D9\u30EB\u306F${MAX_FACE_PAGES}\u679A\u307E\u3067\u3067\u3059\u3002`);
  return renderFacesPdf(labels, { sheet: dest, image: options.image, extra: options.extra }, input.fonts);
}
async function buildProductLabelPdf(input) {
  const { groups, options } = input;
  const dest = sheetOrDefault(options.sheet);
  const fetchImage = input.fetchImage ?? fetchLabelImage;
  const images = options.image ? await collectImages(groups, fetchImage) : /* @__PURE__ */ new Map();
  const labels = [];
  for (const g of groups) {
    for (const item of g.items) {
      const image = item.imageUrl ? images.get(item.imageUrl) ?? null : null;
      for (let n = 0; n < item.quantity; n += 1) labels.push({ kind: "product", item, image });
      if (options.expirySticker && formatExpiry(item.expiration)) {
        for (let n = 0; n < item.quantity; n += 1) labels.push({ kind: "expiry", item, image: null });
      }
    }
  }
  if (labels.length === 0) throw new LabelPrintError("\u5370\u5237\u3059\u308B\u30E9\u30D9\u30EB\u304C\u3042\u308A\u307E\u305B\u3093\u3002");
  if (labels.length > MAX_TOTAL_LABELS) {
    throw new LabelPrintError(`\u4E00\u5EA6\u306B\u5370\u5237\u3067\u304D\u308B\u30E9\u30D9\u30EB\u306F${MAX_TOTAL_LABELS}\u679A\u307E\u3067\u3067\u3059\uFF08\u5BFE\u8C61\u306F${labels.length}\u679A\uFF09\u3002`);
  }
  const placements = layoutLabels(dest, options.order, options.start, labels.length);
  const pageCount = placements.reduce((m, p) => Math.max(m, p.page + 1), 0);
  const drawn = labels.map((label, i) => ({ ...placements[i], label }));
  return renderDrawnPdf(
    drawn,
    pageCount,
    { sheet: dest, image: options.image, extra: options.extra, offsetXmm: options.offsetXmm, offsetYmm: options.offsetYmm },
    input.fonts
  );
}
export {
  MAX_FACE_PAGES,
  MAX_TOTAL_LABELS,
  buildFacesPdf,
  buildProductLabelPdf
};
//# sourceMappingURL=build.js.map