"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { derivedThumbnailUrl } from "../lib/product-thumbnail-url.js";
const SIZE_CLASSES = {
  xs: "w-7 h-7",
  sm: "w-9 h-9",
  md: "w-12 h-12",
  header: "w-14 h-14",
  lg: "w-16 h-16",
  xl: "w-20 h-20"
};
const SIZE_PIXELS = {
  xs: 28,
  sm: 36,
  md: 48,
  header: 56,
  lg: 64,
  xl: 80
};
function ProductThumb({
  src,
  thumbnailUrl,
  alt,
  size = "sm",
  enlargeOnClick = true,
  fill = false,
  boxClassName,
  boxPixels,
  placeholder = "image"
}) {
  const [failed, setFailed] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const sizeCls = boxClassName ?? (fill ? "w-full aspect-square" : SIZE_CLASSES[size]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      setOpen(false);
    };
    window.addEventListener("keydown", onKey, true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);
  if (!src || failed) {
    return /* @__PURE__ */ jsx("div", { className: `${sizeCls} rounded bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-300`, "aria-hidden": true, children: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 1.5, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: placeholder === "box" ? "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" : "M4 5h16v14H4z M8 13l3-3 4 4 2-2 3 3"
      }
    ) }) });
  }
  const generated = thumbFailed ? null : (thumbnailUrl ?? "").trim() || null;
  const retina = generated ? derivedThumbnailUrl(generated, 240) : null;
  const displaySrc = generated ?? src;
  const pixels = boxClassName ? boxPixels : fill ? void 0 : SIZE_PIXELS[size];
  const thumb = (
    // eslint-disable-next-line @next/next/no-img-element
    /* @__PURE__ */ jsx(
      "img",
      {
        src: displaySrc,
        srcSet: retina ? `${generated} 1x, ${retina} 2x` : void 0,
        alt,
        loading: "lazy",
        decoding: "async",
        width: pixels,
        height: pixels,
        onError: () => {
          if (generated) setThumbFailed(true);
          else setFailed(true);
        },
        className: `${sizeCls} rounded object-contain flex-shrink-0 ${enlargeOnClick ? "cursor-zoom-in hover:ring-2 hover:ring-blue-300 transition" : ""}`
      }
    )
  );
  if (!enlargeOnClick) return thumb;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: (e) => {
          e.stopPropagation();
          setOpen(true);
        },
        "aria-label": `${alt} \u3092\u62E1\u5927\u8868\u793A`,
        className: `${fill ? "flex w-full" : "inline-flex"} p-0 border-0 bg-transparent`,
        children: thumb
      }
    ),
    open && createPortal(
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6",
          onClick: () => setOpen(false),
          role: "dialog",
          "aria-modal": "true",
          "aria-label": "\u5546\u54C1\u753B\u50CF\u30D7\u30EC\u30D3\u30E5\u30FC",
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  setOpen(false);
                },
                "aria-label": "\u9589\u3058\u308B",
                className: "absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center",
                children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", strokeWidth: 2.5, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) })
              }
            ),
            /* @__PURE__ */ jsx(
              "img",
              {
                src,
                alt,
                onClick: (e) => e.stopPropagation(),
                className: "max-h-[90vh] max-w-[90vw] object-contain rounded shadow-2xl bg-white"
              }
            ),
            alt && /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 max-w-[80vw] text-center text-xs text-white/80 bg-black/40 rounded-full px-3 py-1 truncate", children: alt })
          ]
        }
      ),
      document.body
    )
  ] });
}
export {
  ProductThumb
};
//# sourceMappingURL=ProductThumb.js.map
