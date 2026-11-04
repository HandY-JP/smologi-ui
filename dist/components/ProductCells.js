import { jsx, jsxs } from "react/jsx-runtime";
import {
  FLAT_CODE_PRIMARY_CLASS,
  FLAT_CODE_SECONDARY_CLASS,
  FLAT_NAME_PRIMARY_CLASS,
  FLAT_NAME_PRIMARY_COLOR_CLASS,
  FLAT_NAME_SECONDARY_COLOR_CLASS,
  FLAT_NAME_SECONDARY_CLASS
} from "../lib/flat-table.js";
function ProductCodeStack({
  primary,
  secondary,
  primaryClassName = FLAT_CODE_PRIMARY_CLASS,
  secondaryClassName = FLAT_CODE_SECONDARY_CLASS
}) {
  const hasPrimary = primary != null && primary !== false;
  const hasSecondary = secondary != null && secondary !== false;
  return /* @__PURE__ */ jsxs("div", { className: "flex h-14 flex-col overflow-hidden", children: [
    hasPrimary && /* @__PURE__ */ jsx("div", { className: `min-w-0 truncate ${primaryClassName}`, children: primary }),
    hasSecondary && /* @__PURE__ */ jsx(
      "div",
      {
        className: hasPrimary ? `mt-auto min-w-0 pt-0.5 truncate ${secondaryClassName}` : "min-w-0 truncate text-[15px] leading-[22px] tabular-nums text-[rgb(var(--ink))]",
        children: secondary
      }
    )
  ] });
}
function ProductNameStack({
  primary,
  badges,
  secondary,
  primaryColorClassName = FLAT_NAME_PRIMARY_COLOR_CLASS,
  secondaryColorClassName = FLAT_NAME_SECONDARY_COLOR_CLASS
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex h-14 flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 items-start gap-2 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "min-w-0 flex-1", children: /* @__PURE__ */ jsx("div", { className: `${FLAT_NAME_PRIMARY_CLASS} ${primaryColorClassName}`, children: primary }) }),
      badges
    ] }),
    secondary != null && secondary !== false && /* @__PURE__ */ jsx("div", { className: `${FLAT_NAME_SECONDARY_CLASS} ${secondaryColorClassName}`, children: secondary })
  ] });
}
export {
  ProductCodeStack,
  ProductNameStack
};
//# sourceMappingURL=ProductCells.js.map