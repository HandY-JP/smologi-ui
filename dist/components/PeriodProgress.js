"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { computePeriodState } from "../lib/period.js";
function PeriodProgress({
  start,
  end,
  now,
  showLabel = true,
  className = ""
}) {
  const s = computePeriodState({ start, end, now });
  const pct = Math.round(s.ratio * 100);
  return /* @__PURE__ */ jsxs("div", { className: `flex min-w-0 items-center gap-2 ${className}`, children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        role: "progressbar",
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": pct,
        "aria-valuetext": s.label,
        className: "h-1 min-w-[48px] flex-1 overflow-hidden rounded-full bg-gray-100",
        children: /* @__PURE__ */ jsx(
          "div",
          {
            className: `h-full rounded-full ${s.phase === "active" ? "bg-[var(--sb-accent-bg)]" : "bg-gray-400"}`,
            style: { width: `${pct}%` }
          }
        )
      }
    ),
    showLabel && /* @__PURE__ */ jsx("span", { className: "flex-shrink-0 text-[11px] leading-[16px] text-gray-500", children: s.label })
  ] });
}
export {
  PeriodProgress
};
//# sourceMappingURL=PeriodProgress.js.map