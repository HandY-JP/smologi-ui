"use client";
import { jsxs } from "react/jsx-runtime";
const SIZE_CLASS = {
  sm: "px-3 py-2 text-[12px] leading-[18px]",
  md: "px-3 py-2 text-[14px] leading-[22px]",
  lg: "p-4 text-[14px] leading-[22px]"
};
function ErrorBanner({
  message,
  size = "md",
  className = "",
  children
}) {
  if (message == null || message === "") return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "alert",
      className: `rounded-md border border-[rgb(var(--danger-ink)/0.25)] bg-[rgb(var(--danger-soft))] text-[rgb(var(--danger-ink))] ${SIZE_CLASS[size]} ${className}`,
      children: [
        message,
        children
      ]
    }
  );
}
export {
  ErrorBanner
};
//# sourceMappingURL=ErrorBanner.js.map