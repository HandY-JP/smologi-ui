"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
const LAYER_Z = {
  base: "z-[70]",
  over: "z-[90]"
};
const SIZE_MAX_W = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
  xl: "max-w-2xl",
  // 検索一覧など、表を載せる作業モーダル向けの幅。増やしすぎないこと。
  "2xl": "max-w-3xl",
  "3xl": "max-w-4xl",
  "4xl": "max-w-5xl"
};
let scrollLockCount = 0;
let scrollLockPrevious = "";
function lockBodyScroll() {
  if (scrollLockCount === 0) {
    scrollLockPrevious = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  scrollLockCount += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    scrollLockCount -= 1;
    if (scrollLockCount === 0) document.body.style.overflow = scrollLockPrevious;
  };
}
const escapeStack = [];
function useEscapeDismiss(enabled, onDismiss) {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });
  useEffect(() => {
    if (!enabled) return;
    const token = /* @__PURE__ */ Symbol("modal");
    escapeStack.push(token);
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (escapeStack[escapeStack.length - 1] !== token) return;
      event.stopPropagation();
      onDismissRef.current();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      const index = escapeStack.indexOf(token);
      if (index >= 0) escapeStack.splice(index, 1);
    };
  }, [enabled]);
}
function useDismiss(ref, onDismiss, { enabled = true, ignore } = {}) {
  useEscapeDismiss(enabled, onDismiss);
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });
  useEffect(() => {
    if (!enabled) return;
    const onMouseDown = (event) => {
      const target = event.target;
      if (!target) return;
      if (ref.current?.contains(target)) return;
      if (ignore?.current?.contains(target)) return;
      onDismissRef.current();
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [enabled, ref, ignore]);
}
function Modal({
  open,
  onClose,
  title,
  subtitle,
  headerRight,
  ariaLabel,
  layer = "base",
  size = "md",
  dismissable = true,
  closeOnBackdrop,
  panelMaxHeightClassName = "max-h-[85vh]",
  showCloseButton,
  role = "dialog",
  bodyClassName = "px-5 py-4",
  overlayClassName = "",
  panelClassName = "",
  footer,
  onSubmit,
  children
}) {
  if (!open) return null;
  return /* @__PURE__ */ jsx(
    ModalBody,
    {
      onClose,
      title,
      subtitle,
      headerRight,
      ariaLabel,
      layer,
      size,
      dismissable,
      closeOnBackdrop,
      panelMaxHeightClassName,
      showCloseButton,
      role,
      bodyClassName,
      overlayClassName,
      panelClassName,
      footer,
      onSubmit,
      children
    }
  );
}
function ModalBody({
  onClose,
  title,
  subtitle,
  headerRight,
  ariaLabel,
  layer,
  size,
  dismissable,
  closeOnBackdrop,
  panelMaxHeightClassName,
  showCloseButton,
  role,
  bodyClassName,
  overlayClassName,
  panelClassName,
  footer,
  onSubmit,
  children
}) {
  const titleId = useId();
  const panelRef = useRef(null);
  const closable = dismissable !== false;
  const backdropClosable = (closeOnBackdrop ?? closable) && closable;
  const withCloseButton = showCloseButton ?? closable;
  useEscapeDismiss(closable, onClose);
  useEffect(() => lockBodyScroll(), []);
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    const preferred = panel?.querySelector("[data-autofocus]");
    if (preferred) {
      preferred.focus({ preventScroll: true });
    } else if (panel && !panel.contains(document.activeElement)) {
      panel.focus({ preventScroll: true });
    }
    return () => {
      previouslyFocused?.focus?.();
    };
  }, []);
  const panelClass = [
    "flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-xl outline-none",
    panelMaxHeightClassName ?? "max-h-[85vh]",
    SIZE_MAX_W[size ?? "md"],
    panelClassName
  ].filter(Boolean).join(" ");
  const panelProps = {
    ref: panelRef,
    role,
    "aria-modal": true,
    ...title ? { "aria-labelledby": titleId } : { "aria-label": ariaLabel },
    tabIndex: -1,
    className: panelClass,
    onMouseDown: (event) => event.stopPropagation()
  };
  const inner = /* @__PURE__ */ jsxs(Fragment, { children: [
    title != null && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 border-b border-gray-200 px-5 py-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx("h2", { id: titleId, className: "text-base font-bold text-gray-900", children: title }),
        subtitle != null && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-gray-500", children: subtitle })
      ] }),
      headerRight != null && /* @__PURE__ */ jsx("div", { className: "flex shrink-0 items-center gap-2 self-center", children: headerRight }),
      withCloseButton && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onClose,
          "aria-label": "\u9589\u3058\u308B",
          className: "-mr-1 rounded-md p-1 text-xl leading-none text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600",
          children: "\xD7"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: `min-h-0 flex-1 overflow-y-auto overscroll-contain ${bodyClassName ?? ""}`, children }),
    footer != null && /* @__PURE__ */ jsx("div", { className: "flex shrink-0 justify-end gap-2 border-t border-gray-200 px-5 py-3", children: footer })
  ] });
  const body = /* @__PURE__ */ jsx(
    "div",
    {
      className: `fixed inset-0 flex items-center justify-center bg-black/40 p-4 ${LAYER_Z[layer ?? "base"]} ${overlayClassName}`,
      style: { paddingLeft: "calc(1rem + min(var(--app-content-left, 0px), max(0px, 100vw - 22rem)))" },
      role: "presentation",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget && backdropClosable) onClose();
      },
      children: onSubmit ? /* @__PURE__ */ jsx("form", { ...panelProps, onSubmit, children: inner }) : /* @__PURE__ */ jsx("div", { ...panelProps, children: inner })
    }
  );
  return createPortal(body, document.body);
}
export {
  Modal,
  useDismiss
};
//# sourceMappingURL=Modal.js.map