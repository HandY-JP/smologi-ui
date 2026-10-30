"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useId, useRef, useState } from "react";
const FIELD_BASE = "group flex h-10 w-full items-center gap-2 rounded-md px-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--sb-text)]";
const ROW_BASE = "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--sb-popover-current-bg,var(--accent-subtle))] focus-visible:bg-[var(--sb-popover-current-bg,var(--accent-subtle))] focus-visible:outline-none disabled:cursor-default disabled:opacity-50";
function Chevron({ open }) {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      className: `h-3.5 w-3.5 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`,
      style: { color: "var(--sb-label)" },
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
      strokeWidth: 2,
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 9l-7 7-7-7" })
    }
  );
}
function StoreAccountSwitcher({
  currentLabel,
  groups,
  footerItems,
  state = "ready",
  loadingText = "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026",
  errorText = "\u4E00\u89A7\u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F",
  emptyText = "\u767B\u9332\u304C\u3042\u308A\u307E\u305B\u3093",
  emptyHref,
  emptyHint,
  renderLink,
  onOpenChange,
  defaultOpen = false,
  ariaLabel = "\u30B9\u30C8\u30A2\u3068\u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u5207\u308A\u66FF\u3048",
  className
}) {
  const [open, setOpenState] = useState(defaultOpen);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const menuId = useId();
  const openRef = useRef(defaultOpen);
  const setOpen = useCallback((next) => {
    if (openRef.current === next) return;
    openRef.current = next;
    setOpenState(next);
    onOpenChangeRef.current?.(next);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);
  const link = (props) => renderLink ? renderLink(props) : /* @__PURE__ */ jsx("a", { href: props.href, className: props.className, style: props.style, role: props.role, title: props.title, "aria-current": props["aria-current"], onClick: props.onClick, children: props.children });
  if (emptyHref) {
    return /* @__PURE__ */ jsxs("div", { className, children: [
      link({
        href: emptyHref,
        title: currentLabel,
        className: `${FIELD_BASE} border border-orange-200 bg-orange-50 hover:bg-orange-100`,
        children: /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate text-sm font-semibold text-orange-800", children: currentLabel })
      }),
      emptyHint && /* @__PURE__ */ jsx("p", { className: "mt-1.5 px-0.5 text-[11px] leading-relaxed", style: { color: "var(--sb-label)" }, children: emptyHint })
    ] });
  }
  const renderItem = (item) => {
    const body = /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx("span", { className: "block truncate", style: item.checked ? { color: "var(--sb-popover-current-ink, var(--sb-accent-bg))", fontWeight: 600 } : void 0, children: item.label }),
        item.sub && /* @__PURE__ */ jsx("span", { className: "block truncate text-[11px]", style: { color: "var(--sb-popover-muted, var(--sb-label))" }, children: item.sub })
      ] }),
      item.badge && /* @__PURE__ */ jsx(
        "span",
        {
          className: "flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none",
          style: { backgroundColor: "var(--sb-hover)", color: "var(--sb-popover-muted, var(--sb-label))" },
          children: item.badge
        }
      ),
      item.checked && /* @__PURE__ */ jsxs(
        "span",
        {
          className: "flex-shrink-0 text-xs font-semibold",
          style: { color: "var(--sb-popover-current-ink, var(--sb-accent-bg))" },
          children: [
            /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "\u2713 " }),
            "\u4ECA\u306E\u753B\u9762"
          ]
        }
      )
    ] });
    const rowStyle = {
      color: "var(--sb-popover-ink, var(--sb-text))",
      ...item.checked ? { backgroundColor: "var(--sb-popover-current-bg, var(--accent-subtle))" } : null
    };
    if (item.href && !item.disabled) {
      return link({
        href: item.href,
        role: "menuitem",
        className: ROW_BASE,
        style: rowStyle,
        "aria-current": item.checked ? "page" : void 0,
        onClick: () => {
          item.onSelect?.();
          setOpen(false);
        },
        children: body
      });
    }
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        role: "menuitem",
        disabled: item.disabled,
        "aria-current": item.checked ? "true" : void 0,
        className: ROW_BASE,
        style: rowStyle,
        onClick: () => {
          item.onSelect?.();
          setOpen(false);
        },
        children: body
      }
    );
  };
  const statusText = state === "loading" ? loadingText : state === "error" ? errorText : state === "empty" ? emptyText : null;
  const lineStyle = { borderColor: "var(--sb-popover-line, var(--sb-border))" };
  const fieldStyle = {
    backgroundColor: "var(--sb-field-bg, transparent)",
    borderColor: "var(--sb-field-line, var(--sb-popover-line, var(--sb-border)))"
  };
  return /* @__PURE__ */ jsxs("div", { ref: rootRef, className: `relative ${className ?? ""}`, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        ref: triggerRef,
        type: "button",
        onClick: () => setOpen(!open),
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": open ? menuId : void 0,
        "aria-label": `${ariaLabel}\uFF08\u73FE\u5728: ${currentLabel}\uFF09`,
        title: ariaLabel,
        className: `${FIELD_BASE} border hover:bg-[var(--sb-field-hover,var(--sb-hover))]`,
        style: { ...fieldStyle, color: "var(--sb-text)" },
        children: [
          /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate text-sm font-semibold", children: currentLabel }),
          /* @__PURE__ */ jsx(Chevron, { open })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs(
      "div",
      {
        id: menuId,
        role: "menu",
        "aria-label": ariaLabel,
        className: "absolute left-0 right-0 top-full z-30 mt-1 max-h-[70vh] overflow-y-auto rounded-md border py-1 shadow-lg",
        style: { ...lineStyle, backgroundColor: "var(--sb-popover-bg, var(--sb-bg))" },
        children: [
          statusText ? /* @__PURE__ */ jsx(
            "div",
            {
              role: "status",
              className: "px-3 py-2 text-xs",
              style: { color: "var(--sb-popover-muted, var(--sb-label))" },
              children: statusText
            }
          ) : groups.map((group) => /* @__PURE__ */ jsxs("div", { role: "group", "aria-label": group.heading, children: [
            group.heading && /* @__PURE__ */ jsx(
              "div",
              {
                className: "px-3 pb-0.5 pt-2 text-[11px] font-semibold",
                style: { color: "var(--sb-popover-muted, var(--sb-label))" },
                children: group.heading
              }
            ),
            group.items.map((item) => /* @__PURE__ */ jsx("div", { children: renderItem(item) }, item.id))
          ] }, group.id)),
          footerItems && footerItems.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-1 border-t pt-1", style: lineStyle, children: footerItems.map((item) => /* @__PURE__ */ jsx("div", { children: renderItem(item) }, item.id)) })
        ]
      }
    )
  ] });
}
export {
  StoreAccountSwitcher
};
//# sourceMappingURL=StoreAccountSwitcher.js.map