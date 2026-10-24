"use client";
import { jsx, jsxs } from "react/jsx-runtime";
const LOADING_TEXT = "loading...";
function SkeletonLine({ className = "" }) {
  return /* @__PURE__ */ jsx("span", { className: `hp-skeleton-line ${className}`, "aria-hidden": true });
}
function InlineLoaderSkeleton({ label, mark }) {
  return /* @__PURE__ */ jsxs("div", { role: "status", "aria-live": "polite", "aria-busy": "true", className: "hp-inline-loader", children: [
    /* @__PURE__ */ jsx("span", { className: "sr-only", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "hp-inline-skeleton", "aria-hidden": true, children: [
      /* @__PURE__ */ jsxs("div", { className: "hp-inline-skeleton-head", children: [
        /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-inline-skeleton-dot" }),
        /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-inline-skeleton-line--title" }),
        /* @__PURE__ */ jsx("span", { className: "hp-inline-skeleton-ring", children: /* @__PURE__ */ jsx(LoadingIndicator, { size: "sm", mark }) })
      ] }),
      /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-inline-skeleton-line--wide" }),
      /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-inline-skeleton-line--mid" })
    ] })
  ] });
}
function PageLoaderSkeleton({ label, mark }) {
  return /* @__PURE__ */ jsxs("div", { role: "status", "aria-live": "polite", "aria-busy": "true", className: "hp-page-loader", children: [
    /* @__PURE__ */ jsx("span", { className: "sr-only", children: label }),
    /* @__PURE__ */ jsxs("div", { "data-testid": "handy-page-skeleton", className: "hp-page-skeleton", "aria-hidden": true, children: [
      /* @__PURE__ */ jsx("div", { className: "hp-skeleton-ring", children: /* @__PURE__ */ jsx(LoadingIndicator, { size: "md", mark }) }),
      /* @__PURE__ */ jsxs("div", { className: "hp-page-skeleton-toolbar", children: [
        /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-page-skeleton-search" }),
        /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-page-skeleton-control" }),
        /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-page-skeleton-control hp-page-skeleton-control--short" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "hp-page-skeleton-table", children: [
        /* @__PURE__ */ jsxs("div", { className: "hp-page-skeleton-head", children: [
          /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-page-skeleton-thumb" }),
          /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-page-skeleton-cell hp-page-skeleton-cell--code" }),
          /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-page-skeleton-cell hp-page-skeleton-cell--name" }),
          /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-page-skeleton-cell hp-page-skeleton-cell--short" })
        ] }),
        Array.from({ length: 10 }).map((_, index) => /* @__PURE__ */ jsxs("div", { className: "hp-page-skeleton-row", children: [
          /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-page-skeleton-thumb" }),
          /* @__PURE__ */ jsxs("div", { className: "hp-page-skeleton-stack", children: [
            /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-page-skeleton-cell hp-page-skeleton-cell--code" }),
            /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-page-skeleton-cell hp-page-skeleton-cell--tiny" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "hp-page-skeleton-stack hp-page-skeleton-stack--wide", children: [
            /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-page-skeleton-cell hp-page-skeleton-cell--name" }),
            /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-page-skeleton-cell hp-page-skeleton-cell--mid" })
          ] }),
          /* @__PURE__ */ jsx(SkeletonLine, { className: "hp-page-skeleton-cell hp-page-skeleton-cell--short" })
        ] }, `hp-page-skeleton-row-${index}`))
      ] })
    ] })
  ] });
}
function DualRingLoader({
  size = "md",
  className = "",
  label
}) {
  const accessibilityProps = label ? { role: "status", "aria-label": label } : { "aria-hidden": true };
  return /* @__PURE__ */ jsxs("span", { className: `hp-dual-ring hp-dual-ring--${size} ${className}`, ...accessibilityProps, children: [
    /* @__PURE__ */ jsx("span", { className: "hp-dual-ring-orbit hp-dual-ring-orbit--outer" }),
    /* @__PURE__ */ jsx("span", { className: "hp-dual-ring-orbit hp-dual-ring-orbit--inner" })
  ] });
}
function LoadingIndicator({
  size = "md",
  className = "",
  label,
  mark
}) {
  const accessibilityProps = label ? { role: "status", "aria-label": label } : { "aria-hidden": true };
  const ringSize = size === "sm" ? "md" : "lg";
  return /* @__PURE__ */ jsxs("span", { className: `hp-loading-indicator hp-loading-indicator--${size} ${className}`, ...accessibilityProps, children: [
    mark ?? /* @__PURE__ */ jsx(DualRingLoader, { size: ringSize }),
    /* @__PURE__ */ jsx("span", { className: "hp-loading-text", children: Array.from(LOADING_TEXT).map((char, index) => /* @__PURE__ */ jsx("span", { className: "hp-loading-letter", style: { animationDelay: `${index * 70}ms` }, children: char }, `loading-letter-${index}`)) })
  ] });
}
function ScreenLoader({ label, mark }) {
  return /* @__PURE__ */ jsxs("div", { role: "status", "aria-live": "polite", "aria-busy": "true", className: "fixed inset-0 z-50 bg-[var(--page-bg)]", children: [
    /* @__PURE__ */ jsx("div", { className: "hp-skeleton-ring", "aria-hidden": true, children: /* @__PURE__ */ jsx(LoadingIndicator, { size: "md", mark }) }),
    /* @__PURE__ */ jsx("span", { className: "sr-only", children: label })
  ] });
}
function HandyPortalLoader({
  label = "\u8AAD\u307F\u8FBC\u3093\u3067\u3044\u307E\u3059",
  variant = "page",
  mark
}) {
  if (variant === "screen") return /* @__PURE__ */ jsx(ScreenLoader, { label, mark });
  if (variant === "inline") return /* @__PURE__ */ jsx(InlineLoaderSkeleton, { label, mark });
  return /* @__PURE__ */ jsx(PageLoaderSkeleton, { label, mark });
}
export {
  DualRingLoader,
  HandyPortalLoader,
  LoadingIndicator
};
//# sourceMappingURL=HandyPortalLoader.js.map
