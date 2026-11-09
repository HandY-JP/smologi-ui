"use client";
import { jsx } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { SkeletonBlock } from "./parts.js";
import { ProductLabelFace } from "./ProductLabelFace.js";
import { faceKey, faceSlots } from "../dialog-model.js";
import { renderPdfPages } from "./face-render.js";
const DEBOUNCE_MS = 300;
const RENDER_WIDTH = 560;
const imageCache = /* @__PURE__ */ new Map();
const NONE = { map: /* @__PURE__ */ new Map(), status: "idle" };
function useLabelFaces(targets, settings, source) {
  const { sheet, image, extra, expirySticker } = settings;
  const anyGenerate = Boolean(targets?.some((t) => t.mode === "generate" && t.items.length > 0));
  const requestKey = useMemo(
    () => targets && anyGenerate ? JSON.stringify({ t: targets.map((t) => [t.shipmentId, t.attachmentUrl, t.mode, t.items.length, t.items.map((i) => [i.fnSku, i.productName, i.sellerSku, i.conditionLabel, i.expiration, i.hasImage, i.unitsPerSet ?? null, i.expiryManaged ?? null])]), sheet, image, extra, expirySticker }) : null,
    [targets, anyGenerate, sheet, image, extra, expirySticker]
  );
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!requestKey || !targets) return;
    const cached = imageCache.get(requestKey);
    if (cached) {
      setResult({ key: requestKey, faces: cached, status: "done" });
      return;
    }
    const ctrl = new AbortController();
    const slots = faceSlots(targets, { expirySticker });
    const timer = setTimeout(async () => {
      try {
        const pdf = await source.fetchFacesPdf({ targets, settings: { sheet, image, extra, expirySticker }, signal: ctrl.signal });
        const faces = /* @__PURE__ */ new Map();
        const pages = await renderPdfPages(pdf, RENDER_WIDTH, ctrl.signal, (page, url) => {
          const slot = slots.find((s) => s.page === page);
          if (!slot) return;
          faces.set(faceKey(slot.ref, slot.kind), url);
          setResult({ key: requestKey, faces: new Map(faces), status: "loading" });
        }, () => source.loadPdfjs());
        if (ctrl.signal.aborted) return;
        if (pages !== slots.length) {
          setResult({ key: requestKey, faces: /* @__PURE__ */ new Map(), status: "failed" });
          return;
        }
        setResult({ key: requestKey, faces: new Map(faces), status: "done" });
        if (imageCache.size >= 8) imageCache.delete(imageCache.keys().next().value);
        imageCache.set(requestKey, faces);
      } catch {
        if (!ctrl.signal.aborted) setResult({ key: requestKey, faces: /* @__PURE__ */ new Map(), status: "failed" });
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [requestKey]);
  if (!requestKey) return NONE;
  return result && result.key === requestKey ? { map: result.faces, status: result.status } : LOADING;
}
const LOADING = { map: /* @__PURE__ */ new Map(), status: "loading" };
function LabelFace({ label, faces, options, placeholder = "svg" }) {
  const kind = label.kind === "expiry" ? "expiry" : "label";
  const url = label.faceRef ? faces.map.get(faceKey(label.faceRef, kind)) : void 0;
  if (url) {
    return /* @__PURE__ */ jsx("img", { src: url, alt: "", draggable: false, className: "block h-full w-full object-contain" });
  }
  if (placeholder === "skeleton" && faces.status === "loading") return /* @__PURE__ */ jsx(SkeletonBlock, { className: "h-full w-full" });
  return /* @__PURE__ */ jsx("div", { className: `h-full w-full ${faces.status === "loading" ? "opacity-40" : ""}`, children: /* @__PURE__ */ jsx(ProductLabelFace, { label, options }) });
}
export {
  LabelFace,
  useLabelFaces
};
//# sourceMappingURL=LabelFaceImage.js.map