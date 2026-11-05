"use client";
import { jsx, jsxs } from "react/jsx-runtime";
const SIZE_CLASS = {
  sm: "px-3 py-2 text-[12px] leading-[18px]",
  md: "px-3 py-2 text-[14px] leading-[22px]",
  lg: "p-4 text-[14px] leading-[22px]"
};
function ErrorBanner({
  message,
  size = "md",
  className = "",
  onRetry,
  retryLabel = "\u518D\u8A66\u884C",
  children
}) {
  if (message == null || message === "") return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "alert",
      className: `rounded-md border border-[rgb(var(--danger-ink)/0.25)] bg-[rgb(var(--danger-soft))] text-[rgb(var(--danger-ink))] ${SIZE_CLASS[size]} ${className}`,
      children: [
        onRetry && size !== "sm" ? /* @__PURE__ */ jsx("p", { children: message }) : message,
        onRetry && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onRetry,
            className: size === "sm" ? "ml-2 font-semibold underline" : "mt-3 h-10 rounded-lg border border-[rgb(var(--danger-ink)/0.5)] bg-[rgb(var(--surface))] px-4 text-[14px] leading-[22px] font-semibold text-[rgb(var(--danger-ink))] active:bg-[rgb(var(--danger-soft))]",
            children: retryLabel
          }
        ),
        children
      ]
    }
  );
}
export {
  ErrorBanner
};
//# sourceMappingURL=ErrorBanner.js.map