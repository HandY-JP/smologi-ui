"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useId } from "react";
const SUZY_SPARKLE_SIMPLE_MAX_SIZE = 13;
function star(cx, cy, r, w) {
  return `M${cx} ${cy - r}Q${cx + w} ${cy - w} ${cx + r} ${cy}Q${cx + w} ${cy + w} ${cx} ${cy + r}Q${cx - w} ${cy + w} ${cx - r} ${cy}Q${cx - w} ${cy - w} ${cx} ${cy - r}Z`;
}
function Facets({ cx, cy, r, w, white }) {
  const q = (x1, y1, cxp, cyp, x2, y2, fill, opacity, key) => opacity > 0 ? /* @__PURE__ */ jsx("path", { d: `M${x1} ${y1}Q${cxp} ${cyp} ${x2} ${y2}L${cx} ${cy}Z`, fill, opacity }, key) : null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    q(cx, cy - r, cx + w, cy - w, cx + r, cy, "#fff", white ? 0 : 0.42, "tr"),
    q(cx, cy - r, cx - w, cy - w, cx - r, cy, "#fff", white ? 0 : 0.16, "tl"),
    q(cx, cy + r, cx - w, cy + w, cx - r, cy, "#1a1033", white ? 0.14 : 0.22, "bl"),
    q(cx, cy + r, cx + w, cy + w, cx + r, cy, "#1a1033", white ? 0.06 : 0.08, "br")
  ] });
}
function SuzySparkle({ size = 22, tone = "color", state = "idle", simplified, className, style, title }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `suzy-g-${uid}`;
  const glintId = `suzy-m-${uid}`;
  const clipId = `suzy-c-${uid}`;
  const white = tone === "white";
  const simple = simplified ?? size <= SUZY_SPARKLE_SIMPLE_MAX_SIZE;
  const fill = white ? "#fff" : `url(#${gradId})`;
  const cls = ["suzy-sparkle", `suzy-sparkle--${state}`, className].filter(Boolean).join(" ");
  const a11y = title ? { role: "img", "aria-label": title } : { "aria-hidden": true };
  const gradient = white ? null : /* @__PURE__ */ jsxs("linearGradient", { id: gradId, x1: "0", y1: "0", x2: "1", y2: "1", children: [
    /* @__PURE__ */ jsx("stop", { offset: "0", style: { stopColor: "rgb(var(--accent, 234 88 12))" } }),
    /* @__PURE__ */ jsx("stop", { offset: "0.55", style: { stopColor: "rgb(var(--cat-5-solid, 139 92 246))" } }),
    /* @__PURE__ */ jsx("stop", { offset: "1", style: { stopColor: "rgb(var(--cat-1-solid, 59 130 246))" } })
  ] });
  if (simple) {
    return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: size, height: size, className: cls, style, "data-suzy-glyph": "simple", ...a11y, children: [
      gradient && /* @__PURE__ */ jsx("defs", { children: gradient }),
      /* @__PURE__ */ jsx("path", { d: star(10.6, 13.2, 10, 3), fill }),
      /* @__PURE__ */ jsx("path", { d: star(19.4, 4.6, 3.3, 0.95), fill })
    ] });
  }
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: size, height: size, className: cls, style, "data-suzy-glyph": "full", ...a11y, children: [
    /* @__PURE__ */ jsxs("defs", { children: [
      gradient,
      !white && /* @__PURE__ */ jsxs("linearGradient", { id: glintId, x1: "0", y1: "0", x2: "1", y2: "0", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0", stopColor: "#fff", stopOpacity: "0" }),
        /* @__PURE__ */ jsx("stop", { offset: "0.5", stopColor: "#fff", stopOpacity: "0.7" }),
        /* @__PURE__ */ jsx("stop", { offset: "1", stopColor: "#fff", stopOpacity: "0" })
      ] }),
      /* @__PURE__ */ jsx("clipPath", { id: clipId, children: /* @__PURE__ */ jsx("path", { d: star(10.6, 13.2, 9.6, 2.7) }) })
    ] }),
    /* @__PURE__ */ jsxs("g", { children: [
      /* @__PURE__ */ jsx("path", { d: star(10.6, 13.2, 9.6, 2.7), fill }),
      /* @__PURE__ */ jsx(Facets, { cx: 10.6, cy: 13.2, r: 9.6, w: 2.7, white }),
      !white && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("g", { clipPath: `url(#${clipId})`, children: /* @__PURE__ */ jsx("rect", { className: "suzy-glint", x: "3.6", y: "-1", width: "5", height: "28", fill: `url(#${glintId})`, style: { transform: "translateX(-14px)" } }) }),
        /* @__PURE__ */ jsx("circle", { cx: "8", cy: "9.9", r: "0.8", fill: "#fff", opacity: "0.9" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("g", { children: /* @__PURE__ */ jsx("path", { className: "suzy-twinkle", d: star(19.4, 4.6, 3.1, 0.8), fill, style: { transformBox: "fill-box", transformOrigin: "center" } }) })
  ] });
}
export {
  SUZY_SPARKLE_SIMPLE_MAX_SIZE,
  SuzySparkle
};
//# sourceMappingURL=SuzySparkle.js.map