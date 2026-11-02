"use client";
import { jsx, jsxs } from "react/jsx-runtime";
function SplitInbox({
  list,
  detail,
  aside,
  selected,
  onBack,
  backLabel = "\u4E00\u89A7\u306B\u623B\u308B",
  emptyDetail,
  listWidth = "md:w-[320px]",
  asideWidth = "lg:w-[300px]",
  className = ""
}) {
  return /* @__PURE__ */ jsxs("div", { className: `flex h-full min-h-0 w-full ${className}`, children: [
    /* @__PURE__ */ jsx(
      "section",
      {
        "aria-label": "\u4E00\u89A7",
        className: `min-h-0 w-full flex-shrink-0 overflow-y-auto md:border-r md:border-gray-200 ${listWidth} ${selected ? "hidden md:block" : "block"}`,
        children: list
      }
    ),
    /* @__PURE__ */ jsxs(
      "section",
      {
        "aria-label": "\u8A73\u7D30",
        className: `min-h-0 min-w-0 flex-1 flex-col ${selected ? "flex" : "hidden md:flex"}`,
        children: [
          /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 border-b border-gray-200 px-3 py-2 md:hidden", children: /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: onBack,
              className: "inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm font-medium text-gray-700 hover:bg-gray-100",
              children: [
                /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "\u2039" }),
                backLabel
              ]
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "flex min-h-0 flex-1 flex-col overflow-y-auto", children: selected ? detail : emptyDetail ?? /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-sm text-gray-400", children: "\u5DE6\u306E\u4E00\u89A7\u304B\u3089\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002" }) })
        ]
      }
    ),
    aside && /* @__PURE__ */ jsx(
      "aside",
      {
        "aria-label": "\u88DC\u52A9",
        className: `hidden min-h-0 flex-shrink-0 overflow-y-auto border-l border-gray-200 lg:block ${asideWidth}`,
        children: aside
      }
    )
  ] });
}
export {
  SplitInbox
};
//# sourceMappingURL=SplitInbox.js.map
