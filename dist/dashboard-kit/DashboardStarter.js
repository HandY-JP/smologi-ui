"use client";
import { jsx, jsxs } from "react/jsx-runtime";
const DEFAULT_ICON = /* @__PURE__ */ jsxs("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", "aria-hidden": true, children: [
  /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "7", height: "7", rx: "2" }),
  /* @__PURE__ */ jsx("rect", { x: "14", y: "3", width: "7", height: "7", rx: "2" }),
  /* @__PURE__ */ jsx("rect", { x: "3", y: "14", width: "7", height: "7", rx: "2" }),
  /* @__PURE__ */ jsx("path", { d: "M17.5 14v7M14 17.5h7" })
] });
function DashboardStarter({
  recommendedTitles,
  onRecommend,
  onPick,
  title = "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u3092\u4F5C\u308A\u307E\u3057\u3087\u3046",
  description = "\u6BCE\u65E5\u898B\u305F\u3044\u3082\u306E\u3092\u9078\u3093\u3067\u4E26\u3079\u307E\u3059\u3002\u307E\u305A\u306F\u304A\u3059\u3059\u3081\u3092\u5165\u308C\u3066\u3001\u3042\u3068\u304B\u3089\u300C\u7DE8\u96C6\u300D\u3067\u5165\u308C\u66FF\u3048\u308B\u306E\u304C\u65E9\u3044\u3067\u3059\u3002",
  recommendLabel = "\u304A\u3059\u3059\u3081\u3092\u307E\u3068\u3081\u3066\u5165\u308C\u308B",
  pickLabel = "\u81EA\u5206\u3067\u9078\u3076",
  busy = false,
  icon = DEFAULT_ICON,
  className,
  iconClassName,
  primaryClassName,
  secondaryClassName,
  chipClassName
}) {
  return /* @__PURE__ */ jsxs("section", { "aria-label": title, className: `flex flex-col items-center gap-3.5 px-5 py-9 text-center ${className}`, children: [
    /* @__PURE__ */ jsx("div", { className: `grid h-14 w-14 place-items-center rounded-2xl ${iconClassName}`, children: icon }),
    /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold [text-wrap:balance]", children: title }),
    /* @__PURE__ */ jsx("p", { className: "max-w-[34em] text-sm leading-relaxed opacity-70", children: description }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap justify-center gap-2.5", children: [
      /* @__PURE__ */ jsx("button", { type: "button", disabled: busy, onClick: onRecommend, className: `px-5 py-3 text-[15px] ${primaryClassName}`, children: recommendLabel }),
      /* @__PURE__ */ jsx("button", { type: "button", disabled: busy, onClick: onPick, className: `px-5 py-3 text-[15px] ${secondaryClassName}`, children: pickLabel })
    ] }),
    recommendedTitles.length > 0 ? /* @__PURE__ */ jsx("ul", { className: "flex flex-wrap justify-center gap-1.5", "aria-label": "\u304A\u3059\u3059\u3081\u306E\u5185\u5BB9", children: recommendedTitles.map((t) => /* @__PURE__ */ jsx("li", { className: `rounded-full px-2.5 py-0.5 text-xs ${chipClassName}`, children: t }, t)) }) : null
  ] });
}
export {
  DashboardStarter
};
//# sourceMappingURL=DashboardStarter.js.map