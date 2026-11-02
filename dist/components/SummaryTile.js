"use client";
import { jsx, jsxs } from "react/jsx-runtime";
const TONE_CLASS = {
  slate: "text-gray-900",
  emerald: "text-emerald-600",
  sky: "text-sky-600",
  amber: "text-amber-600",
  rose: "text-rose-600",
  gray: "text-gray-400"
};
function SummaryTile({
  label,
  sublabel,
  value,
  tone = "slate"
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 bg-white px-3 py-2", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium text-gray-500", children: label }),
    sublabel && /* @__PURE__ */ jsx("p", { className: "truncate text-[10px] text-gray-400", title: sublabel, children: sublabel }),
    /* @__PURE__ */ jsx("p", { className: `mt-0.5 text-2xl font-bold tabular-nums ${TONE_CLASS[tone]}`, children: typeof value === "number" ? value.toLocaleString("ja-JP") : value })
  ] });
}
export {
  SummaryTile
};
//# sourceMappingURL=SummaryTile.js.map