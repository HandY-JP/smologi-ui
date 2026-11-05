"use client";
import { jsx, jsxs } from "react/jsx-runtime";
const TONE_CLASS = {
  accent: "bg-[var(--accent-subtle)] text-[var(--sb-accent-bg)]",
  // 選択行など、淡い地に溶けないよう塗りで出す
  solid: "bg-[var(--sb-accent-bg)] text-white",
  ok: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  bad: "bg-rose-50 text-rose-700",
  info: "bg-sky-50 text-sky-700",
  mute: "bg-gray-100 text-gray-500"
};
const SIZE_CLASS = {
  sm: "px-2 py-px text-[11px] leading-[16px]",
  md: "h-[22px] min-w-[22px] justify-center px-1.5 text-[12px] leading-[22px] tabular-nums"
};
function TonePill({
  tone = "mute",
  size = "sm",
  icon,
  children,
  className = "",
  title,
  ariaLabel
}) {
  return /* @__PURE__ */ jsxs(
    "span",
    {
      title,
      "aria-label": ariaLabel,
      className: `inline-flex items-center gap-1 whitespace-nowrap rounded-full font-semibold ${SIZE_CLASS[size]} ${TONE_CLASS[tone]} ${className}`,
      children: [
        icon && /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "inline-flex flex-shrink-0", children: icon }),
        children
      ]
    }
  );
}
export {
  TonePill
};
//# sourceMappingURL=TonePill.js.map