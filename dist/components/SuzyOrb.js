"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { SuzySparkle } from "./SuzySparkle.js";
function SuzyOrb({ size = 32, thinking = false, night = false, className, style }) {
  const state = thinking ? "thinking" : night ? "night" : "idle";
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: ["suzy-orb", className].filter(Boolean).join(" "),
      style: { width: size, height: size, ...style },
      "data-state": state,
      children: [
        /* @__PURE__ */ jsx(SuzySparkle, { size: Math.round(size / 2), tone: "white", state }),
        thinking && /* @__PURE__ */ jsx("span", { className: "suzy-ring", "aria-hidden": "true", "data-testid": "suzy-ring" })
      ]
    }
  );
}
export {
  SuzyOrb
};
//# sourceMappingURL=SuzyOrb.js.map