"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044",
  searchPlaceholder = "\u691C\u7D22",
  leadingOptions = [],
  emptyText = "\u9805\u76EE\u304C\u3042\u308A\u307E\u305B\u3093",
  className = "",
  disabled = false,
  variant = "default",
  ariaLabel
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listboxId = useId();
  const activeOptionId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : void 0;
  const inline = variant === "inline";
  const portalPanel = inline;
  const [panelNode, setPanelNode] = useState(null);
  const [panelPosition, setPanelPosition] = useState(null);
  useLayoutEffect(() => {
    if (!open || !portalPanel || typeof window === "undefined") return;
    const MARGIN = 8;
    const update = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
      const width = Math.min(Math.max(rect.width, 320), Math.max(160, viewportWidth - MARGIN * 2));
      const top = Math.max(MARGIN, Math.min(rect.bottom + 4, viewportHeight - 120));
      const maxHeight = Math.max(120, viewportHeight - top - MARGIN);
      const left = Math.min(Math.max(MARGIN, rect.left), Math.max(MARGIN, viewportWidth - width - MARGIN));
      setPanelPosition((prev) => prev && prev.top === top && prev.left === left && prev.width === width && prev.maxHeight === maxHeight ? prev : { top, left, width, maxHeight });
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
  }, [open, portalPanel, panelNode]);
  useEffect(() => {
    if (!open) return;
    const handle = (event) => {
      const target = event.target;
      if (rootRef.current?.contains(target)) return;
      if (panelNode?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, panelNode]);
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => q ? options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.keywords?.toLowerCase().includes(q)
    ) : options,
    [options, q]
  );
  const selectedLabel = useMemo(
    () => [...leadingOptions, ...options].find((o) => o.value === value)?.label,
    [leadingOptions, options, value]
  );
  const visibleOptions = useMemo(
    () => q ? filtered : [...leadingOptions, ...options],
    [filtered, leadingOptions, options, q]
  );
  const pick = (v) => {
    onChange(v);
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
  };
  const renderRow = (o, id) => {
    const on = value === o.value;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        id,
        role: "option",
        "aria-selected": on,
        onClick: () => pick(o.value),
        className: `flex w-full items-center justify-between gap-2 rounded px-1.5 py-1.5 text-left text-sm ${on ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`,
        children: [
          /* @__PURE__ */ jsx("span", { className: "truncate", children: o.label }),
          on && /* @__PURE__ */ jsx("svg", { className: "h-4 w-4 flex-shrink-0 text-blue-600", fill: "none", stroke: "currentColor", strokeWidth: 2.5, viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M5 13l4 4L19 7" }) })
        ]
      }
    );
  };
  const openSearch = () => {
    if (disabled) return;
    setOpen(true);
    setQuery("");
    setActiveIndex(-1);
  };
  const panelBody = /* @__PURE__ */ jsx("div", { className: "max-h-full overflow-y-auto p-1", style: portalPanel ? void 0 : { maxHeight: "14rem" }, children: visibleOptions.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-2 py-2 text-xs text-gray-400", children: q ? `\u300C${query}\u300D\u306B\u4E00\u81F4\u3059\u308B\u9805\u76EE\u304C\u3042\u308A\u307E\u305B\u3093` : emptyText }) : visibleOptions.map((option, index) => /* @__PURE__ */ jsx("div", { className: index === activeIndex ? "rounded bg-blue-50" : "", children: renderRow(option, `${listboxId}-option-${index}`) }, `${option.value || "__empty__"}:${index}`)) });
  return /* @__PURE__ */ jsxs("div", { ref: rootRef, className: `relative ${inline ? "min-w-0 " : ""}${className}`, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: inline ? (
          // 未フォーカス（候補を開いていない）ときは、文字の上でも ▾ と同じ手のカーソルにする
          // （2026-09-22 ユーザー決定。中身が input なので放っておくと I ビームになる）。
          // 開いて検索入力できる状態になったら input 側で cursor-text に戻す。
          `relative flex h-full w-full min-w-0 items-center border-0 bg-transparent text-sm transition-colors ${disabled ? "cursor-not-allowed text-gray-400" : open ? "text-gray-900" : "cursor-pointer text-gray-700"}`
        ) : `relative flex w-full items-center rounded-md border text-sm transition-colors ${disabled ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400" : open ? "border-blue-400 bg-white ring-2 ring-blue-100" : "border-gray-300 bg-white hover:border-gray-400"}`,
        children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: inputRef,
              type: "text",
              role: "combobox",
              "aria-controls": listboxId,
              "aria-expanded": open && !disabled,
              "aria-autocomplete": "list",
              "aria-activedescendant": open ? activeOptionId : void 0,
              "aria-label": ariaLabel,
              title: !open && selectedLabel ? selectedLabel : void 0,
              autoComplete: "off",
              value: open ? query : selectedLabel ?? "",
              onFocus: openSearch,
              onChange: (e) => {
                setOpen(true);
                setQuery(e.target.value);
                setActiveIndex(-1);
              },
              onKeyDown: (e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setOpen(true);
                  setActiveIndex((index) => Math.min(index + 1, visibleOptions.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveIndex((index) => Math.max(index - 1, 0));
                } else if (e.key === "Enter" && open && visibleOptions.length > 0) {
                  e.preventDefault();
                  pick(visibleOptions[activeIndex >= 0 ? activeIndex : 0].value);
                } else if (e.key === "Escape") {
                  if (open) e.stopPropagation();
                  setOpen(false);
                  setQuery("");
                  setActiveIndex(-1);
                  inputRef.current?.blur();
                }
              },
              placeholder: open ? searchPlaceholder : placeholder,
              disabled,
              className: inline ? `min-w-0 flex-1 truncate bg-transparent py-0 px-1 pr-5 text-sm font-medium outline-none ${disabled ? "cursor-not-allowed" : open ? "cursor-text" : "cursor-pointer"} ${selectedLabel && !open ? disabled ? "text-gray-400" : "text-gray-700" : "text-gray-700 placeholder:text-gray-400"}` : `min-w-0 flex-1 bg-transparent px-2.5 py-2 pr-8 outline-none ${selectedLabel && !open ? disabled ? "text-gray-500" : "text-gray-700" : "text-gray-700 placeholder:text-gray-400"}`
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              tabIndex: -1,
              onClick: () => {
                if (open) {
                  setOpen(false);
                  setQuery("");
                  setActiveIndex(-1);
                } else {
                  inputRef.current?.focus();
                }
              },
              disabled,
              "aria-label": open ? "\u5019\u88DC\u3092\u9589\u3058\u308B" : "\u5019\u88DC\u3092\u958B\u304F",
              className: `absolute right-0 flex h-full items-center justify-center text-gray-400 ${inline ? "w-5" : "w-8"}`,
              children: /* @__PURE__ */ jsx("svg", { className: `h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })
            }
          )
        ]
      }
    ),
    open && !disabled && !portalPanel && /* @__PURE__ */ jsx(
      "div",
      {
        id: listboxId,
        role: "listbox",
        className: "absolute left-0 z-30 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg",
        children: panelBody
      }
    ),
    open && !disabled && portalPanel && panelPosition && typeof document !== "undefined" ? createPortal(
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: setPanelNode,
          id: listboxId,
          role: "listbox",
          className: "themed-popover-panel fixed z-[80] flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg",
          style: {
            top: panelPosition.top,
            left: panelPosition.left,
            width: panelPosition.width,
            maxHeight: panelPosition.maxHeight
          },
          children: panelBody
        }
      ),
      document.body
    ) : null
  ] });
}
export {
  SearchableSelect
};
//# sourceMappingURL=SearchableSelect.js.map
