"use client";
import { jsx, jsxs } from "react/jsx-runtime";
const TONE_CLASS = {
  accent: "bg-[var(--accent-subtle)] text-[var(--sb-accent-bg)]",
  ok: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  bad: "bg-rose-50 text-rose-700",
  info: "bg-sky-50 text-sky-700",
  mute: "bg-gray-100 text-gray-500"
};
function TonePill({
  tone = "mute",
  icon,
  children,
  className = "",
  title
}) {
  return /* @__PURE__ */ jsxs(
    "span",
    {
      title,
      className: `inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-px text-[11px] font-semibold ${TONE_CLASS[tone]} ${className}`,
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