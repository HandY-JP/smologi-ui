"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { SettingsToggle } from "../SettingsRow.js";
function ProcessToggleList({
  items,
  onToggle
}) {
  return /* @__PURE__ */ jsx("ul", { className: "sb-int m-0 flex list-none flex-col gap-3 p-0", children: items.map((it) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2.5", children: [
    /* @__PURE__ */ jsx("div", { className: "mt-0.5 flex min-w-9 flex-none justify-center", children: it.readOnly ? null : /* @__PURE__ */ jsx(
      SettingsToggle,
      {
        id: `sb-int-toggle-${it.id}`,
        label: it.label,
        checked: it.checked,
        disabled: it.disabled || it.saving,
        onChange: (next) => onToggle(it.id, next)
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 text-[13px] leading-[20px] font-semibold", children: [
        it.label,
        it.readOnly && /* @__PURE__ */ jsx("span", { className: "sb-int-chip", children: it.readOnlyText ?? "\u5E38\u306B\u884C\u3044\u307E\u3059" }),
        it.saving && /* @__PURE__ */ jsx("span", { className: "sb-int-muted text-[12px] leading-[18px] font-normal", "aria-live": "polite", children: "\u4FDD\u5B58\u4E2D\u2026" })
      ] }),
      it.description && /* @__PURE__ */ jsx("div", { className: "sb-int-muted text-[12px] leading-[18px]", children: it.description })
    ] })
  ] }, it.id)) });
}
export {
  ProcessToggleList
};
//# sourceMappingURL=ProcessToggleList.js.map