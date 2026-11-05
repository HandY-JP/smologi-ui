"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import { filterDateRangeError } from "../lib/filter-controls.js";
import { useDismiss } from "./Modal.js";
function ActiveFilterChips({
  chips,
  onClearAll
}) {
  if (chips.length === 0) return null;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [
    chips.map((chip) => /* @__PURE__ */ jsxs(
      "span",
      {
        className: "inline-flex items-center gap-1 rounded-full border border-[var(--sb-accent-bg)]/40 bg-[var(--sb-accent-bg)]/5 py-0.5 pl-2.5 pr-1 text-[12px] leading-[18px] text-[var(--sb-accent-bg)]",
        children: [
          /* @__PURE__ */ jsxs("span", { className: "text-[rgb(var(--ink-muted))]", children: [
            chip.label,
            ":"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: chip.valueLabel }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: chip.onClear,
              className: "ml-0.5 rounded-full p-0.5 hover:bg-[var(--sb-accent-bg)]/10",
              "aria-label": `${chip.label}\u306E\u7D5E\u308A\u8FBC\u307F\u3092\u89E3\u9664`,
              children: /* @__PURE__ */ jsx("svg", { className: "h-3 w-3", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) })
            }
          )
        ]
      },
      chip.key
    )),
    chips.length > 1 && onClearAll && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: onClearAll,
        className: "text-[12px] leading-[18px] text-[rgb(var(--ink-muted))] underline-offset-2 hover:text-[rgb(var(--ink))] hover:underline",
        children: "\u3059\u3079\u3066\u89E3\u9664"
      }
    )
  ] });
}
const FilterChipsHostContext = createContext(null);
function FilterChipsHostProvider({ host, children }) {
  return /* @__PURE__ */ jsx(FilterChipsHostContext.Provider, { value: host, children });
}
const CollapsedFilterTriggerContext = createContext(false);
function CollapsedFilterTriggerProvider({ collapsed, children }) {
  return /* @__PURE__ */ jsx(CollapsedFilterTriggerContext.Provider, { value: collapsed, children });
}
function FilterTriggerButton({
  label = "\u7D5E\u308A\u8FBC\u307F",
  activeCount,
  open,
  onToggle,
  title,
  ariaControls,
  iconBadge = "dot"
}) {
  const iconOnly = useContext(CollapsedFilterTriggerContext);
  const triggerTitle = title ?? (activeCount > 0 ? `${label}\uFF08${activeCount}\u4EF6\u306E\u6761\u4EF6\u3092\u6307\u5B9A\u4E2D\uFF09` : label);
  const triggerAriaLabel = activeCount > 0 ? `${label}\u3001${activeCount}\u4EF6\u306E\u6761\u4EF6\u3092\u6307\u5B9A\u4E2D` : label;
  if (iconOnly) {
    return /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: onToggle,
        "aria-expanded": open,
        "aria-controls": ariaControls,
        title: triggerTitle,
        "aria-label": triggerAriaLabel,
        className: `relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--search-accent)] ${activeCount > 0 || open ? "text-[var(--search-accent)] hover:bg-[var(--search-accent-light)]" : "text-[rgb(var(--ink-muted))] hover:bg-[rgb(var(--surface-subtle))] hover:text-[rgb(var(--ink))]"}`,
        children: [
          /* @__PURE__ */ jsx("svg", { className: "h-[18px] w-[18px]", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", "aria-hidden": true, children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              d: "M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
            }
          ) }),
          activeCount > 0 && iconBadge === "count" && /* @__PURE__ */ jsx(
            "span",
            {
              className: "pointer-events-none absolute -right-0.5 -top-0.5 min-w-[1.125rem] rounded-full bg-[var(--search-accent)] px-1 text-center text-[11px] font-semibold leading-[1.125rem] text-[rgb(var(--on-accent))] ring-2 ring-[rgb(var(--surface))]",
              "aria-hidden": true,
              children: activeCount
            }
          ),
          activeCount > 0 && iconBadge === "dot" && /* @__PURE__ */ jsx(
            "span",
            {
              className: "pointer-events-none absolute right-1 top-1 h-2 w-2 rounded-full bg-[rgb(var(--danger-solid))] ring-2 ring-white",
              "aria-hidden": true
            }
          )
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: onToggle,
      "aria-expanded": open,
      "aria-controls": ariaControls,
      title: triggerTitle,
      "aria-label": triggerAriaLabel,
      className: `relative mr-1.5 flex h-8 min-w-[7rem] items-center justify-center rounded-full px-7 text-[12px] font-semibold leading-none transition-colors ${activeCount > 0 || open ? "bg-[var(--search-accent-light)] text-[var(--search-accent)]" : "text-[rgb(var(--ink-muted))] hover:bg-[rgb(var(--surface-subtle))] hover:text-[rgb(var(--ink))]"}`,
      children: [
        label,
        activeCount > 0 && /* @__PURE__ */ jsx("span", { className: "absolute left-2 rounded-full bg-[var(--search-accent)] px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white", children: activeCount }),
        /* @__PURE__ */ jsx(
          "svg",
          {
            className: `absolute right-2.5 h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`,
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            "aria-hidden": true,
            children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
          }
        )
      ]
    }
  );
}
function FilterPopover({
  activeCount,
  onClearAll,
  chips = [],
  children,
  footer,
  tabs,
  title = "\u7D5E\u308A\u8FBC\u307F\u6761\u4EF6",
  description,
  triggerLabel = "\u7D5E\u308A\u8FBC\u307F",
  panelWidthClass,
  columns = 1,
  align = "right",
  triggerTitle,
  panelPortal = false,
  triggerBadge = "dot"
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const [panelNode, setPanelNode] = useState(null);
  const chipsHost = useContext(FilterChipsHostContext);
  const [panelPosition, setPanelPosition] = useState(null);
  useLayoutEffect(() => {
    if (!open || !panelPortal) return;
    const MARGIN = 8;
    const update = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
      const top = Math.max(MARGIN, Math.min(rect.bottom + MARGIN, viewportHeight - 160));
      const maxHeight = Math.max(160, viewportHeight - top - MARGIN);
      const width = panelNode?.offsetWidth ?? 0;
      const preferred = align === "right" && width > 0 ? rect.right - width : rect.left;
      const left = width > 0 ? Math.min(Math.max(MARGIN, preferred), Math.max(MARGIN, viewportWidth - width - MARGIN)) : Math.max(MARGIN, preferred);
      setPanelPosition((prev) => prev && prev.top === top && prev.left === left && prev.maxHeight === maxHeight ? prev : { top, left, maxHeight });
    };
    update();
    const startedAt = Date.now();
    let frame = requestAnimationFrame(function follow() {
      update();
      if (Date.now() - startedAt < 400) frame = requestAnimationFrame(follow);
    });
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, panelPortal, align, panelNode]);
  const dismiss = () => {
    setOpen(false);
    rootRef.current?.querySelector("button[aria-expanded]")?.focus({ preventScroll: true });
  };
  useDismiss(panelPortal ? panelRef : rootRef, dismiss, { enabled: open, ignore: rootRef });
  const clearDisabled = !onClearAll || activeCount === 0;
  const panelBody = /* @__PURE__ */ jsxs(Fragment, { children: [
    tabs && /* @__PURE__ */ jsx("div", { className: "mb-3 flex gap-1 rounded-lg bg-[rgb(var(--surface-subtle))] p-1", children: tabs.items.map((item) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => tabs.onChange(item.key),
        className: `flex-1 rounded-md px-3 py-1.5 text-[14px] leading-[22px] font-medium ${tabs.active === item.key ? "bg-[rgb(var(--surface))] text-[var(--sb-accent-bg)] shadow-sm" : "text-[rgb(var(--ink-muted))]"}`,
        children: item.label
      },
      item.key
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[14px] leading-[22px] font-semibold text-[rgb(var(--ink))]", children: title }),
        description && /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[12px] leading-[18px] text-[rgb(var(--ink-muted))]", children: description })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onClearAll,
          disabled: clearDisabled,
          className: "shrink-0 text-[12px] leading-[18px] text-[rgb(var(--ink-muted))] hover:text-[rgb(var(--ink))] disabled:opacity-40",
          children: "\u3059\u3079\u3066\u30AF\u30EA\u30A2"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: columns === 2 ? "mt-3 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2" : "mt-3 space-y-3", children }),
    footer && /* @__PURE__ */ jsx("div", { className: "mt-3 flex justify-end border-t border-[rgb(var(--line))] pt-3", children: footer })
  ] });
  const resolvedWidthClass = panelWidthClass ?? (columns === 2 ? "w-[44rem]" : "w-80");
  const panelClass = `${resolvedWidthClass} max-w-[calc(100vw-3rem)] overflow-y-auto overscroll-contain rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] p-4 shadow-xl`;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: rootRef,
      className: `${open ? "relative z-50" : "relative"} flex h-full shrink-0 items-center`,
      children: [
        /* @__PURE__ */ jsx(
          FilterTriggerButton,
          {
            label: triggerLabel,
            activeCount,
            open,
            onToggle: () => {
              setPanelPosition(null);
              setOpen((value) => !value);
            },
            title: triggerTitle,
            iconBadge: triggerBadge
          }
        ),
        open && !panelPortal && /* @__PURE__ */ jsx(
          "div",
          {
            className: `absolute ${align === "right" ? "right-0" : "left-0"} top-full z-30 mt-2 ${panelClass}`,
            style: { maxHeight: "calc(100vh - 8rem)" },
            children: panelBody
          }
        ),
        open && panelPortal && panelPosition && typeof document !== "undefined" ? createPortal(
          /* @__PURE__ */ jsx(
            "div",
            {
              ref: (node) => {
                panelRef.current = node;
                setPanelNode(node);
              },
              className: `fixed z-[80] ${panelClass}`,
              style: { top: panelPosition.top, left: panelPosition.left, maxHeight: panelPosition.maxHeight },
              children: panelBody
            }
          ),
          document.body
        ) : null,
        chipsHost && chips.length > 0 ? createPortal(/* @__PURE__ */ jsx(ActiveFilterChips, { chips, onClearAll }), chipsHost) : null
      ]
    }
  );
}
function FilterSection({
  title,
  first = false,
  active = false,
  columns = 1,
  children
}) {
  return /* @__PURE__ */ jsxs("section", { className: first ? "" : "border-t border-[rgb(var(--line))] pt-3", children: [
    /* @__PURE__ */ jsxs("h3", { className: "mb-2 flex items-center gap-1.5 text-[11px] leading-[16px] font-semibold tracking-wide text-[rgb(var(--ink-muted))]", children: [
      /* @__PURE__ */ jsx("span", { children: title }),
      active && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--search-accent)]",
            "aria-hidden": true
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "\u9069\u7528\u4E2D\u306E\u6761\u4EF6\u304C\u3042\u308A\u307E\u3059" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: columns === 2 ? "grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] items-start gap-x-4 gap-y-3" : "space-y-3",
        children
      }
    )
  ] });
}
function FilterChipToggle({
  label,
  pressed,
  onToggle,
  title
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: onToggle,
      "aria-pressed": pressed,
      title,
      className: `inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] leading-[18px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--search-accent)] ${pressed ? "border-[var(--search-accent)] bg-[var(--search-accent)] text-white shadow-sm" : "border-[rgb(var(--line))] bg-[rgb(var(--surface))] text-[rgb(var(--ink-muted))] hover:border-[rgb(var(--line-strong))] hover:bg-[rgb(var(--surface-subtle))] hover:text-[rgb(var(--ink))]"}`,
      children: label
    }
  );
}
function FilterChipGroup({
  label,
  children,
  ariaLabel
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    label && /* @__PURE__ */ jsx("div", { className: "mb-1.5 text-[12px] leading-[18px] font-medium text-[rgb(var(--ink-muted))]", children: label }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-1.5", role: "group", "aria-label": ariaLabel ?? label, children })
  ] });
}
function FilterField({
  label,
  hint,
  children,
  span = 1
}) {
  return /* @__PURE__ */ jsxs("div", { className: span === 2 ? "sm:col-span-2" : void 0, children: [
    /* @__PURE__ */ jsx("span", { className: "mb-1 block text-[12px] leading-[18px] text-[rgb(var(--ink-muted))]", children: label }),
    children,
    hint && /* @__PURE__ */ jsx("p", { className: "mt-1 text-[11px] leading-[16px] text-[rgb(var(--ink-muted))]", children: hint })
  ] });
}
const FILTER_INPUT_CLASS = "w-full rounded-md border border-[rgb(var(--line-strong))] bg-[rgb(var(--surface))] px-2 py-2 text-[14px] leading-[22px] text-[rgb(var(--ink))] focus:outline-none focus:ring-1 focus:ring-[var(--sb-accent-bg)]";
function FilterSelect({
  label,
  value,
  onChange,
  options
}) {
  return /* @__PURE__ */ jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsx("span", { className: "mb-1 block text-[12px] leading-[18px] text-[rgb(var(--ink-muted))]", children: label }),
    /* @__PURE__ */ jsx("select", { value, onChange: (event) => onChange(event.target.value), className: FILTER_INPUT_CLASS, children: options.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value)) })
  ] });
}
function FilterCheckbox({
  label,
  checked,
  onChange,
  tone = "accent"
}) {
  const toneClass = tone === "rose" ? "text-[rgb(var(--danger-ink))] focus:ring-[rgb(var(--danger-solid))]" : tone === "gray" ? "text-[rgb(var(--ink-muted))] focus:ring-gray-500" : "text-[var(--sb-accent-bg)] focus:ring-[var(--sb-accent-bg)]";
  return /* @__PURE__ */ jsxs("label", { className: "flex cursor-pointer items-center gap-2 text-[12px] leading-[18px] text-[rgb(var(--ink))]", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "checkbox",
        checked,
        onChange: (event) => onChange(event.target.checked),
        className: `h-4 w-4 rounded border-[rgb(var(--line-strong))] ${toneClass}`
      }
    ),
    label
  ] });
}
function FilterDateRange({
  label,
  from,
  to,
  onChangeFrom,
  onChangeTo,
  fromLabel = "\u958B\u59CB\u65E5",
  toLabel = "\u7D42\u4E86\u65E5"
}) {
  const error = filterDateRangeError(from, to);
  return /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
    label && /* @__PURE__ */ jsx("p", { className: "mb-1 text-[12px] leading-[18px] font-semibold text-[rgb(var(--ink-muted))]", children: label }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxs("label", { children: [
        /* @__PURE__ */ jsx("span", { className: "mb-1 block text-[12px] leading-[18px] text-[rgb(var(--ink-muted))]", children: fromLabel }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: from,
            onChange: (event) => onChangeFrom(event.target.value),
            "aria-label": label ? `${label}\u306E${fromLabel}` : fromLabel,
            "aria-invalid": error ? true : void 0,
            className: FILTER_INPUT_CLASS
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("label", { children: [
        /* @__PURE__ */ jsx("span", { className: "mb-1 block text-[12px] leading-[18px] text-[rgb(var(--ink-muted))]", children: toLabel }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "date",
            value: to,
            onChange: (event) => onChangeTo(event.target.value),
            "aria-label": label ? `${label}\u306E${toLabel}` : toLabel,
            "aria-invalid": error ? true : void 0,
            className: FILTER_INPUT_CLASS
          }
        )
      ] })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "mt-1 text-[12px] leading-[18px] text-[rgb(var(--danger-ink))]", children: error })
  ] });
}
export {
  ActiveFilterChips,
  CollapsedFilterTriggerProvider,
  FilterCheckbox,
  FilterChipGroup,
  FilterChipToggle,
  FilterChipsHostProvider,
  FilterDateRange,
  FilterField,
  FilterPopover,
  FilterSection,
  FilterSelect,
  FilterTriggerButton
};
//# sourceMappingURL=FilterPopover.js.map