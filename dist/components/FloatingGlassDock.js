"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { computeChipOverflow } from "../lib/topbar-compaction.js";
import { useChromeOptional, DEFAULT_TOP_BAR_FIT } from "./app-chrome.js";
import { CollapsedFilterTriggerProvider, FilterChipsHostProvider } from "./FilterPopover.js";
import { TopToolCapsule } from "./TopToolCapsule.js";
import { ProcessSegment } from "./ProcessSegment.js";
const GLASS_PILL_MIN_PX = 320;
function FilterChipPill({ c, chipRef }) {
  const full = c.field ? `${c.field}: ${c.label}` : c.label;
  return /* @__PURE__ */ jsxs("span", { ref: chipRef, className: "sb-group-chip sb-filter-mini-chip", title: full, children: [
    c.field && /* @__PURE__ */ jsxs("span", { className: "opacity-70", children: [
      c.field,
      ": "
    ] }),
    c.label,
    c.onRemove && /* @__PURE__ */ jsx("button", { type: "button", onClick: c.onRemove, "aria-label": `${full}\u306E\u6761\u4EF6\u3092\u89E3\u9664`, className: "ml-0.5 opacity-70 hover:opacity-100", children: "\xD7" })
  ] });
}
function MiniFilterChips({ chips }) {
  const containerRef = useRef(null);
  const moreMeasureRef = useRef(null);
  const chipMeasureRefs = useRef(/* @__PURE__ */ new Map());
  const [shownIds, setShownIds] = useState(null);
  const [hiddenCount, setHiddenCount] = useState(0);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const available = el.clientWidth;
      const items = chips.map((c) => ({
        id: c.id,
        widthPx: (chipMeasureRefs.current.get(c.id)?.getBoundingClientRect().width ?? 0) + 3
      }));
      const moreWidth = (moreMeasureRef.current?.getBoundingClientRect().width ?? 40) + 3;
      const result = computeChipOverflow(items, available, moreWidth);
      setShownIds(result.collapsedToCount ? [] : result.shownIds);
      setHiddenCount(result.hiddenCount);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [chips]);
  if (chips.length === 0) return null;
  const shownSet = new Set(shownIds ?? chips.map((c) => c.id));
  const visibleChips = chips.filter((c) => shownSet.has(c.id));
  return /* @__PURE__ */ jsxs("div", { ref: containerRef, className: "sb-glass sb-glass-chips", "aria-label": "\u7D5E\u308A\u8FBC\u307F\u6761\u4EF6", children: [
    /* @__PURE__ */ jsxs("div", { "aria-hidden": true, className: "sb-measure-layer pointer-events-none invisible fixed left-0 top-0 z-[-1] flex gap-1", children: [
      chips.map((c) => /* @__PURE__ */ jsx(FilterChipPill, { c, chipRef: (node) => {
        if (node) chipMeasureRefs.current.set(c.id, node);
        else chipMeasureRefs.current.delete(c.id);
      } }, c.id)),
      /* @__PURE__ */ jsx("span", { ref: moreMeasureRef, className: "sb-group-chip sb-group-chip-more", children: "\uFF0B99" })
    ] }),
    visibleChips.map((c) => /* @__PURE__ */ jsx(FilterChipPill, { c }, c.id)),
    hiddenCount > 0 && /* @__PURE__ */ jsx("span", { className: "sb-group-chip sb-group-chip-more", title: `\u4ED6${hiddenCount}\u4EF6\u306E\u7D5E\u308A\u8FBC\u307F\u6761\u4EF6`, children: visibleChips.length === 0 ? `\u7D5E\u308A\u8FBC\u307F ${hiddenCount}` : `\uFF0B${hiddenCount}` })
  ] });
}
function FloatingGlassDock({
  visible,
  tools,
  toolsAriaLabel,
  processAriaLabel,
  leadLabel,
  stages,
  currentStage,
  onSelectStage,
  historyLabel,
  onHistoryClick,
  historyActive,
  leading,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder,
  searchAriaLabel,
  searchInputRef,
  /** 実際の FilterPopover/ShipmentFilterMenu を渡す（collapsed 表示で件数バッジ付きの
   *  じょうごトリガーになる）。呼び出し側の renderXxxFilter(true) をそのまま渡せばよい。 */
  filterControl,
  filterChips = [],
  processTrailing
}) {
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  useEffect(() => {
    if (visible) setHasBeenVisible(true);
  }, [visible]);
  const chrome = useChromeOptional();
  const topBarFit = chrome?.topBarFit ?? DEFAULT_TOP_BAR_FIT;
  const desiredPillPx = !topBarFit.processInRow2 && topBarFit.pillWidthPx != null ? Math.max(GLASS_PILL_MIN_PX, topBarFit.pillWidthPx) : GLASS_PILL_MIN_PX;
  const glassLeftRef = useRef(null);
  const glassRightRef = useRef(null);
  const [collapsedTier, setCollapsedTier] = useState(0);
  const rightWidthByTierRef = useRef({});
  useEffect(() => {
    if (!visible || typeof ResizeObserver === "undefined") return;
    const MARGIN = 16;
    const measure = () => {
      const leftEl = glassLeftRef.current;
      const rightEl = glassRightRef.current;
      if (!leftEl || !rightEl) return;
      const pillEl = rightEl.querySelector(".sb-glass-search");
      if (pillEl && Math.abs(pillEl.getBoundingClientRect().width - desiredPillPx) > 1) return;
      const rightRect = rightEl.getBoundingClientRect();
      rightWidthByTierRef.current[collapsedTier] = rightRect.width;
      const gap = rightRect.left - leftEl.getBoundingClientRect().right;
      setCollapsedTier((prev) => {
        if (gap < MARGIN && prev < 2) return prev + 1;
        if (prev > 0) {
          const widthHere = rightWidthByTierRef.current[prev];
          const widthBelow = rightWidthByTierRef.current[prev - 1];
          const needed = widthHere != null && widthBelow != null ? MARGIN * 2 + Math.max(0, widthBelow - widthHere) : MARGIN * 3;
          if (gap >= needed) return prev - 1;
        }
        return prev;
      });
    };
    const ro = new ResizeObserver(measure);
    if (glassLeftRef.current) ro.observe(glassLeftRef.current);
    if (glassRightRef.current) ro.observe(glassRightRef.current);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [visible, collapsedTier, stages, filterChips, leadLabel, desiredPillPx, historyLabel, historyActive]);
  if (typeof document === "undefined" || !hasBeenVisible) return null;
  const dock = /* @__PURE__ */ jsxs("div", { className: "sb-glass-layer", "aria-hidden": !visible, children: [
    /* @__PURE__ */ jsx("div", { ref: glassLeftRef, className: `sb-glass-float gf-left${visible ? " is-visible" : ""}`, children: /* @__PURE__ */ jsx(
      TopToolCapsule,
      {
        ariaLabel: toolsAriaLabel,
        items: tools,
        variant: "compact"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { ref: glassRightRef, className: `sb-glass-float gf-right${visible ? " is-visible" : ""}`, children: [
      /* @__PURE__ */ jsx(
        ProcessSegment,
        {
          ariaLabel: processAriaLabel,
          leadLabel: collapsedTier >= 1 ? void 0 : leadLabel,
          stages,
          currentStage,
          onSelectStage,
          historyLabel,
          onHistoryClick,
          historyActive,
          variant: "compact",
          dense: collapsedTier >= 1,
          segmentTrailing: processTrailing
        }
      ),
      collapsedTier < 2 && /* @__PURE__ */ jsx(MiniFilterChips, { chips: filterChips }),
      /* @__PURE__ */ jsxs("div", { className: "sb-glass sb-glass-search", style: { width: desiredPillPx }, children: [
        leading && /* @__PURE__ */ jsxs(Fragment, { children: [
          leading,
          /* @__PURE__ */ jsx("span", { className: "sb-glass-div", "aria-hidden": true })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "flex items-center text-gray-400", "aria-hidden": true, children: /* @__PURE__ */ jsx("svg", { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" }) }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref: searchInputRef,
            type: "text",
            value: searchValue,
            onChange: (e) => onSearchChange(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") onSearchSubmit();
            },
            placeholder: searchPlaceholder,
            "aria-label": searchAriaLabel ?? searchPlaceholder
          }
        ),
        filterControl && /* @__PURE__ */ jsx(FilterChipsHostProvider, { host: null, children: /* @__PURE__ */ jsx(CollapsedFilterTriggerProvider, { collapsed: true, children: filterControl }) })
      ] })
    ] })
  ] });
  return createPortal(dock, document.body);
}
export {
  FloatingGlassDock
};
//# sourceMappingURL=FloatingGlassDock.js.map
