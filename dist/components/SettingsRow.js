"use client";
import { jsx, jsxs } from "react/jsx-runtime";
function SettingsRow({
  label,
  hint,
  htmlFor,
  children,
  /** ラベルを付けない（説明文だけの行・表を丸ごと置く行）。 */
  full = false
}) {
  if (full) return /* @__PURE__ */ jsx("div", { className: "min-w-0", children });
  return /* @__PURE__ */ jsxs("div", { className: "grid gap-1.5 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-start sm:gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "pt-1.5", children: [
      label && /* @__PURE__ */ jsx("label", { htmlFor, className: "block text-sm font-medium text-gray-700", children: label }),
      hint && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[11px] leading-4 text-gray-400", children: hint })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "min-w-0", children })
  ] });
}
const SETTINGS_INPUT_CLASS = "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--sb-accent-bg)] focus:outline-none focus:ring-1 focus:ring-[var(--sb-accent-bg)] disabled:bg-gray-50 disabled:text-gray-400";
const SETTINGS_GHOST_BUTTON_CLASS = "inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";
function SettingsToggle({
  checked,
  onChange,
  disabled = false,
  label,
  id
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      id,
      role: "switch",
      "aria-checked": checked,
      "aria-label": label,
      disabled,
      onClick: () => onChange(!checked),
      className: `relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${checked ? "bg-[var(--sb-accent-bg)]" : "bg-gray-300"} ${disabled ? "cursor-not-allowed opacity-50" : ""}`,
      children: /* @__PURE__ */ jsx(
        "span",
        {
          "aria-hidden": true,
          style: { backgroundColor: "#fff" },
          className: `inline-block h-3.5 w-3.5 transform rounded-full shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`
        }
      )
    }
  );
}
export {
  SETTINGS_GHOST_BUTTON_CLASS,
  SETTINGS_INPUT_CLASS,
  SettingsRow,
  SettingsToggle
};
//# sourceMappingURL=SettingsRow.js.map
