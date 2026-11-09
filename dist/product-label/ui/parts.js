"use client";
import { jsx } from "react/jsx-runtime";
function InlineActionSpinner({ className = "" }) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: `inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-line-strong border-t-ink-muted ${className}`,
      "aria-hidden": true
    }
  );
}
function SkeletonBlock({ className = "", style }) {
  return /* @__PURE__ */ jsx("div", { className: `rounded bg-surface-muted/70 motion-safe:animate-pulse ${className}`, style, "aria-hidden": true });
}
export {
  InlineActionSpinner,
  SkeletonBlock
};
//# sourceMappingURL=parts.js.map