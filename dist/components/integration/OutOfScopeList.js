"use client";
import { jsx, jsxs } from "react/jsx-runtime";
function OutOfScopeList({
  items,
  title = "Smologi \u3067\u6271\u308F\u306A\u3044\u3082\u306E",
  hint = "\u76F8\u624B\u306E\u30B5\u30FC\u30D3\u30B9\u5074\u3067\u884C\u3044\u307E\u3059"
}) {
  if (items.length === 0) return null;
  return /* @__PURE__ */ jsxs("div", { className: "sb-int grid gap-1.5 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-[13px] leading-[20px] font-semibold", children: title }),
      /* @__PURE__ */ jsx("p", { className: "sb-int-muted text-[12px] leading-[18px]", children: hint })
    ] }),
    /* @__PURE__ */ jsx("ul", { className: "sb-int-muted m-0 grid list-none gap-1 p-0 text-[12px] leading-[18px]", children: items.map((t) => /* @__PURE__ */ jsx("li", { children: t }, t)) })
  ] });
}
export {
  OutOfScopeList
};
//# sourceMappingURL=OutOfScopeList.js.map