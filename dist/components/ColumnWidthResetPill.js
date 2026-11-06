"use client";
import { jsx, jsxs } from "react/jsx-runtime";
function ColumnWidthResetPill({
  customized,
  onReset,
  suppress = false,
  text = "\u5217\u5E45\u3092\u5909\u3048\u3066\u3044\u307E\u3059",
  buttonLabel = "\u5143\u306B\u623B\u3059"
}) {
  if (!customized || suppress) return null;
  return /* @__PURE__ */ jsx("div", { "data-bottom-bar": true, className: "sb-bulk-layer", children: /* @__PURE__ */ jsxs("div", { role: "group", "aria-label": "\u5217\u5E45", className: "sb-glass-chip sb-colw-pill", children: [
    /* @__PURE__ */ jsx("span", { className: "sb-colw-pill-text", children: text }),
    /* @__PURE__ */ jsx("button", { type: "button", className: "sb-colw-pill-btn", onClick: onReset, children: buttonLabel })
  ] }) });
}
var ColumnWidthResetPill_default = ColumnWidthResetPill;
export {
  ColumnWidthResetPill,
  ColumnWidthResetPill_default as default
};
//# sourceMappingURL=ColumnWidthResetPill.js.map
