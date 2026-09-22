"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore
} from "react";
import { createPortal } from "react-dom";
let openKey = null;
const listeners = /* @__PURE__ */ new Set();
function emit() {
  for (const listener of listeners) listener();
}
function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function setOpenKey(key) {
  if (openKey === key) return;
  openKey = key;
  emit();
}
function closeCellPopover() {
  setOpenKey(null);
}
function useIsOpen(key) {
  return useSyncExternalStore(
    subscribe,
    () => openKey === key,
    () => false
  );
}
const PANEL_GAP = 6;
const VIEWPORT_MARGIN = 8;
function CellPopover({
  popoverKey,
  ariaLabel,
  title,
  panelLabel,
  panelWidth = 232,
  align = "right",
  triggerClassName,
  children,
  panel
}) {
  const open = useIsOpen(popoverKey);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [position, setPosition] = useState(null);
  useEffect(() => () => {
    if (openKey === popoverKey) setOpenKey(null);
  }, [popoverKey]);
  const reposition = useCallback(() => {
    const trigger = triggerRef.current;
    const panelEl = panelRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const height = panelEl?.offsetHeight ?? 0;
    const width = panelEl?.offsetWidth ?? panelWidth;
    const belowTop = rect.bottom + PANEL_GAP;
    const fitsBelow = belowTop + height <= window.innerHeight - VIEWPORT_MARGIN;
    const top = fitsBelow ? belowTop : Math.max(VIEWPORT_MARGIN, rect.top - PANEL_GAP - height);
    const rawLeft = align === "right" ? rect.right - width : rect.left;
    const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN;
    const left = Math.max(VIEWPORT_MARGIN, Math.min(rawLeft, Math.max(VIEWPORT_MARGIN, maxLeft)));
    setPosition({ top, left });
  }, [align, panelWidth]);
  useLayoutEffect(() => {
    if (!open) return;
    reposition();
  }, [open, reposition]);
  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => reposition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    const onPointerDown = (event) => {
      const target = event.target;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpenKey(null);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenKey(null);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, reposition]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        ref: triggerRef,
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": open,
        "aria-label": ariaLabel,
        title,
        onClick: (event) => {
          event.stopPropagation();
          setOpenKey(open ? null : popoverKey);
        },
        className: triggerClassName ?? `block w-full cursor-pointer rounded-md px-1 py-0.5 transition-colors hover:bg-blue-50/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${open ? "bg-blue-50" : ""}`,
        children
      }
    ),
    open && typeof document !== "undefined" && createPortal(
      /* @__PURE__ */ jsxs(
        "div",
        {
          ref: panelRef,
          role: "dialog",
          "aria-label": panelLabel,
          style: {
            top: position?.top ?? -9999,
            left: position?.left ?? -9999,
            width: panelWidth,
            visibility: position ? "visible" : "hidden"
          },
          className: "themed-popover-panel fixed z-[60] rounded-lg border border-gray-200 bg-white p-3 text-left shadow-xl",
          onMouseDown: (event) => event.stopPropagation(),
          onClick: (event) => event.stopPropagation(),
          onDoubleClick: (event) => event.stopPropagation(),
          children: [
            /* @__PURE__ */ jsx("p", { className: "mb-2 text-[11px] font-semibold tracking-wide text-gray-500", children: panelLabel }),
            panel
          ]
        }
      ),
      document.body
    )
  ] });
}
export {
  CellPopover,
  closeCellPopover
};
//# sourceMappingURL=CellPopover.js.map
