"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import {
  activeColumnSortLabel,
  anyColumnFilterActive,
  availableColumnSortDirs,
  clearColumnFilter,
  columnDateRangeError,
  columnFilterSummary,
  columnNumberRangeError,
  isColumnFilterActive,
  nextColumnSortDir,
  normalizeColumnNumberInput
} from "../lib/column-header.js";
const JUSTIFY = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end"
};
function ColumnSortArrow({ dir, label }) {
  if (!dir) {
    return /* @__PURE__ */ jsx(
      "span",
      {
        className: "text-[10px] leading-none text-gray-300 opacity-0 transition-opacity group-hover/ch:opacity-100",
        "aria-hidden": true,
        children: "\u2195"
      }
    );
  }
  return /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold leading-none text-[var(--sb-accent-bg)]", title: label ?? void 0, "aria-hidden": true, children: dir === "asc" ? "\u2191" : "\u2193" });
}
function FunnelMark({ title }) {
  return /* @__PURE__ */ jsx("span", { className: "inline-flex shrink-0 text-[var(--sb-accent-bg)]", title, "aria-hidden": true, children: /* @__PURE__ */ jsx("svg", { className: "h-3 w-3", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 .78 1.63L14 14.1V19a1 1 0 0 1-.55.9l-3 1.5A1 1 0 0 1 9 20.5v-6.4L3.22 5.63A1 1 0 0 1 3 5z" }) }) });
}
function ColumnHeaderCell({
  label,
  labelText,
  labelExtra,
  sort,
  sortUnavailableReason,
  presets,
  variant,
  filters,
  move,
  onHide,
  onOpenDisplaySettings,
  align = "center",
  title
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const panelId = useId();
  const hasFilters = Boolean(filters && filters.length > 0);
  const hasMenu = Boolean(
    sort || sortUnavailableReason || variant || hasFilters || move || onHide || onOpenDisplaySettings || presets && presets.length > 0
  );
  const activeLabel = activeColumnSortLabel(sort);
  const filterActive = anyColumnFilterActive(filters);
  const filterSummary = filterActive ? (filters ?? []).map(columnFilterSummary).filter((s) => Boolean(s)).join(" / ") : "";
  const toggleSort = useCallback(() => {
    if (!sort) return;
    const next = nextColumnSortDir(sort);
    if (next) sort.onSort(next);
    else sort.onClear();
  }, [sort]);
  const labelNode = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { className: "truncate", children: label }),
    labelExtra
  ] });
  const firstLabel = sort ? sort.labels[nextColumnSortDir({ ...sort, dir: null }) ?? "asc"] : "";
  return /* @__PURE__ */ jsxs("span", { className: `group/ch flex w-full min-w-0 items-center gap-0.5 ${JUSTIFY[align]}`, children: [
    sort ? /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: toggleSort,
        className: "inline-flex min-w-0 items-center gap-1 hover:text-gray-700",
        title: activeLabel ? `${labelText}: ${activeLabel}\uFF08\u30AF\u30EA\u30C3\u30AF\u3067\u5207\u308A\u66FF\u3048\uFF09` : `${title ?? labelText}\uFF08\u30AF\u30EA\u30C3\u30AF\u3067${firstLabel}\uFF09`,
        "aria-label": activeLabel ? `${labelText}\u3001\u73FE\u5728 ${activeLabel}` : `${labelText}\u3067\u4E26\u3073\u66FF\u3048`,
        children: [
          labelNode,
          /* @__PURE__ */ jsx(ColumnSortArrow, { dir: sort.dir, label: activeLabel })
        ]
      }
    ) : /* @__PURE__ */ jsx("span", { className: "inline-flex min-w-0 items-center gap-1", title, children: labelNode }),
    filterActive && /* @__PURE__ */ jsx(FunnelMark, { title: `\u7D5E\u308A\u8FBC\u307F\u4E2D: ${filterSummary}` }),
    hasMenu && /* @__PURE__ */ jsx(
      "button",
      {
        ref: triggerRef,
        type: "button",
        onClick: () => setOpen((value) => !value),
        "aria-haspopup": hasFilters ? "dialog" : "menu",
        "aria-expanded": open,
        "aria-controls": open ? panelId : void 0,
        "aria-label": `${labelText}\u5217\u306E\u30E1\u30CB\u30E5\u30FC`,
        title: `${labelText}\u5217\u306E\u30E1\u30CB\u30E5\u30FC\uFF08\u4E26\u3073\u66FF\u3048\u30FB\u7D5E\u308A\u8FBC\u307F\u30FB\u8868\u793A\uFF09`,
        className: `inline-flex h-5 w-4 shrink-0 items-center justify-center rounded text-gray-400 transition-opacity hover:bg-gray-100 hover:text-gray-700 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--sb-accent-bg)] group-hover/ch:opacity-100 ${open ? "bg-gray-100 text-gray-700 opacity-100" : "opacity-0"}`,
        children: /* @__PURE__ */ jsxs("svg", { className: "h-3.5 w-3.5", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true, children: [
          /* @__PURE__ */ jsx("circle", { cx: "12", cy: "5", r: "1.6" }),
          /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "1.6" }),
          /* @__PURE__ */ jsx("circle", { cx: "12", cy: "19", r: "1.6" })
        ] })
      }
    ),
    open && /* @__PURE__ */ jsx(
      ColumnHeaderMenuPanel,
      {
        id: panelId,
        anchorRef: triggerRef,
        labelText,
        sort,
        sortUnavailableReason,
        presets,
        variant,
        filters,
        move,
        onHide,
        onOpenDisplaySettings,
        onClose: () => {
          setOpen(false);
          triggerRef.current?.focus({ preventScroll: true });
        }
      }
    )
  ] });
}
const MENU_ITEM_CLASS = "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] leading-5 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent";
const MENU_SECTION_CLASS = "px-3 pb-0.5 pt-1.5 text-[11px] font-semibold text-gray-400";
const MENU_SEPARATOR_CLASS = "my-1 border-t border-gray-100";
const FIELD_CLASS = "h-8 w-full min-w-0 rounded-md border border-gray-300 bg-white px-2 text-[13px] text-gray-700 placeholder:text-gray-400 focus:border-[var(--sb-accent-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400";
const APPLY_BUTTON_CLASS = "inline-flex h-7 items-center rounded-md bg-[var(--sb-accent-bg)] px-2.5 text-[12px] font-semibold text-[var(--accent-on)] hover:bg-[var(--accent-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] disabled:cursor-not-allowed disabled:opacity-40";
function MenuCheck({ checked }) {
  return /* @__PURE__ */ jsx("span", { className: `w-3 shrink-0 text-center text-[11px] ${checked ? "text-[var(--sb-accent-bg)]" : "text-transparent"}`, "aria-hidden": true, children: "\u2713" });
}
function ColumnHeaderMenuPanel({
  id,
  anchorRef,
  labelText,
  sort,
  sortUnavailableReason,
  presets,
  variant,
  filters,
  move,
  onHide,
  onOpenDisplaySettings,
  onClose
}) {
  const [panel, setPanel] = useState(null);
  const [position, setPosition] = useState(null);
  const hasFilters = Boolean(filters && filters.length > 0);
  useLayoutEffect(() => {
    const MARGIN = 8;
    const update = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
      const top = Math.max(MARGIN, Math.min(rect.bottom + 4, viewportHeight - 120));
      const maxHeight = Math.max(120, viewportHeight - top - MARGIN);
      const width = panel?.offsetWidth ?? 0;
      const preferred = width > 0 ? rect.right - width : rect.left;
      const left = width > 0 ? Math.min(Math.max(MARGIN, preferred), Math.max(MARGIN, viewportWidth - width - MARGIN)) : Math.max(MARGIN, preferred);
      setPosition((prev) => prev && prev.top === top && prev.left === left && prev.maxHeight === maxHeight ? prev : { top, left, maxHeight });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorRef, panel]);
  useEffect(() => {
    const onPointerDown = (event) => {
      const target = event.target;
      if (panel?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anchorRef, onClose, panel]);
  useEffect(() => {
    if (!panel) return;
    panel.querySelector("button:not(:disabled), input:not(:disabled)")?.focus({ preventScroll: true });
  }, [panel]);
  const onPanelKeyDown = (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    if (event.target.tagName === "INPUT") return;
    event.preventDefault();
    const items = Array.from(panel?.querySelectorAll("button:not(:disabled)") ?? []);
    if (items.length === 0) return;
    const current = items.indexOf(document.activeElement);
    const next = event.key === "ArrowDown" ? (current + 1 + items.length) % items.length : (current - 1 + items.length) % items.length;
    items[next]?.focus({ preventScroll: true });
  };
  const run = (action) => () => {
    action();
    onClose();
  };
  if (typeof document === "undefined") return null;
  const sortDirs = sort ? availableColumnSortDirs(sort) : [];
  const anyFilterActive = anyColumnFilterActive(filters);
  let sectionCount = 0;
  const separator = () => sectionCount++ > 0 ? /* @__PURE__ */ jsx("div", { role: "separator", className: MENU_SEPARATOR_CLASS }) : null;
  return createPortal(
    /* @__PURE__ */ jsxs(
      "div",
      {
        id,
        ref: setPanel,
        role: hasFilters ? "dialog" : "menu",
        "aria-label": `${labelText}\u5217\u306E\u30E1\u30CB\u30E5\u30FC`,
        onKeyDown: onPanelKeyDown,
        className: "themed-popover-panel fixed z-[90] min-w-[13rem] max-w-[20rem] overflow-y-auto overscroll-contain rounded-lg border border-gray-200 bg-white py-1 shadow-xl",
        style: {
          top: position?.top ?? -9999,
          left: position?.left ?? -9999,
          maxHeight: position?.maxHeight,
          opacity: position ? void 0 : 0
        },
        children: [
          presets && presets.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            separator(),
            /* @__PURE__ */ jsx("div", { className: MENU_SECTION_CLASS, children: "\u4E00\u89A7\u5168\u4F53\u306E\u4E26\u3073" }),
            presets.map((preset) => /* @__PURE__ */ jsxs("button", { type: "button", role: "menuitemradio", "aria-checked": preset.active, className: MENU_ITEM_CLASS, onClick: run(preset.onSelect), children: [
              /* @__PURE__ */ jsx(MenuCheck, { checked: preset.active }),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: preset.label })
            ] }, preset.key))
          ] }),
          sort && /* @__PURE__ */ jsxs(Fragment, { children: [
            separator(),
            /* @__PURE__ */ jsx("div", { className: MENU_SECTION_CLASS, children: "\u3053\u306E\u5217\u3067\u4E26\u3073\u66FF\u3048" }),
            sortDirs.map((dir) => /* @__PURE__ */ jsxs("button", { type: "button", role: "menuitemradio", "aria-checked": sort.dir === dir, className: MENU_ITEM_CLASS, onClick: run(() => sort.onSort(dir)), children: [
              /* @__PURE__ */ jsx(MenuCheck, { checked: sort.dir === dir }),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: sort.labels[dir] })
            ] }, dir)),
            /* @__PURE__ */ jsxs("button", { type: "button", role: "menuitem", className: MENU_ITEM_CLASS, disabled: !sort.dir, onClick: run(sort.onClear), children: [
              /* @__PURE__ */ jsx(MenuCheck, { checked: false }),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: "\u3053\u306E\u5217\u306E\u4E26\u3073\u66FF\u3048\u3092\u3084\u3081\u308B" })
            ] })
          ] }),
          !sort && sortUnavailableReason && /* @__PURE__ */ jsxs(Fragment, { children: [
            separator(),
            /* @__PURE__ */ jsx("div", { className: MENU_SECTION_CLASS, children: "\u3053\u306E\u5217\u3067\u4E26\u3073\u66FF\u3048" }),
            /* @__PURE__ */ jsx("p", { className: "px-3 pb-1 text-[12px] leading-5 text-gray-400", children: sortUnavailableReason })
          ] }),
          hasFilters && /* @__PURE__ */ jsxs(Fragment, { children: [
            separator(),
            (filters ?? []).map((filter, index) => /* @__PURE__ */ jsx(
              ColumnFilterSection,
              {
                filter,
                heading: filter.label ?? "\u3053\u306E\u5217\u3067\u7D5E\u308A\u8FBC\u307F",
                onClose
              },
              `${filter.kind}:${filter.label ?? index}`
            )),
            anyFilterActive && /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                role: "menuitem",
                className: MENU_ITEM_CLASS,
                onClick: run(() => (filters ?? []).forEach(clearColumnFilter)),
                children: [
                  /* @__PURE__ */ jsx(MenuCheck, { checked: false }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: "\u3053\u306E\u5217\u306E\u7D5E\u308A\u8FBC\u307F\u3092\u89E3\u9664" })
                ]
              }
            )
          ] }),
          variant && variant.options.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            separator(),
            /* @__PURE__ */ jsx("div", { className: MENU_SECTION_CLASS, children: variant.label }),
            variant.options.map((option) => /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                role: "menuitemradio",
                "aria-checked": variant.value === option.value,
                className: MENU_ITEM_CLASS,
                title: option.hint,
                onClick: run(() => variant.onChange(option.value)),
                children: [
                  /* @__PURE__ */ jsx(MenuCheck, { checked: variant.value === option.value }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: option.label })
                ]
              },
              option.value
            ))
          ] }),
          move && /* @__PURE__ */ jsxs(Fragment, { children: [
            separator(),
            /* @__PURE__ */ jsxs("button", { type: "button", role: "menuitem", className: MENU_ITEM_CLASS, disabled: !move.onMoveLeft, onClick: move.onMoveLeft ? run(move.onMoveLeft) : void 0, children: [
              /* @__PURE__ */ jsx("span", { className: "w-3 shrink-0 text-center text-[11px] text-gray-400", "aria-hidden": true, children: "\u2190" }),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: "\u5DE6\u3078\u79FB\u52D5" })
            ] }),
            /* @__PURE__ */ jsxs("button", { type: "button", role: "menuitem", className: MENU_ITEM_CLASS, disabled: !move.onMoveRight, onClick: move.onMoveRight ? run(move.onMoveRight) : void 0, children: [
              /* @__PURE__ */ jsx("span", { className: "w-3 shrink-0 text-center text-[11px] text-gray-400", "aria-hidden": true, children: "\u2192" }),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: "\u53F3\u3078\u79FB\u52D5" })
            ] })
          ] }),
          (onHide || onOpenDisplaySettings) && /* @__PURE__ */ jsxs(Fragment, { children: [
            separator(),
            onHide && /* @__PURE__ */ jsxs("button", { type: "button", role: "menuitem", className: MENU_ITEM_CLASS, onClick: run(onHide), children: [
              /* @__PURE__ */ jsx(MenuCheck, { checked: false }),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: "\u3053\u306E\u5217\u3092\u96A0\u3059" })
            ] }),
            onOpenDisplaySettings && /* @__PURE__ */ jsxs("button", { type: "button", role: "menuitem", className: MENU_ITEM_CLASS, onClick: run(onOpenDisplaySettings), children: [
              /* @__PURE__ */ jsx(MenuCheck, { checked: false }),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: "\u8868\u793A\u8A2D\u5B9A\u2026" })
            ] })
          ] })
        ]
      }
    ),
    document.body
  );
}
function ColumnFilterSection({ filter, heading, onClose }) {
  const active = isColumnFilterActive(filter);
  return /* @__PURE__ */ jsxs("div", { className: "pb-1", children: [
    /* @__PURE__ */ jsxs("div", { className: `${MENU_SECTION_CLASS} flex items-center gap-1`, children: [
      /* @__PURE__ */ jsx("span", { className: "truncate", children: heading }),
      active && /* @__PURE__ */ jsx("span", { className: "text-[var(--sb-accent-bg)]", "aria-label": "\u9069\u7528\u4E2D", children: "\u25CF" })
    ] }),
    filter.disabledReason ? /* @__PURE__ */ jsx("p", { className: "px-3 pb-1 text-[12px] leading-5 text-gray-400", children: filter.disabledReason }) : filter.kind === "text" ? /* @__PURE__ */ jsx(TextFilterField, { filter, onClose }) : filter.kind === "numberRange" ? /* @__PURE__ */ jsx(NumberRangeFilterField, { filter, onClose }) : filter.kind === "dateRange" ? /* @__PURE__ */ jsx(DateRangeFilterField, { filter, onClose }) : filter.kind === "enum" ? /* @__PURE__ */ jsx(EnumFilterField, { filter, onClose }) : /* @__PURE__ */ jsx(BooleanFilterField, { filter, onClose }),
    filter.hint && !filter.disabledReason && /* @__PURE__ */ jsx("p", { className: "px-3 pt-0.5 text-[11px] leading-4 text-gray-400", children: filter.hint })
  ] });
}
function TextFilterField({ filter, onClose }) {
  const [draft, setDraft] = useState(filter.value);
  const submit = (event) => {
    event.preventDefault();
    filter.onChange(draft.trim());
    onClose();
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "flex items-center gap-1.5 px-3 py-1", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "text",
        value: draft,
        onChange: (event) => setDraft(event.target.value),
        placeholder: filter.placeholder ?? "\u542B\u3080\u6587\u5B57",
        "aria-label": filter.label ?? "\u542B\u3080\u6587\u5B57",
        className: FIELD_CLASS
      }
    ),
    /* @__PURE__ */ jsx("button", { type: "submit", className: APPLY_BUTTON_CLASS, disabled: draft.trim() === filter.value.trim(), children: "\u9069\u7528" })
  ] });
}
function NumberRangeFilterField({ filter, onClose }) {
  const [min, setMin] = useState(filter.min);
  const [max, setMax] = useState(filter.max);
  const error = columnNumberRangeError(min, max);
  const unit = filter.unit ?? "";
  const prefix = (filter.unitPosition ?? (unit === "\xA5" ? "prefix" : "suffix")) === "prefix";
  const unchanged = min === filter.min && max === filter.max;
  const submit = (event) => {
    event.preventDefault();
    if (error) return;
    filter.onChange({ min, max });
    onClose();
  };
  const field = (value, set, placeholder) => /* @__PURE__ */ jsxs("span", { className: "flex min-w-0 flex-1 items-center gap-1", children: [
    unit && prefix && /* @__PURE__ */ jsx("span", { className: "text-[12px] text-gray-500", children: unit }),
    /* @__PURE__ */ jsx(
      "input",
      {
        inputMode: filter.allowDecimal ? "decimal" : "numeric",
        value,
        onChange: (event) => set(normalizeColumnNumberInput(event.target.value, filter.allowDecimal)),
        placeholder,
        "aria-label": `${filter.label ?? ""}${placeholder}`,
        className: `${FIELD_CLASS} text-right tabular-nums`
      }
    ),
    unit && !prefix && /* @__PURE__ */ jsx("span", { className: "text-[12px] text-gray-500", children: unit })
  ] });
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "px-3 py-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
      field(min, setMin, "\u4E0B\u9650"),
      /* @__PURE__ */ jsx("span", { className: "text-[11px] text-gray-400", children: "\u301C" }),
      field(max, setMax, "\u4E0A\u9650")
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[11px] text-red-600", role: error ? "alert" : void 0, children: error ?? "" }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: APPLY_BUTTON_CLASS, disabled: Boolean(error) || unchanged, children: "\u9069\u7528" })
    ] })
  ] });
}
function DateRangeFilterField({ filter, onClose }) {
  const [from, setFrom] = useState(filter.from);
  const [to, setTo] = useState(filter.to);
  const error = columnDateRangeError(from, to);
  const unchanged = from === filter.from && to === filter.to;
  const submit = (event) => {
    event.preventDefault();
    if (error) return;
    filter.onChange({ from, to });
    onClose();
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "px-3 py-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsx("input", { type: "date", value: from, max: to || void 0, onChange: (event) => setFrom(event.target.value), "aria-label": `${filter.label ?? ""}\u958B\u59CB\u65E5`, className: FIELD_CLASS }),
      /* @__PURE__ */ jsx("span", { className: "text-[11px] text-gray-400", children: "\u301C" }),
      /* @__PURE__ */ jsx("input", { type: "date", value: to, min: from || void 0, onChange: (event) => setTo(event.target.value), "aria-label": `${filter.label ?? ""}\u7D42\u4E86\u65E5`, className: FIELD_CLASS })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[11px] text-red-600", role: error ? "alert" : void 0, children: error ?? "" }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: APPLY_BUTTON_CLASS, disabled: Boolean(error) || unchanged, children: "\u9069\u7528" })
    ] })
  ] });
}
function EnumFilterField({ filter, onClose }) {
  const multiple = filter.multiple !== false;
  const selected = new Set(filter.value);
  if (!multiple) {
    return /* @__PURE__ */ jsxs("div", { role: "group", "aria-label": filter.label ?? "\u3053\u306E\u5217\u3067\u7D5E\u308A\u8FBC\u307F", children: [
      /* @__PURE__ */ jsxs("button", { type: "button", role: "menuitemradio", "aria-checked": selected.size === 0, className: MENU_ITEM_CLASS, onClick: () => {
        filter.onChange([]);
        onClose();
      }, children: [
        /* @__PURE__ */ jsx(MenuCheck, { checked: selected.size === 0 }),
        /* @__PURE__ */ jsx("span", { className: "truncate", children: "\u3059\u3079\u3066" })
      ] }),
      filter.options.map((option) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          role: "menuitemradio",
          "aria-checked": selected.has(option.value),
          className: MENU_ITEM_CLASS,
          title: option.hint,
          onClick: () => {
            filter.onChange([option.value]);
            onClose();
          },
          children: [
            /* @__PURE__ */ jsx(MenuCheck, { checked: selected.has(option.value) }),
            /* @__PURE__ */ jsx("span", { className: "truncate", children: option.label })
          ]
        },
        option.value
      ))
    ] });
  }
  return /* @__PURE__ */ jsx("div", { role: "group", "aria-label": filter.label ?? "\u3053\u306E\u5217\u3067\u7D5E\u308A\u8FBC\u307F", children: filter.options.map((option) => {
    const checked = selected.has(option.value);
    return /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        role: "menuitemcheckbox",
        "aria-checked": checked,
        className: MENU_ITEM_CLASS,
        title: option.hint,
        onClick: () => {
          filter.onChange(checked ? filter.value.filter((v) => v !== option.value) : [...filter.value, option.value]);
        },
        children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: `flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border text-[9px] leading-none ${checked ? "border-[var(--sb-accent-bg)] bg-[var(--sb-accent-bg)] text-[var(--accent-on)]" : "border-gray-300 text-transparent"}`,
              "aria-hidden": true,
              children: "\u2713"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: option.label })
        ]
      },
      option.value
    );
  }) });
}
function BooleanFilterField({ filter, onClose }) {
  const choices = [
    { value: null, label: "\u3059\u3079\u3066" },
    { value: true, label: filter.trueLabel },
    ...filter.falseLabel ? [{ value: false, label: filter.falseLabel }] : []
  ];
  return /* @__PURE__ */ jsx("div", { role: "group", "aria-label": filter.label ?? "\u3053\u306E\u5217\u3067\u7D5E\u308A\u8FBC\u307F", children: choices.map((choice) => /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      role: "menuitemradio",
      "aria-checked": filter.value === choice.value,
      className: MENU_ITEM_CLASS,
      onClick: () => {
        filter.onChange(choice.value);
        onClose();
      },
      children: [
        /* @__PURE__ */ jsx(MenuCheck, { checked: filter.value === choice.value }),
        /* @__PURE__ */ jsx("span", { className: "truncate", children: choice.label })
      ]
    },
    String(choice.value)
  )) });
}
export {
  ColumnHeaderCell
};
//# sourceMappingURL=ColumnHeaderMenu.js.map