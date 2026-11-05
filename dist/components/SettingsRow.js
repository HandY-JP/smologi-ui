"use client";
import { jsx, jsxs } from "react/jsx-runtime";
function SettingsRow({
  label,
  hint,
  htmlFor,
  children,
  /** ラベルを付けない（説明文だけの行・表を丸ごと置く行）。上限幅も掛けない＝全幅。 */
  full = false,
  layout = "default"
}) {
  if (full) return /* @__PURE__ */ jsx("div", { className: "min-w-0", children });
  const wide = layout === "wide";
  return /* @__PURE__ */ jsxs("div", { className: wide ? "grid gap-1.5 xl:grid-cols-[200px_minmax(0,720px)] xl:items-start xl:gap-4" : "grid gap-1.5 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-start sm:gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: wide ? "xl:pt-1.5" : "pt-1.5", children: [
      label && /* @__PURE__ */ jsx("label", { htmlFor, className: `block text-[14px] font-medium text-[rgb(var(--ink))] ${wide ? "leading-5" : "leading-[22px]"}`, children: label }),
      hint && /* @__PURE__ */ jsx("p", { className: wide ? "mt-0.5 text-[12px] leading-5 text-[rgb(var(--ink-muted))]" : "mt-0.5 text-[11px] leading-4 text-[rgb(var(--ink-muted))]", children: hint })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "min-w-0", children })
  ] });
}
const SETTINGS_CONTROL_MAX_W = "720px";
function SettingsValue({ children }) {
  return /* @__PURE__ */ jsx("p", { className: "pt-1.5 text-[14px] leading-5 text-[rgb(var(--ink))]", children });
}
const SETTINGS_TEXTAREA_CLASS = "block w-full rounded-md border border-[rgb(var(--line-strong))] bg-[rgb(var(--surface))] px-3 py-2 text-[14px] leading-6 text-[rgb(var(--ink))] placeholder:text-[rgb(var(--ink-faint))] focus:border-[var(--sb-accent-bg)] focus:outline-none focus:ring-1 focus:ring-[var(--sb-accent-bg)] disabled:bg-[rgb(var(--surface-subtle))] disabled:text-[rgb(var(--ink-faint))]";
const SETTINGS_PRIMARY_BUTTON_CLASS = "inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-md bg-[var(--sb-accent-bg)] px-3 text-[14px] leading-[22px] font-medium text-[rgb(var(--on-accent))] transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50";
const SETTINGS_LABEL_CLASS = "mb-1.5 block text-[14px] font-medium leading-5 text-[rgb(var(--ink))]";
const SETTINGS_DANGER_BUTTON_CLASS = "inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-md border border-[rgb(var(--danger-ink)/0.25)] bg-[rgb(var(--surface))] px-3 text-[14px] leading-[22px] font-medium text-[rgb(var(--danger-ink))] transition-colors hover:bg-[rgb(var(--danger-soft))] disabled:cursor-not-allowed disabled:opacity-50";
const SETTINGS_INPUT_H9_CLASS = "block h-9 w-full rounded-md border border-[rgb(var(--line-strong))] bg-[rgb(var(--surface))] px-3 text-[14px] leading-[22px] text-[rgb(var(--ink))] placeholder:text-[rgb(var(--ink-faint))] focus:border-[var(--sb-accent-bg)] focus:outline-none focus:ring-1 focus:ring-[var(--sb-accent-bg)] disabled:bg-[rgb(var(--surface-subtle))] disabled:text-[rgb(var(--ink-faint))]";
const SETTINGS_GHOST_BUTTON_H9_CLASS = "inline-flex h-9 shrink-0 whitespace-nowrap items-center gap-1.5 rounded-md border border-[rgb(var(--line-strong))] bg-[rgb(var(--surface))] px-3 text-[14px] leading-[22px] font-medium text-[rgb(var(--ink))] transition-colors hover:bg-[rgb(var(--surface-subtle))] disabled:cursor-not-allowed disabled:opacity-50";
const SETTINGS_INPUT_CLASS = "w-full rounded-md border border-[rgb(var(--line-strong))] bg-[rgb(var(--surface))] px-3 py-2 text-[14px] leading-[22px] text-[rgb(var(--ink))] placeholder:text-[rgb(var(--ink-faint))] focus:border-[var(--sb-accent-bg)] focus:outline-none focus:ring-1 focus:ring-[var(--sb-accent-bg)] disabled:bg-[rgb(var(--surface-subtle))] disabled:text-[rgb(var(--ink-faint))]";
const SETTINGS_GHOST_BUTTON_CLASS = "inline-flex h-8 items-center gap-1.5 rounded-md border border-[rgb(var(--line-strong))] bg-[rgb(var(--surface))] px-3 text-[14px] leading-[22px] font-medium text-[rgb(var(--ink))] transition-colors hover:bg-[rgb(var(--surface-subtle))] disabled:cursor-not-allowed disabled:opacity-50";
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
      className: `relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${checked ? "bg-[var(--sb-accent-bg)]" : "bg-[rgb(var(--surface-muted))]"} ${disabled ? "cursor-not-allowed opacity-50" : ""}`,
      children: /* @__PURE__ */ jsx(
        "span",
        {
          "aria-hidden": true,
          className: `inline-block h-3.5 w-3.5 transform rounded-full shadow transition-transform ${checked ? "translate-x-[18px] bg-[var(--accent-on)]" : "translate-x-0.5 bg-white"}`
        }
      )
    }
  );
}
export {
  SETTINGS_CONTROL_MAX_W,
  SETTINGS_DANGER_BUTTON_CLASS,
  SETTINGS_GHOST_BUTTON_CLASS,
  SETTINGS_GHOST_BUTTON_H9_CLASS,
  SETTINGS_INPUT_CLASS,
  SETTINGS_INPUT_H9_CLASS,
  SETTINGS_LABEL_CLASS,
  SETTINGS_PRIMARY_BUTTON_CLASS,
  SETTINGS_TEXTAREA_CLASS,
  SettingsRow,
  SettingsToggle,
  SettingsValue
};
//# sourceMappingURL=SettingsRow.js.map