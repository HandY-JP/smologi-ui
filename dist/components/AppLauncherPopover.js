"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
const POPOVER_WIDTH = 340;
const POPOVER_GAP = 8;
const VIEWPORT_MARGIN = 8;
const POPOVER_BG = "var(--sb-popover-bg, #ffffff)";
const POPOVER_LINE = "var(--sb-popover-line, #e5e7eb)";
const POPOVER_INK = "var(--sb-popover-ink, #1f2937)";
const POPOVER_MUTED = "var(--sb-popover-muted, #6b7280)";
const POPOVER_CURRENT_BG = "var(--sb-popover-current-bg, var(--accent-subtle))";
const POPOVER_CURRENT_INK = "var(--sb-popover-current-ink, var(--sb-accent-bg))";
function AppLauncherPopover({
  anchorRef,
  open,
  onClose,
  apps,
  loading = false,
  failed = false,
  header,
  renderIcon,
  renderNewDot,
  renderLink,
  loadingText = "\u30A2\u30D7\u30EA\u3092\u78BA\u8A8D\u3057\u3066\u3044\u307E\u3059\u2026",
  failedText = "\u30A2\u30D7\u30EA\u4E00\u89A7\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
  currentLabel = "\u73FE\u5728\u5730",
  ariaLabel = "\u5951\u7D04\u4E2D\u306E\u30A2\u30D7\u30EA",
  id = "smologi-app-switcher-popover",
  regionProps
}) {
  const popoverRef = useRef(null);
  const [position, setPosition] = useState(null);
  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const maxLeft = window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN;
      setPosition({
        top: rect.bottom + POPOVER_GAP,
        left: Math.max(VIEWPORT_MARGIN, Math.min(rect.left, maxLeft))
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, anchorRef]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    const onPointerDown = (event) => {
      const target = event.target;
      if (popoverRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onClose, anchorRef]);
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      return;
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      anchorRef.current?.focus();
    }
  }, [open, anchorRef]);
  useEffect(() => {
    if (!open || !position) return;
    popoverRef.current?.querySelector("a[href]")?.focus();
  }, [open, position]);
  if (!open || !position || typeof document === "undefined") return null;
  return createPortal(
    /* @__PURE__ */ jsxs(
      "section",
      {
        ...regionProps,
        ref: popoverRef,
        id,
        role: "dialog",
        "aria-label": ariaLabel,
        className: "fixed z-[80] w-[340px] max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border shadow-2xl ring-1 ring-black/5",
        style: { top: position.top, left: position.left, backgroundColor: POPOVER_BG, borderColor: POPOVER_LINE, color: POPOVER_INK },
        children: [
          header != null && /* @__PURE__ */ jsx("div", { className: "border-b px-5 py-4", style: { borderColor: POPOVER_LINE }, children: header }),
          /* @__PURE__ */ jsxs("div", { className: "max-h-[calc(100vh-9rem)] overflow-y-auto p-2", children: [
            loading && /* @__PURE__ */ jsx("p", { className: "px-3 py-5 text-sm", style: { color: POPOVER_MUTED }, children: loadingText }),
            failed && /* @__PURE__ */ jsx("p", { className: "px-3 py-5 text-sm", style: { color: POPOVER_MUTED }, children: failedText }),
            apps.map((app) => {
              const icon = renderIcon ? renderIcon(app) : app.icon ?? (app.iconSrc ? /* @__PURE__ */ jsx("img", { src: app.iconSrc, alt: "", className: "h-10 w-10 shrink-0 rounded-xl shadow-sm" }) : null);
              const content = /* @__PURE__ */ jsxs(Fragment, { children: [
                icon,
                /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center text-sm font-semibold", style: { color: POPOVER_INK }, children: [
                    /* @__PURE__ */ jsx("span", { className: "truncate", children: app.name }),
                    renderNewDot?.(app)
                  ] }),
                  app.description && /* @__PURE__ */ jsx("span", { className: "mt-0.5 block truncate text-xs", style: { color: POPOVER_MUTED }, children: app.description })
                ] }),
                app.current ? /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium", style: { color: POPOVER_CURRENT_INK }, children: currentLabel }) : app.external ?? true ? /* @__PURE__ */ jsx("span", { style: { color: POPOVER_MUTED }, "aria-hidden": "true", children: "\u2197" }) : null
              ] });
              if (app.current) {
                return /* @__PURE__ */ jsx(
                  "div",
                  {
                    "aria-current": "page",
                    className: "flex items-center gap-3 rounded-xl px-3 py-3",
                    style: { backgroundColor: POPOVER_CURRENT_BG },
                    children: content
                  },
                  app.id
                );
              }
              const external = app.external ?? true;
              const linkProps = {
                href: app.href,
                ...external ? { target: "_blank", rel: "noopener noreferrer" } : {},
                onClick: onClose,
                className: "flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-[var(--sb-popover-current-bg,var(--accent-subtle))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--sb-popover-focus,var(--sb-accent-bg))]",
                children: content
              };
              return renderLink ? /* @__PURE__ */ jsx("span", { className: "contents", children: renderLink(app, linkProps) }, app.id) : /* @__PURE__ */ jsx("a", { ...linkProps }, app.id);
            })
          ] })
        ]
      }
    ),
    document.body
  );
}
export {
  AppLauncherPopover
};
//# sourceMappingURL=AppLauncherPopover.js.map
