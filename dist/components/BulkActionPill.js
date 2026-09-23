"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useId, useRef, useState } from "react";
const MENU_CLASS = "absolute bottom-full z-[60] mb-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 text-left shadow-xl";
const MENU_ITEM_CLASS = "flex w-full items-start justify-between gap-4 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--sb-accent-bg)] disabled:cursor-not-allowed disabled:opacity-40";
function actionClass(tone) {
  if (tone === "primary") return "sb-bulk-primary";
  if (tone === "danger") return "sb-bulk-btn danger";
  return "sb-bulk-btn";
}
function WithReason({ reason, children }) {
  if (!reason) return /* @__PURE__ */ jsx(Fragment, { children });
  return /* @__PURE__ */ jsx("span", { title: reason, className: "inline-flex", children });
}
function BulkPillActionButton({
  action,
  openMenuKey,
  onToggleMenu,
  onCloseMenu,
  menuAlign
}) {
  const menuId = useId();
  if (action.render) return /* @__PURE__ */ jsx(Fragment, { children: action.render });
  const hasMenu = !!action.menuItems && action.menuItems.length > 0;
  const open = hasMenu && openMenuKey === action.key;
  const label = action.busy ? action.busyLabel ?? action.label : action.label;
  const disabled = !!action.disabled || !!action.busy;
  const buttonClass = actionClass(action.tone);
  const run = (fn) => {
    onCloseMenu();
    fn();
  };
  const menu = open && action.menuItems ? /* @__PURE__ */ jsx(
    "div",
    {
      id: menuId,
      className: `${MENU_CLASS} ${menuAlign === "right" ? "right-0" : "left-0"}`,
      role: "group",
      "aria-label": action.menuAriaLabel ?? action.label,
      children: action.menuItems.map((item) => /* @__PURE__ */ jsxs("div", { children: [
        item.separatorBefore && /* @__PURE__ */ jsx("div", { className: "my-1 border-t border-gray-100", role: "separator" }),
        /* @__PURE__ */ jsx(WithReason, { reason: item.disabled ? item.disabledReason : void 0, children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            disabled: item.disabled,
            title: item.disabled ? item.disabledReason : void 0,
            onClick: () => run(item.onClick),
            className: MENU_ITEM_CLASS,
            children: [
              /* @__PURE__ */ jsxs("span", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("span", { className: "block truncate", children: item.label }),
                item.description && /* @__PURE__ */ jsx("span", { className: "mt-0.5 block truncate text-[11px] font-normal text-gray-400", children: item.description })
              ] }),
              typeof item.count === "number" && /* @__PURE__ */ jsxs("span", { className: "shrink-0 text-xs tabular-nums text-gray-400", children: [
                item.count.toLocaleString(),
                "\u4EF6"
              ] })
            ]
          }
        ) })
      ] }, item.key))
    }
  ) : null;
  if (hasMenu && !action.onClick) {
    return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(WithReason, { reason: disabled ? action.disabledReason : void 0, children: /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          disabled,
          title: action.disabled ? action.disabledReason : action.title,
          "aria-expanded": open,
          "aria-haspopup": "true",
          onClick: () => onToggleMenu(action.key),
          className: `${buttonClass} inline-flex items-center gap-1.5`,
          children: [
            action.busy && /* @__PURE__ */ jsx("span", { className: "h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70", "aria-hidden": "true" }),
            label,
            /* @__PURE__ */ jsx("span", { className: "text-[10px] opacity-70", "aria-hidden": "true", children: "\u25BE" })
          ]
        }
      ) }),
      menu
    ] });
  }
  if (hasMenu && action.onClick) {
    return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxs("span", { className: "inline-flex items-stretch", children: [
        /* @__PURE__ */ jsx(WithReason, { reason: disabled ? action.disabledReason : void 0, children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            disabled,
            title: action.disabled ? action.disabledReason : action.title,
            onClick: () => run(action.onClick),
            className: `${buttonClass} sb-bulk-split-main inline-flex items-center gap-1.5`,
            children: [
              action.busy && /* @__PURE__ */ jsx("span", { className: "h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70", "aria-hidden": "true" }),
              label
            ]
          }
        ) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            disabled: !!action.busy,
            "aria-label": `${action.label}\u306E\u7A2E\u985E\u3092\u9078\u3076`,
            "aria-expanded": open,
            "aria-haspopup": "true",
            onClick: () => onToggleMenu(action.key),
            className: `${buttonClass} sb-bulk-split-caret`,
            children: /* @__PURE__ */ jsx("span", { className: "text-[10px] opacity-80", "aria-hidden": "true", children: "\u25BE" })
          }
        )
      ] }),
      menu
    ] });
  }
  return /* @__PURE__ */ jsx(WithReason, { reason: disabled ? action.disabledReason : void 0, children: /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      disabled,
      title: action.disabled ? action.disabledReason : action.title,
      onClick: action.onClick,
      className: `${buttonClass} inline-flex items-center gap-1.5`,
      children: [
        action.busy && /* @__PURE__ */ jsx("span", { className: "h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70", "aria-hidden": "true" }),
        label
      ]
    }
  ) });
}
function BulkActionPill({
  ariaLabel,
  dataTour,
  selectedCount,
  selectedLabel = "\u4EF6\u9078\u629E",
  stats = [],
  leading,
  primary = [],
  secondary = [],
  onClear,
  clearLabel = "\u9078\u629E\u89E3\u9664",
  error
}) {
  const [openMenuKey, setOpenMenuKey] = useState(null);
  const pillRef = useRef(null);
  useEffect(() => {
    if (!openMenuKey) return;
    const closeOnOutsideClick = (event) => {
      if (pillRef.current && !pillRef.current.contains(event.target)) setOpenMenuKey(null);
    };
    const closeOnEscape = (event) => {
      if (event.isComposing) return;
      if (event.key === "Escape") setOpenMenuKey(null);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [openMenuKey]);
  const toggleMenu = (key) => setOpenMenuKey((current) => current === key ? null : key);
  const closeMenu = () => setOpenMenuKey(null);
  return /* @__PURE__ */ jsxs("div", { ref: pillRef, className: "sb-bulk-layer", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        role: "group",
        "aria-label": ariaLabel,
        "data-tour": dataTour,
        className: "sb-bulk-bar flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full px-5 py-2.5",
        children: [
          /* @__PURE__ */ jsxs("span", { className: "flex flex-wrap items-center gap-x-2 gap-y-0.5 whitespace-nowrap text-sm", children: [
            /* @__PURE__ */ jsxs("span", { className: "font-semibold tabular-nums", children: [
              selectedCount.toLocaleString(),
              selectedLabel
            ] }),
            stats.map((stat) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", title: stat.title, children: [
              /* @__PURE__ */ jsx("span", { className: "sb-bulk-stat-sep", "aria-hidden": "true", children: "\u30FB" }),
              /* @__PURE__ */ jsxs("span", { className: stat.tone === "warn" ? "sb-bulk-stat warn" : "sb-bulk-stat", children: [
                stat.label,
                " ",
                /* @__PURE__ */ jsx("span", { className: "tabular-nums", children: stat.count.toLocaleString() })
              ] })
            ] }, stat.key))
          ] }),
          leading,
          primary.length > 0 && /* @__PURE__ */ jsx("span", { className: "flex flex-wrap items-center gap-2", children: primary.map((action) => /* @__PURE__ */ jsx(
            BulkPillActionButton,
            {
              action,
              openMenuKey,
              onToggleMenu: toggleMenu,
              onCloseMenu: closeMenu,
              menuAlign: "left"
            },
            action.key
          )) }),
          secondary.length > 0 && /* @__PURE__ */ jsx("span", { className: "flex flex-wrap items-center gap-2", children: secondary.map((action) => /* @__PURE__ */ jsx(
            BulkPillActionButton,
            {
              action,
              openMenuKey,
              onToggleMenu: toggleMenu,
              onCloseMenu: closeMenu,
              menuAlign: "right"
            },
            action.key
          )) }),
          onClear && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
            closeMenu();
            onClear();
          }, className: "sb-bulk-clear", children: clearLabel })
        ]
      }
    ),
    error && /* @__PURE__ */ jsx("p", { className: "max-w-[min(48rem,100%)] rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 shadow-lg", role: "alert", children: error })
  ] });
}
var BulkActionPill_default = BulkActionPill;
export {
  BulkActionPill,
  BulkActionPill_default as default
};
//# sourceMappingURL=BulkActionPill.js.map