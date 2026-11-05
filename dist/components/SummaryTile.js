"use client";
import { jsx, jsxs } from "react/jsx-runtime";
const TONE_CLASS = {
  slate: "text-[rgb(var(--ink))]",
  emerald: "text-[rgb(var(--success-ink))]",
  sky: "text-[rgb(var(--accent-ink))]",
  amber: "text-[rgb(var(--warning-ink))]",
  rose: "text-[rgb(var(--danger-ink))]",
  gray: "text-[rgb(var(--ink-muted))]"
};
function SummaryTile({
  label,
  sublabel,
  value,
  tone = "slate",
  variant = "card"
}) {
  return /* @__PURE__ */ jsxs("div", { className: variant === "flat" ? "bg-[rgb(var(--surface))] px-1 py-1" : "rounded-xl border border-[rgb(var(--line))] bg-[rgb(var(--surface))] px-3 py-2", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[11px] leading-[16px] font-medium text-[rgb(var(--ink-muted))]", children: label }),
    sublabel && /* @__PURE__ */ jsx("p", { className: "truncate text-[11px] leading-[16px] text-[rgb(var(--ink-muted))]", title: sublabel, children: sublabel }),
    /* @__PURE__ */ jsx("p", { className: `mt-0.5 text-[22px] leading-[30px] font-semibold tabular-nums ${TONE_CLASS[tone]}`, children: typeof value === "number" ? value.toLocaleString("ja-JP") : value })
  ] });
}
export {
  SummaryTile
};
//# sourceMappingURL=SummaryTile.js.map