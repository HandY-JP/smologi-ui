"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { SuzySparkle } from "./SuzySparkle.js";
import { useBottomBarHeightVar } from "../lib/use-bottom-bar-height-var.js";
const SUZY_LAUNCHER_LABEL = "\u30B9\u30FC\u30B8\u30FC\u306B\u8CEA\u554F";
function SuzyLauncher({
  state = "idle",
  showLabel = false,
  label = SUZY_LAUNCHER_LABEL,
  badge,
  badgeTestId,
  open = false,
  hidden = false,
  bubble,
  bounce = false,
  placement = "fixed",
  wrapClassName,
  className,
  title,
  type = "button",
  "aria-label": ariaLabel,
  ...rest
}) {
  useBottomBarHeightVar(placement === "fixed");
  const button = /* @__PURE__ */ jsxs(
    "button",
    {
      type,
      "aria-label": ariaLabel ?? label,
      "aria-expanded": open,
      title: title ?? label,
      "data-state": state,
      className: [
        "suzy-launcher",
        showLabel ? "suzy-launcher--label" : "",
        bounce ? "suzy-launcher--bounce" : "",
        open ? "is-open" : "",
        className
      ].filter(Boolean).join(" "),
      ...rest,
      children: [
        /* @__PURE__ */ jsx(SuzySparkle, { size: 22, state, className: "suzy-launcher__star" }),
        showLabel && /* @__PURE__ */ jsx("span", { className: "suzy-launcher__label", children: label }),
        state === "thinking" && /* @__PURE__ */ jsx("span", { className: "suzy-ring", "aria-hidden": "true", "data-testid": "suzy-ring" }),
        badge ? /* @__PURE__ */ jsx("span", { "data-testid": badgeTestId, "aria-hidden": "true", className: "suzy-launcher__badge", children: badge }) : null
      ]
    }
  );
  if (placement === "inline") return button;
  return /* @__PURE__ */ jsxs("div", { className: ["suzy-launcher-wrap", wrapClassName].filter(Boolean).join(" "), "data-hidden": hidden ? "true" : void 0, children: [
    button,
    bubble ? /* @__PURE__ */ jsx("span", { role: "status", className: "suzy-launcher__bubble", children: bubble }) : null
  ] });
}
export {
  SUZY_LAUNCHER_LABEL,
  SuzyLauncher
};
//# sourceMappingURL=SuzyLauncher.js.map