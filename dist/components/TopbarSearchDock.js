"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import { FilterChipsHostProvider, CollapsedFilterTriggerProvider } from "./FilterPopover.js";
import { topbarDockSlotIds } from "../lib/topbar-slots.js";
const SEARCH_ACCENT_STYLE = {
  "--search-accent": "var(--sb-accent-bg)",
  "--search-accent-light": "var(--accent-subtle)"
};
const SEARCH_ICON_PATH = "m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z";
function useTopbarSearchDock(value, { alwaysDocked = false, slotOverrideId } = {}) {
  const hasValue = value.length > 0;
  const [manualOpen, setManualOpen] = useState(false);
  const [pastTop, setPastTop] = useState(false);
  const [focused, setFocused] = useState(false);
  const focusedRef = useRef(false);
  const [dockNode, setDockNode] = useState(null);
  const [inputNode, setInputNode] = useState(null);
  const observerRef = useRef(null);
  const [slot, setSlot] = useState(null);
  const focusRequestRef = useRef(false);
  const [focusRequest, setFocusRequest] = useState(0);
  const docked = alwaysDocked ? true : manualOpen || pastTop || hasValue || focused;
  const observeSentinel = useCallback((node) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node || typeof IntersectionObserver === "undefined") {
      setPastTop(false);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => setPastTop(!(entries[entries.length - 1]?.isIntersecting ?? true)),
      // 高さ64pxのトップバーに隠れている分は「見えていない」と扱う（バーが本文に重なるため）。
      { rootMargin: "-64px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(node);
    observerRef.current = observer;
  }, []);
  useEffect(() => () => observerRef.current?.disconnect(), []);
  useLayoutEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const resolve = () => {
      if (cancelled) return;
      const found = (slotOverrideId ? document.getElementById(slotOverrideId) : null) ?? topbarDockSlotIds().map((id) => document.getElementById(id)).find((el) => el != null) ?? null;
      setSlot(found);
      if (!found && attempts < 30) {
        attempts += 1;
        window.setTimeout(resolve, 50);
      }
    };
    resolve();
    return () => {
      cancelled = true;
    };
  }, [slotOverrideId]);
  useEffect(() => {
    if (pastTop || hasValue || focusedRef.current) return;
    setManualOpen(false);
  }, [pastTop, hasValue]);
  useLayoutEffect(() => {
    if (!focusRequestRef.current || !inputNode) return;
    focusRequestRef.current = false;
    inputNode.focus();
  }, [focusRequest, inputNode]);
  const blurDock = useCallback(() => {
    const active = typeof document === "undefined" ? null : document.activeElement;
    if (active instanceof HTMLElement && dockNode?.contains(active)) active.blur();
    focusRequestRef.current = false;
    focusedRef.current = false;
    setFocused(false);
  }, [dockNode]);
  const requestFocus = useCallback(() => {
    focusRequestRef.current = true;
    setFocusRequest((n) => n + 1);
  }, []);
  const toggleFromHeader = useCallback(() => {
    if (!docked) {
      setManualOpen(true);
      requestFocus();
      return;
    }
    if (hasValue || pastTop) {
      requestFocus();
      return;
    }
    blurDock();
    setManualOpen(false);
  }, [docked, hasValue, pastTop, blurDock, requestFocus]);
  const onFocus = useCallback(() => {
    focusedRef.current = true;
    setFocused(true);
  }, []);
  const onBlur = useCallback((event) => {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    focusedRef.current = false;
    setFocused(false);
    if (!hasValue) setManualOpen(false);
  }, [hasValue]);
  const onEscape = useCallback(() => {
    if (hasValue) return;
    blurDock();
    setManualOpen(false);
  }, [hasValue, blurDock]);
  return {
    docked,
    toggleFromHeader,
    observeSentinel,
    internal: { slot, setDockNode, setInputNode, onFocus, onBlur, handlesEscape: !alwaysDocked, onEscape }
  };
}
function TopbarSearchDock({
  controller,
  value,
  onValueChange,
  onSearch,
  onCleared,
  placeholder,
  inputAriaLabel,
  loading = false,
  dirty = false,
  disabled = false,
  leadingControl,
  viewControl,
  filterControl,
  widthClass = "w-[min(26rem,42vw)]",
  widthPx,
  coexistWithTabs = false,
  slashKeycap = false
}) {
  const { docked, internal } = controller;
  const { slot, setDockNode, setInputNode, onFocus, onBlur, handlesEscape, onEscape } = internal;
  if (!slot || !docked) return null;
  const runSearch = () => {
    if (!disabled && !loading) onSearch();
  };
  const searchTitle = loading ? "\u691C\u7D22\u4E2D" : dirty ? "\u5909\u66F4\u3057\u305F\u6761\u4EF6\u3067\u518D\u691C\u7D22" : "\u691C\u7D22";
  const pill = (
    // topbar-dock-fade: タブ列と入れ替わるときのフェード。ラッパーは必ず flex にする
    // （素の div は display:block になり、中のタブ／ピルが縦に積まれてバーが崩れる）。
    // topbar-dock-coexist: globals.css の `:has()` 例外にヒットさせて、タブ列を隠す排他を解除する。
    /* @__PURE__ */ jsx("div", { className: `topbar-dock-fade flex min-w-0 items-center${coexistWithTabs ? " topbar-dock-coexist" : ""}`, children: /* @__PURE__ */ jsx(
      "div",
      {
        ref: setDockNode,
        className: "flex min-w-0 items-center",
        style: SEARCH_ACCENT_STYLE,
        onFocusCapture: onFocus,
        onBlurCapture: onBlur,
        onKeyDown: handlesEscape ? (event) => {
          if (event.key !== "Escape" || event.nativeEvent.isComposing) return;
          event.stopPropagation();
          onEscape();
        } : void 0,
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            style: typeof widthPx === "number" ? { width: widthPx } : void 0,
            className: `group themed-search-pill relative flex h-11 ${widthClass} items-center rounded-full border bg-gray-50 pr-1.5 transition-colors focus-within:bg-white focus-within:ring-2 ${dirty ? "border-amber-400 focus-within:border-amber-500 focus-within:ring-amber-500/15" : "themed-search-box border-gray-300 focus-within:border-[var(--search-accent)] focus-within:ring-[var(--accent-ring)]"}`,
            children: [
              leadingControl && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-full shrink-0 items-center pl-3 pr-1", children: leadingControl }),
                /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "h-5 w-px shrink-0 bg-gray-300" })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: runSearch,
                  disabled: disabled || loading,
                  title: searchTitle,
                  "aria-label": searchTitle,
                  className: `flex h-full w-10 shrink-0 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${leadingControl ? "" : "rounded-l-full"} ${dirty ? "text-amber-600" : "text-gray-400 hover:text-[var(--search-accent)]"}`,
                  children: loading ? /* @__PURE__ */ jsx("span", { className: "h-[18px] w-[18px] animate-spin rounded-full border-2 border-current border-t-transparent", "aria-hidden": true }) : /* @__PURE__ */ jsx("svg", { className: "h-[18px] w-[18px]", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: SEARCH_ICON_PATH }) })
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  ref: setInputNode,
                  type: "search",
                  inputMode: "text",
                  autoComplete: "off",
                  autoCorrect: "off",
                  autoCapitalize: "none",
                  spellCheck: false,
                  lang: "ja",
                  "aria-label": inputAriaLabel ?? placeholder,
                  value,
                  onChange: (event) => {
                    const next = event.target.value.replace(/\r?\n/g, " ");
                    onValueChange(next);
                    if (next.length === 0 && value.length > 0) onCleared?.();
                  },
                  onKeyDown: (event) => {
                    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
                    event.preventDefault();
                    event.stopPropagation();
                    runSearch();
                  },
                  placeholder,
                  className: "h-full min-w-0 flex-1 border-0 bg-transparent pr-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                }
              ),
              slashKeycap && /* @__PURE__ */ jsx(
                "kbd",
                {
                  "aria-hidden": "true",
                  className: "mr-1.5 flex h-[18px] w-5 shrink-0 items-center justify-center rounded border border-gray-300 text-[11px] font-medium text-gray-400 group-focus-within:hidden",
                  children: "/"
                }
              ),
              viewControl,
              /* @__PURE__ */ jsx(FilterChipsHostProvider, { host: null, children: /* @__PURE__ */ jsx(CollapsedFilterTriggerProvider, { collapsed: true, children: filterControl }) })
            ]
          }
        )
      }
    ) })
  );
  return createPortal(pill, slot);
}
const LIST_HEADER_ICON_BUTTON = "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--search-accent)] disabled:cursor-wait disabled:opacity-60";
function ListHeaderSearchIcons({
  controller,
  searchLabel,
  filterControl,
  trailing,
  align = "end"
}) {
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: align === "start" ? "-my-2 flex items-center gap-0.5" : "-my-2 ml-auto flex items-center gap-0.5",
      style: SEARCH_ACCENT_STYLE,
      children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onMouseDown: (event) => event.preventDefault(),
            onClick: controller.toggleFromHeader,
            "aria-expanded": controller.docked,
            "aria-label": searchLabel,
            title: searchLabel,
            className: LIST_HEADER_ICON_BUTTON,
            children: /* @__PURE__ */ jsx("svg", { className: "h-[18px] w-[18px]", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: SEARCH_ICON_PATH }) })
          }
        ),
        filterControl && // 畳んだ検索バーと同じ「じょうごアイコン＋適用中は赤ドット」。
        /* @__PURE__ */ jsx(CollapsedFilterTriggerProvider, { collapsed: true, children: filterControl }),
        trailing
      ]
    }
  );
}
export {
  LIST_HEADER_ICON_BUTTON,
  ListHeaderSearchIcons,
  SEARCH_ACCENT_STYLE,
  TopbarSearchDock,
  useTopbarSearchDock
};
//# sourceMappingURL=TopbarSearchDock.js.map
