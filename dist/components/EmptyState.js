"use client";
import { jsx, jsxs } from "react/jsx-runtime";
const LOADING_TEXT = "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026";
function EmptyState({
  message = "\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
  loading = false,
  className = "",
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: `rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-400 ${className}`, children: [
    /* @__PURE__ */ jsx("p", { children: loading ? LOADING_TEXT : message }),
    !loading && children && /* @__PURE__ */ jsx("div", { className: "mt-3", children })
  ] });
}
function EmptyTableRow({
  colSpan,
  message = "\u8A72\u5F53\u3059\u308B\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
  loading = false,
  className = ""
}) {
  return /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan, className: `px-4 py-10 text-center text-sm text-gray-400 ${className}`, children: loading ? LOADING_TEXT : message }) });
}
export {
  EmptyState,
  EmptyTableRow
};
//# sourceMappingURL=EmptyState.js.map
