"use client";
import { jsx, jsxs } from "react/jsx-runtime";
const LOADING_TEXT = "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026";
function EmptyState({
  message = "\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
  loading = false,
  icon,
  description,
  bare = false,
  className = "",
  children
}) {
  const rich = !loading && (icon != null || description != null);
  return /* @__PURE__ */ jsxs("div", { className: `${bare ? "" : "rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] "}p-10 text-center text-[14px] leading-[22px] text-[rgb(var(--ink-muted))] ${className}`, children: [
    !loading && icon && /* @__PURE__ */ jsx("div", { className: "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--surface-subtle))] text-[rgb(var(--ink-muted))]", children: icon }),
    /* @__PURE__ */ jsx("p", { className: rich ? "font-semibold text-[rgb(var(--ink))]" : void 0, children: loading ? LOADING_TEXT : message }),
    !loading && description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-[12px] leading-[18px]", children: description }),
    !loading && children && /* @__PURE__ */ jsx("div", { className: "mt-3", children })
  ] });
}
function EmptyTableRow({
  colSpan,
  message = "\u8A72\u5F53\u3059\u308B\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093\u3002",
  loading = false,
  className = ""
}) {
  return /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan, className: `px-4 py-10 text-center text-[14px] leading-[22px] text-gray-400 ${className}`, children: loading ? LOADING_TEXT : message }) });
}
export {
  EmptyState,
  EmptyTableRow
};
//# sourceMappingURL=EmptyState.js.map