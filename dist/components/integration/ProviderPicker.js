"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { IntegrationLogo } from "./IntegrationHeader.js";
function ProviderPicker({
  providers,
  onSelect
}) {
  return /* @__PURE__ */ jsx("ul", { className: "sb-int m-0 grid list-none gap-2 p-0", children: providers.map(({ meta, description, comingSoon }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      disabled: comingSoon,
      "aria-disabled": comingSoon || void 0,
      onClick: () => {
        if (!comingSoon) onSelect(meta.id);
      },
      className: "sb-int-card sb-int-pick flex w-full items-center gap-3 rounded-[10px] px-3.5 py-3 text-left disabled:cursor-not-allowed disabled:opacity-60",
      children: [
        /* @__PURE__ */ jsx(IntegrationLogo, { meta, size: "sm" }),
        /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("span", { className: "block font-semibold", children: meta.label }),
          description && /* @__PURE__ */ jsx("span", { className: "sb-int-muted block text-[12px] leading-[18px]", children: description })
        ] }),
        comingSoon && /* @__PURE__ */ jsx("span", { className: "sb-int-chip flex-none", children: "\u6E96\u5099\u4E2D" })
      ]
    }
  ) }, meta.id)) });
}
export {
  ProviderPicker
};
//# sourceMappingURL=ProviderPicker.js.map