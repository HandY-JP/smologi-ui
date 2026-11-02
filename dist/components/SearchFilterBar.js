"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import {
  useEffect,
  useRef,
  useState
} from "react";
import { CollapsedFilterTriggerProvider, FilterChipsHostProvider } from "./FilterPopover.js";
const SEARCH_ICON_PATH = "m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z";
function SearchFilterBar({
  value,
  onValueChange,
  onSearch,
  onCleared,
  placeholder,
  filterControl,
  countLabel,
  disabled = false,
  loading = false,
  dirty = false,
  className = "",
  inputAriaLabel = "\u691C\u7D22",
  inputRef,
  accentColor = "var(--sb-accent-bg)",
  accentLightColor = "var(--accent-subtle)",
  collapsible = false
}) {
  const [expanded, setExpanded] = useState(false);
  const searchBoxRef = useRef(null);
  const collapsed = collapsible && !expanded && value.length === 0;
  useEffect(() => {
    if (expanded) searchBoxRef.current?.querySelector("input")?.focus();
  }, [expanded]);
  const runSearch = () => {
    if (!disabled && !loading) onSearch();
  };
  const collapseIfEmpty = () => {
    if (collapsible && value.length === 0) setExpanded(false);
  };
  const onInputBlur = (event) => {
    const next = event.relatedTarget;
    if (next && searchBoxRef.current?.contains(next)) return;
    collapseIfEmpty();
  };
  const onInputKeyDown = (event) => {
    if (event.key === "Escape") {
      if (event.nativeEvent.isComposing) return;
      if (collapsible && value.length === 0) {
        event.preventDefault();
        event.currentTarget.blur();
        setExpanded(false);
      }
      return;
    }
    if (event.key !== "Enter") return;
    if (event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.stopPropagation();
    runSearch();
  };
  const style = {
    "--search-accent": accentColor,
    "--search-accent-light": accentLightColor
  };
  const [chipsHost, setChipsHost] = useState(null);
  return /* @__PURE__ */ jsx("div", { className: `flex min-w-0 flex-1 flex-wrap items-center gap-2 ${className}`, style, children: /* @__PURE__ */ jsxs(FilterChipsHostProvider, { host: chipsHost, children: [
    /* @__PURE__ */ jsx(CollapsedFilterTriggerProvider, { collapsed, children: /* @__PURE__ */ jsxs(
      "div",
      {
        ref: searchBoxRef,
        role: "search",
        className: `relative flex h-11 items-center transition-colors ${collapsed ? "shrink-0 gap-0.5" : `themed-search-pill min-w-[20rem] flex-1 rounded-full border bg-gray-50 focus-within:bg-white focus-within:ring-2 ${dirty ? "border-amber-400 focus-within:border-amber-500 focus-within:ring-amber-500/15" : "themed-search-box border-gray-300 focus-within:border-[var(--search-accent)] focus-within:ring-[var(--accent-ring)]"}`}`,
        children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                if (collapsed) setExpanded(true);
                else runSearch();
              },
              disabled: disabled || loading,
              "aria-expanded": collapsible ? !collapsed : void 0,
              "aria-label": loading ? "\u691C\u7D22\u4E2D" : collapsed ? inputAriaLabel : dirty ? "\u5909\u66F4\u3057\u305F\u6761\u4EF6\u3067\u518D\u691C\u7D22" : "\u691C\u7D22",
              title: loading ? "\u691C\u7D22\u4E2D" : collapsed ? inputAriaLabel : dirty ? "\u5909\u66F4\u3057\u305F\u6761\u4EF6\u3067\u518D\u691C\u7D22" : "\u691C\u7D22",
              className: `flex shrink-0 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${collapsed ? "h-9 w-9 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--search-accent)]" : `h-full w-11 rounded-l-full ${dirty ? "text-amber-600" : "text-gray-400 hover:text-[var(--search-accent)]"}`}`,
              children: loading ? /* @__PURE__ */ jsx("span", { className: "h-[18px] w-[18px] animate-spin rounded-full border-2 border-current border-t-transparent", "aria-hidden": true }) : /* @__PURE__ */ jsx("svg", { className: "h-[18px] w-[18px]", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: SEARCH_ICON_PATH }) })
            }
          ),
          !collapsed && /* @__PURE__ */ jsx(
            "input",
            {
              ref: inputRef,
              type: "search",
              inputMode: "text",
              autoComplete: "off",
              autoCorrect: "off",
              autoCapitalize: "none",
              spellCheck: false,
              lang: "ja",
              "aria-label": inputAriaLabel,
              value,
              onChange: (event) => {
                const next = event.target.value.replace(/\r?\n/g, " ");
                onValueChange(next);
                if (next.length === 0 && value.length > 0) onCleared?.();
              },
              onKeyDown: onInputKeyDown,
              onBlur: collapsible ? onInputBlur : void 0,
              placeholder,
              className: "h-full min-w-0 flex-1 border-0 bg-transparent pr-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            }
          ),
          filterControl
        ]
      }
    ) }),
    countLabel ? /* @__PURE__ */ jsx("span", { className: "w-24 shrink-0 whitespace-nowrap text-right text-xs tabular-nums text-gray-500", children: countLabel }) : null,
    /* @__PURE__ */ jsx("div", { ref: setChipsHost, className: "min-w-0 basis-full empty:hidden" })
  ] }) });
}
export {
  SearchFilterBar
};
//# sourceMappingURL=SearchFilterBar.js.map
