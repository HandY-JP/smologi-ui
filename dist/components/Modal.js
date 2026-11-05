"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef, useState } from "react";
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
    document.addEventListener("mousedown", onMouseDown, true);
    return () => document.removeEventListener("mousedown", onMouseDown, true);
  }, [enabled, ref, ignore]);
}
function Modal({
  open,
  onClose,
  title,
  subtitle,
  headerRight,
  headerAside,
  ariaLabel,
  layer = "base",
  size = "md",
  dismissable = true,
  closeOnBackdrop,
  dirty = false,
  compactHeader = false,
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
      headerAside,
      ariaLabel,
      layer,
      size,
      dismissable,
      closeOnBackdrop,
      dirty,
      compactHeader,
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
  headerAside,
  ariaLabel,
  layer,
  size,
  dismissable,
  closeOnBackdrop = true,
  dirty = false,
  compactHeader = false,
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
  const backdropClosable = closeOnBackdrop && closable;
  const withCloseButton = showCloseButton ?? closable;
  const [confirmDirtyClose, setConfirmDirtyClose] = useState(false);
  const requestClose = () => {
    if (dirty) {
      setConfirmDirtyClose(true);
      return;
    }
    onClose();
  };
  useEscapeDismiss(closable, requestClose);
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
    "flex w-full flex-col overflow-hidden rounded-xl bg-[rgb(var(--surface))] shadow-xl outline-none",
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
    title != null && /* @__PURE__ */ jsxs(
      "div",
      {
        className: compactHeader ? "flex min-h-11 shrink-0 items-center gap-3 border-b border-[rgb(var(--line))] px-5 py-1.5" : "flex items-start gap-3 border-b border-[rgb(var(--line))] px-5 py-4",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-wrap items-baseline gap-x-3", children: [
              /* @__PURE__ */ jsx("h2", { id: titleId, className: `shrink-0 text-[15px] font-semibold text-[rgb(var(--ink))] ${compactHeader ? "leading-6" : "leading-[22px]"}`, children: title }),
              headerAside != null && /* @__PURE__ */ jsx("div", { className: "min-w-0 basis-full text-[14px] leading-[22px] text-[rgb(var(--ink-muted))] sm:basis-auto", children: headerAside })
            ] }),
            subtitle != null && /* @__PURE__ */ jsx("p", { className: compactHeader ? "text-[12px] leading-4 text-[rgb(var(--ink-muted))]" : "mt-0.5 text-[12px] leading-[18px] text-[rgb(var(--ink-muted))]", children: subtitle })
          ] }),
          headerRight != null && /* @__PURE__ */ jsx("div", { className: `flex shrink-0 items-center gap-2${compactHeader ? "" : " self-center"}`, children: headerRight }),
          withCloseButton && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: onClose,
              "aria-label": "\u9589\u3058\u308B",
              className: `${compactHeader ? "-mr-2 inline-flex h-8 w-8 items-center justify-center" : "-mr-1 p-1"} rounded-md text-[22px] leading-none text-[rgb(var(--ink-muted))] transition-colors hover:bg-[rgb(var(--surface-subtle))] hover:text-[rgb(var(--ink))]`,
              children: "\xD7"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: `min-h-0 flex-1 overflow-y-auto overscroll-contain ${bodyClassName ?? ""}`, children }),
    confirmDirtyClose && /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[rgb(var(--warning-ink)/0.25)] bg-[rgb(var(--warning-soft))] px-5 py-2.5", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[12px] leading-[18px] font-medium text-[rgb(var(--warning-ink))]", children: "\u5165\u529B\u5185\u5BB9\u304C\u5931\u308F\u308C\u307E\u3059\u3002\u9589\u3058\u307E\u3059\u304B" }),
      /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onClose,
            className: "rounded-md border border-[rgb(var(--warning-ink)/0.25)] bg-[rgb(var(--surface))] px-2.5 py-1 text-[12px] leading-[18px] font-semibold text-[rgb(var(--warning-ink))] transition-colors hover:bg-[rgb(var(--warning-soft))]",
            children: "\u9589\u3058\u308B"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setConfirmDirtyClose(false),
            className: "rounded-md bg-[rgb(var(--warning-solid))] px-2.5 py-1 text-[12px] leading-[18px] font-semibold text-[rgb(var(--on-accent))] transition-colors hover:bg-[rgb(var(--warning-solid)/0.9)]",
            children: "\u7D9A\u3051\u308B"
          }
        )
      ] })
    ] }),
    footer != null && /* @__PURE__ */ jsx("div", { className: "flex shrink-0 justify-end gap-2 border-t border-[rgb(var(--line))] px-5 py-3", children: footer })
  ] });
  const body = /* @__PURE__ */ jsx(
    "div",
    {
      className: `fixed inset-0 flex items-center justify-center bg-black/40 p-4 ${LAYER_Z[layer ?? "base"]} ${overlayClassName}`,
      style: { paddingLeft: "calc(1rem + min(var(--app-content-left, 0px), max(0px, 100vw - 22rem)))" },
      role: "presentation",
      onMouseDown: (event) => {
        if (event.target === event.currentTarget && backdropClosable) requestClose();
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