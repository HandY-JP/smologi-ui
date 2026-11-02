"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Fragment as Fragment2, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { orderToolItems, overflowedBarItems, selectBarItemKeys } from "../lib/top-tool-placement.js";
const TOOL_TIP_MARGIN_PX = 8;
const TOOL_TIP_GAP_PX = 6;
function ToolTooltip({ text, triggerRef }) {
  const tipRef = useRef(null);
  const [position, setPosition] = useState(null);
  useLayoutEffect(() => {
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const half = (tipRef.current?.offsetWidth ?? 0) / 2;
      const center = rect.left + rect.width / 2;
      const left = Math.max(
        TOOL_TIP_MARGIN_PX + half,
        Math.min(center, window.innerWidth - TOOL_TIP_MARGIN_PX - half)
      );
      setPosition({ top: rect.bottom + TOOL_TIP_GAP_PX, left });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [triggerRef, text]);
  if (typeof document === "undefined") return null;
  return createPortal(
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: tipRef,
        role: "tooltip",
        className: "sb-tool-tooltip",
        style: position ? { top: position.top, left: position.left } : { top: -9999, left: -9999, opacity: 0 },
        children: text
      }
    ),
    document.body
  );
}
const TOOL_MENU_WIDTH_PX = 208;
const TOOL_MENU_MARGIN_PX = 8;
const TOOL_MENU_GAP_PX = 6;
function ToolMenu({ items, onClose, triggerRef }) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState(null);
  useLayoutEffect(() => {
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const maxLeft = window.innerWidth - TOOL_MENU_WIDTH_PX - TOOL_MENU_MARGIN_PX;
      const left = Math.max(TOOL_MENU_MARGIN_PX, Math.min(rect.left, maxLeft));
      const top = rect.bottom + TOOL_MENU_GAP_PX;
      setPosition({ top, left });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [triggerRef]);
  useEffect(() => {
    const onMouseDown = (e) => {
      const target = e.target;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, triggerRef]);
  if (typeof document === "undefined" || !position) return null;
  return createPortal(
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: menuRef,
        role: "menu",
        style: { top: position.top, left: position.left, width: TOOL_MENU_WIDTH_PX },
        className: "fixed z-[60] flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xl",
        children: items.map((mi, i) => /* @__PURE__ */ jsxs(Fragment2, { children: [
          mi.separatorBefore && i > 0 && /* @__PURE__ */ jsx("span", { className: "my-1 block h-px bg-gray-100", "aria-hidden": true }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              role: "menuitem",
              disabled: mi.disabled,
              onClick: () => {
                mi.onClick();
                onClose();
              },
              className: "flex items-center rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent",
              children: mi.label
            }
          )
        ] }, mi.key))
      }
    ),
    document.body
  );
}
const CheckIcon = /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "m5 13 4.5 4.5L19 7.5" }) });
const CaretDownIcon = /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "m6 9 6 6 6-6" }) });
const SettingsGearIcon = /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, "aria-hidden": true, children: [
  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }),
  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
] });
const TOOL_LIST_WIDTH_PX = 312;
const TOOL_LIST_MARGIN_PX = 8;
const TOOL_LIST_GAP_PX = 6;
function buildToolListRows(items, expandedKey) {
  const rows = [];
  items.forEach((item, i) => {
    rows.push({ kind: "item", key: item.key, item, separator: !!item.separatorBefore && i > 0 });
    if (expandedKey !== item.key) return;
    for (const sub of item.menuItems ?? []) {
      rows.push({ kind: "sub", key: `${item.key}/${sub.key}`, parent: item, sub });
    }
  });
  return rows;
}
function ToolListRowStatus({ item }) {
  if (item.status === "progress") {
    return /* @__PURE__ */ jsx("span", { className: "flex-shrink-0 text-[11px] font-medium text-gray-400", children: "\u51E6\u7406\u4E2D" });
  }
  if (item.status === "done") {
    return /* @__PURE__ */ jsx("span", { className: "flex-shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600", children: item.doneCount != null ? `${item.doneCount.toLocaleString()}\u4EF6 \u3067\u304D\u3042\u304C\u308A` : "\u3067\u304D\u3042\u304C\u308A" });
  }
  if (item.status === "failed") {
    return /* @__PURE__ */ jsx("span", { className: "flex-shrink-0 text-[11px] font-medium text-red-600", children: item.statusMessage ?? "\u5931\u6557\u3057\u307E\u3057\u305F" });
  }
  return null;
}
function ToolListPanel({
  items,
  settingsLinks,
  onClose,
  triggerRef
}) {
  const panelRef = useRef(null);
  const [position, setPosition] = useState(null);
  const [expandedKey, setExpandedKey] = useState(null);
  const rows = buildToolListRows(items, expandedKey);
  const rowButtons = () => Array.from(panelRef.current?.querySelectorAll('[role="menuitem"]') ?? []);
  const focusRow = (index) => {
    const buttons = rowButtons();
    if (buttons.length === 0) return;
    buttons[(index % buttons.length + buttons.length) % buttons.length]?.focus();
  };
  useLayoutEffect(() => {
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const maxLeft = window.innerWidth - TOOL_LIST_WIDTH_PX - TOOL_LIST_MARGIN_PX;
      const left = Math.max(TOOL_LIST_MARGIN_PX, Math.min(rect.left, maxLeft));
      setPosition({ top: rect.bottom + TOOL_LIST_GAP_PX, left });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [triggerRef]);
  useEffect(() => {
    const onMouseDown = (e) => {
      const target = e.target;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, triggerRef]);
  const positioned = position != null;
  useEffect(() => {
    if (!positioned) return;
    panelRef.current?.querySelector('[role="menuitem"]')?.focus();
  }, [positioned]);
  if (typeof document === "undefined" || !position) return null;
  return createPortal(
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: panelRef,
        role: "menu",
        "aria-label": "\u9053\u5177\u306E\u4E00\u89A7",
        style: { top: position.top, left: position.left, width: TOOL_LIST_WIDTH_PX },
        className: "fixed z-[60] flex max-h-[min(70vh,560px)] flex-col overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl",
        onKeyDown: (e) => {
          if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") return;
          e.preventDefault();
          const buttons = rowButtons();
          const index = buttons.indexOf(e.target);
          if (e.key === "ArrowDown") focusRow(index < 0 ? 0 : index + 1);
          else if (e.key === "ArrowUp") focusRow(index < 0 ? -1 : index - 1);
          else if (e.key === "Home") focusRow(0);
          else focusRow(buttons.length - 1);
        },
        children: [
          rows.map((row) => {
            if (row.kind === "sub") {
              const { parent, sub: sub2 } = row;
              return /* @__PURE__ */ jsxs(Fragment2, { children: [
                sub2.separatorBefore && /* @__PURE__ */ jsx("span", { className: "my-1 block h-px bg-gray-100", "aria-hidden": true }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    role: "menuitem",
                    tabIndex: -1,
                    "aria-disabled": sub2.disabled || void 0,
                    onClick: () => {
                      if (sub2.disabled) return;
                      sub2.onClick();
                      onClose();
                    },
                    className: `flex w-full items-center gap-2.5 rounded-lg py-1.5 pl-9 pr-2.5 text-left transition-colors ${sub2.disabled ? "cursor-not-allowed opacity-40" : "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"}`,
                    children: [
                      /* @__PURE__ */ jsx("span", { className: "flex h-4 w-4 flex-shrink-0 items-center justify-center text-gray-300 [&_svg]:h-4 [&_svg]:w-4", "aria-hidden": true, children: parent.icon }),
                      /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                        /* @__PURE__ */ jsx("span", { className: "block truncate text-[13px] font-medium text-gray-700", children: sub2.label }),
                        sub2.description && /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-[11px] leading-snug text-gray-400", children: sub2.description })
                      ] })
                    ]
                  }
                )
              ] }, row.key);
            }
            const { item } = row;
            const hasMenu = !!item.menuItems && item.menuItems.length > 0;
            const expanded = expandedKey === item.key;
            const inert = !!item.disabled || item.status === "progress";
            const sub = inert && item.disabled && item.disabledReason ? item.disabledReason : item.description;
            return /* @__PURE__ */ jsxs(Fragment2, { children: [
              row.separator && /* @__PURE__ */ jsx("span", { className: "my-1 block h-px bg-gray-100", "aria-hidden": true }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  role: "menuitem",
                  tabIndex: -1,
                  "aria-disabled": inert || void 0,
                  "aria-expanded": hasMenu ? expanded : void 0,
                  onClick: () => {
                    if (inert) return;
                    if (hasMenu) {
                      setExpandedKey((cur) => cur === item.key ? null : item.key);
                      return;
                    }
                    item.onClick?.();
                    onClose();
                  },
                  className: `flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${inert ? "cursor-not-allowed opacity-45" : "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"}`,
                  children: [
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: `flex h-5 w-5 flex-shrink-0 items-center justify-center [&_svg]:h-5 [&_svg]:w-5 ${item.primary ? "text-blue-600" : item.active ? "text-amber-500" : "text-gray-400"}`,
                        "aria-hidden": true,
                        children: item.icon
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                      /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-semibold text-gray-800", children: item.label }),
                      sub && /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-xs leading-snug text-gray-500", children: sub })
                    ] }),
                    /* @__PURE__ */ jsx(ToolListRowStatus, { item }),
                    hasMenu && /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: `flex-shrink-0 text-gray-400 transition-transform [&_svg]:h-4 [&_svg]:w-4 ${expanded ? "rotate-180" : "-rotate-90"}`,
                        "aria-hidden": true,
                        children: CaretDownIcon
                      }
                    )
                  ]
                }
              )
            ] }, row.key);
          }),
          settingsLinks && settingsLinks.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "my-1 block h-px bg-gray-100", "aria-hidden": true }),
            /* @__PURE__ */ jsx("div", { className: "px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400", children: "\u95A2\u9023\u3059\u308B\u8A2D\u5B9A" }),
            settingsLinks.map((link) => /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                role: "menuitem",
                tabIndex: -1,
                onClick: () => {
                  if (link.onClick) link.onClick();
                  else if (link.href) window.location.assign(link.href);
                  onClose();
                },
                className: "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "flex h-5 w-5 flex-shrink-0 items-center justify-center text-gray-400 [&_svg]:h-5 [&_svg]:w-5", "aria-hidden": true, children: SettingsGearIcon }),
                  /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "block truncate text-sm font-semibold text-gray-800", children: link.label }),
                    link.description && /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-xs leading-snug text-gray-500", children: link.description })
                  ] })
                ]
              },
              link.label
            ))
          ] })
        ]
      }
    ),
    document.body
  );
}
function ToolButton({ item, variant }) {
  const btnClass = variant === "normal" ? "sb-tool-btn" : "sb-glass-btn";
  const dot = item.status === "done" || item.status === "failed";
  const title = item.disabled && item.disabledReason ? item.disabledReason : item.status === "failed" && item.statusMessage ? item.statusMessage : item.label;
  const hasMenu = !!item.menuItems && item.menuItems.length > 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const triggerRef = useRef(null);
  const [showCheck, setShowCheck] = useState(false);
  const prevStatusRef = useRef(item.status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = item.status;
    if (item.status !== "done" || prev === "done") return;
    setShowCheck(true);
    const id = window.setTimeout(() => setShowCheck(false), 400);
    return () => window.clearTimeout(id);
  }, [item.status]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative flex items-center",
      onPointerEnter: (e) => {
        if (e.pointerType !== "touch") setHovering(true);
      },
      onPointerLeave: () => setHovering(false),
      children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            ref: triggerRef,
            type: "button",
            onClick: hasMenu ? () => setMenuOpen((v) => !v) : item.onClick,
            disabled: item.disabled || item.status === "progress",
            "aria-busy": item.status === "progress" ? true : void 0,
            onFocus: (e) => {
              if (e.currentTarget.matches(":focus-visible")) setKeyboardFocus(true);
            },
            onBlur: () => setKeyboardFocus(false),
            "aria-label": item.label,
            "aria-pressed": item.active != null ? item.active : void 0,
            "aria-haspopup": hasMenu ? "menu" : void 0,
            "aria-expanded": hasMenu ? menuOpen : void 0,
            className: `${btnClass}${item.primary ? " primary" : ""}${item.active ? " is-active" : ""}${item.status === "progress" ? " is-progress" : ""}${item.progressMotion === "paper" ? " paper" : ""}${item.status === "failed" ? " is-failed" : ""}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: `sb-tool-icon${showCheck ? " is-check" : ""}`, children: showCheck ? CheckIcon : item.icon }),
              item.status === "progress" && item.progressPercent != null && /* @__PURE__ */ jsx("span", { className: "sb-tool-progress", "aria-hidden": true, children: /* @__PURE__ */ jsx("i", { style: { width: `${Math.max(0, Math.min(100, item.progressPercent))}%` } }) }),
              dot && /* @__PURE__ */ jsx(
                "span",
                {
                  role: item.onStatusClick ? "button" : void 0,
                  onClick: item.onStatusClick ? (e) => {
                    e.stopPropagation();
                    item.onStatusClick?.();
                  } : void 0,
                  className: `sb-tool-dot ${item.status}`,
                  "aria-label": item.status === "done" ? `\u5B8C\u4E86\uFF08${item.doneCount ?? 0}\u4EF6\uFF09` : "\u5931\u6557\u3057\u307E\u3057\u305F",
                  children: item.status === "done" ? item.doneCount != null ? Math.min(99, item.doneCount) : "" : "!"
                },
                item.status === "done" ? `done-${item.doneCount ?? 0}` : item.status
              )
            ]
          }
        ),
        (hovering || keyboardFocus) && !menuOpen && /* @__PURE__ */ jsx(ToolTooltip, { text: title, triggerRef }),
        hasMenu && menuOpen && /* @__PURE__ */ jsx(ToolMenu, { items: item.menuItems, onClose: () => setMenuOpen(false), triggerRef })
      ]
    }
  );
}
function ToolListHandle({
  items,
  settingsLinks,
  variant,
  hiddenStatus
}) {
  const btnClass = variant === "normal" ? "sb-tool-btn" : "sb-glass-btn";
  const [open, setOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const triggerRef = useRef(null);
  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };
  const handleLabel = hiddenStatus?.status === "failed" ? "\u9053\u5177\u306E\u4E00\u89A7\u3092\u958B\u304F\uFF08\u5931\u6557\u3057\u305F\u3082\u306E\u304C\u3042\u308A\u307E\u3059\uFF09" : hiddenStatus?.status === "done" ? `\u9053\u5177\u306E\u4E00\u89A7\u3092\u958B\u304F\uFF08${hiddenStatus.count.toLocaleString()}\u4EF6 \u3067\u304D\u3042\u304C\u308A\uFF09` : "\u9053\u5177\u306E\u4E00\u89A7\u3092\u958B\u304F";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative flex items-center",
      onPointerEnter: (e) => {
        if (e.pointerType !== "touch") setHovering(true);
      },
      onPointerLeave: () => setHovering(false),
      children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            ref: triggerRef,
            type: "button",
            onClick: () => setOpen((v) => !v),
            onFocus: (e) => {
              if (e.currentTarget.matches(":focus-visible")) setKeyboardFocus(true);
            },
            onBlur: () => setKeyboardFocus(false),
            "aria-label": handleLabel,
            "aria-haspopup": "menu",
            "aria-expanded": open,
            className: `${btnClass} sb-tool-caret`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "sb-tool-icon", children: CaretDownIcon }),
              hiddenStatus && /* @__PURE__ */ jsx(
                "span",
                {
                  className: `sb-tool-dot ${hiddenStatus.status}`,
                  "aria-hidden": true,
                  children: hiddenStatus.status === "done" ? hiddenStatus.count > 0 ? Math.min(99, hiddenStatus.count) : "" : "!"
                },
                hiddenStatus.status === "done" ? `done-${hiddenStatus.count}` : "failed"
              )
            ]
          }
        ),
        (hovering || keyboardFocus) && !open && /* @__PURE__ */ jsx(ToolTooltip, { text: handleLabel, triggerRef }),
        open && /* @__PURE__ */ jsx(ToolListPanel, { items, settingsLinks, onClose: close, triggerRef })
      ]
    }
  );
}
const DEFAULT_MAX_BAR_ITEMS = 5;
function TopToolCapsule({
  ariaLabel,
  items,
  settingsLinks,
  variant = "normal",
  dataTour,
  listPanel = true,
  maxBarItems = DEFAULT_MAX_BAR_ITEMS
}) {
  const capsuleClass = variant === "normal" ? "sb-tool-capsule" : "sb-glass";
  const railClass = variant === "normal" ? "sb-tool-rail" : "sb-glass-tools";
  const sepClass = variant === "normal" ? "sb-tool-sep" : "sb-glass-sep";
  const showListPanel = listPanel && items.length > 0;
  const orderedItems = orderToolItems(items);
  const barKeys = selectBarItemKeys(orderedItems, showListPanel ? maxBarItems : Number.POSITIVE_INFINITY);
  const barItems = showListPanel ? orderedItems.filter((item) => barKeys.has(item.key)) : orderedItems;
  const hiddenItems = orderedItems.filter((item) => !barKeys.has(item.key));
  const hiddenFailed = hiddenItems.some((item) => item.status === "failed");
  const hiddenDoneCount = hiddenItems.filter((item) => item.status === "done").reduce((sum, item) => sum + (item.doneCount ?? 0), 0);
  const hiddenDone = hiddenItems.some((item) => item.status === "done");
  const hiddenStatus = hiddenFailed ? { status: "failed", count: 0 } : hiddenDone ? { status: "done", count: hiddenDoneCount } : null;
  const warnedRef = useRef(false);
  useEffect(() => {
    const nodeEnv = globalThis.process?.env?.NODE_ENV;
    if (nodeEnv === "production" || warnedRef.current) return;
    const overflow = overflowedBarItems(orderedItems, barKeys);
    if (overflow.length === 0) return;
    warnedRef.current = true;
    console.warn(
      `[TopToolCapsule] ${ariaLabel}: \u5E2F\u306E\u4E0A\u9650\uFF08${maxBarItems}\uFF09\u3092\u8D85\u3048\u305F\u305F\u3081 ${overflow.map((item) => item.key).join(", ")} \u3092\u4E00\u89A7\u306E\u307F\u306B\u3057\u307E\u3057\u305F\u3002placement: 'list' \u3092\u660E\u793A\u3057\u3066\u304F\u3060\u3055\u3044\u3002`
    );
  });
  return /* @__PURE__ */ jsx("nav", { "aria-label": ariaLabel, "data-tour": dataTour, role: "toolbar", className: capsuleClass, children: /* @__PURE__ */ jsxs("div", { className: railClass, children: [
    barItems.map((item, i) => /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
      item.separatorBefore && i > 0 && /* @__PURE__ */ jsx("span", { className: sepClass, "aria-hidden": true }),
      /* @__PURE__ */ jsx(ToolButton, { item, variant })
    ] }, item.key)),
    showListPanel && /* @__PURE__ */ jsxs(Fragment, { children: [
      barItems.length > 0 && /* @__PURE__ */ jsx("span", { className: sepClass, "aria-hidden": true }),
      /* @__PURE__ */ jsx(
        ToolListHandle,
        {
          items: orderedItems,
          settingsLinks,
          variant,
          hiddenStatus
        }
      )
    ] })
  ] }) });
}
export {
  TopToolCapsule
};
//# sourceMappingURL=TopToolCapsule.js.map