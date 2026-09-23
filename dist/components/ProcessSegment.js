"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useLayoutEffect, useRef, useState } from "react";
import { computeChipOverflow } from "../lib/topbar-compaction.js";
function FilterChipPill({ c, chipRef }) {
  const full = c.field ? `${c.field}: ${c.label}` : c.label;
  return /* @__PURE__ */ jsxs("span", { ref: chipRef, className: "sb-group-chip", title: full, children: [
    c.field && /* @__PURE__ */ jsxs("span", { className: "text-gray-500", children: [
      c.field,
      ": "
    ] }),
    /* @__PURE__ */ jsx("span", { className: "text-gray-800", children: c.label }),
    c.onRemove && /* @__PURE__ */ jsx("button", { type: "button", onClick: c.onRemove, "aria-label": `${full}\u306E\u6761\u4EF6\u3092\u89E3\u9664`, className: "ml-0.5 opacity-70 hover:opacity-100", children: "\xD7" })
  ] });
}
function FilterChipRow({ chips }) {
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
        widthPx: (chipMeasureRefs.current.get(c.id)?.getBoundingClientRect().width ?? 0) + 6
      }));
      const moreWidth = (moreMeasureRef.current?.getBoundingClientRect().width ?? 60) + 6;
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
  return /* @__PURE__ */ jsxs("div", { className: "relative flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden", "aria-label": "\u7D5E\u308A\u8FBC\u307F\u6761\u4EF6", children: [
    /* @__PURE__ */ jsxs("div", { "aria-hidden": true, className: "sb-measure-layer pointer-events-none invisible fixed left-0 top-0 z-[-1] flex gap-1.5", children: [
      chips.map((c) => /* @__PURE__ */ jsx(FilterChipPill, { c, chipRef: (node) => {
        if (node) chipMeasureRefs.current.set(c.id, node);
        else chipMeasureRefs.current.delete(c.id);
      } }, c.id)),
      /* @__PURE__ */ jsx("span", { ref: moreMeasureRef, className: "sb-group-chip sb-group-chip-more", children: "\uFF0B99" })
    ] }),
    /* @__PURE__ */ jsxs("span", { className: "flex shrink-0 items-center gap-1", "aria-hidden": true, children: [
      /* @__PURE__ */ jsx("svg", { className: "h-3.5 w-3.5 text-gray-400", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.75 4.5h16.5l-6.6 7.7v4.55l-3.3 1.65v-6.2L3.75 4.5z" }) }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500", children: "\u7D5E\u308A\u8FBC\u307F" })
    ] }),
    /* @__PURE__ */ jsxs("div", { ref: containerRef, className: "flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-hidden", children: [
      visibleChips.map((c) => /* @__PURE__ */ jsx(FilterChipPill, { c }, c.id)),
      hiddenCount > 0 && /* @__PURE__ */ jsx("span", { className: "sb-group-chip sb-group-chip-more", title: `\u4ED6${hiddenCount}\u4EF6\u306E\u7D5E\u308A\u8FBC\u307F\u6761\u4EF6`, children: visibleChips.length === 0 ? `\u7D5E\u308A\u8FBC\u307F ${hiddenCount}` : `\uFF0B${hiddenCount}` })
    ] }),
    chips.length >= 2 && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => {
          for (const c of chips) c.onRemove?.();
        },
        className: "shrink-0 text-xs text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline",
        children: "\u3059\u3079\u3066\u89E3\u9664"
      }
    )
  ] });
}
function ProcessSegment({
  ariaLabel,
  leadLabel,
  stages,
  currentStage,
  onSelectStage,
  historyHref,
  historyLabel = "\u5C65\u6B74",
  onHistoryClick,
  historyActive,
  variant = "normal",
  dataTour,
  trailing,
  segmentTrailing,
  dense = false
}) {
  const stagePills = /* @__PURE__ */ jsxs(Fragment, { children: [
    leadLabel && /* @__PURE__ */ jsx("span", { className: "sb-glass-lead", children: leadLabel }),
    stages.map((s, i) => /* @__PURE__ */ jsxs("span", { className: "flex items-center", children: [
      i > 0 && /* @__PURE__ */ jsx("span", { className: "sb-glass-chevron", "aria-hidden": true, children: "\u203A" }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => onSelectStage(s.key),
          "aria-current": currentStage === s.key ? "step" : void 0,
          disabled: s.disabled,
          title: s.title,
          className: `sb-glass-stage${currentStage === s.key ? " on" : ""}${s.tone === "danger" ? " danger" : ""}${dense ? " dense" : ""}${s.disabled ? " is-disabled" : ""}`,
          children: [
            s.label,
            !dense && s.count != null && /* @__PURE__ */ jsx("b", { children: s.count > 999 ? "999+" : s.count })
          ]
        }
      )
    ] }, s.key))
  ] });
  const historyClass = `sb-glass-stage sb-glass-history${historyActive ? " on" : ""}${dense ? " dense" : ""}`;
  const historyEntry = historyHref || onHistoryClick ? /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { className: "sb-glass-div", "aria-hidden": true }),
    historyHref ? /* @__PURE__ */ jsx("a", { href: historyHref, onClick: onHistoryClick, "aria-current": historyActive ? "page" : void 0, className: historyClass, children: historyLabel }) : /* @__PURE__ */ jsx("button", { type: "button", onClick: onHistoryClick, "aria-current": historyActive ? "page" : void 0, className: historyClass, children: historyLabel })
  ] }) : null;
  if (variant === "compact") {
    return /* @__PURE__ */ jsxs("div", { className: `sb-glass sb-glass-center${dense ? " dense" : ""}`, role: "group", "aria-label": ariaLabel, "data-tour": dataTour, children: [
      stagePills,
      segmentTrailing,
      historyEntry
    ] });
  }
  if (variant === "center") {
    return /* @__PURE__ */ jsxs("div", { className: "sb-tool-capsule sb-glass-center", role: "group", "aria-label": ariaLabel, "data-tour": dataTour, children: [
      stagePills,
      segmentTrailing,
      historyEntry
    ] });
  }
  const hasRowContent = !!trailing;
  const hasStagesHere = stages.length > 0;
  if (!hasRowContent && !hasStagesHere) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `flex min-w-0 flex-1 items-center gap-3 overflow-hidden transition-[height] duration-150 ${hasRowContent ? "h-11" : "h-8"}`,
      "data-tour": dataTour,
      children: [
        hasStagesHere && /* @__PURE__ */ jsxs("nav", { "aria-label": ariaLabel, className: "flex flex-shrink-0 items-center gap-1", children: [
          stages.map((s) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => onSelectStage(s.key),
              "aria-current": currentStage === s.key ? "step" : void 0,
              title: s.title,
              className: `sb-stage-tab${currentStage === s.key ? " current" : ""}${s.tone === "danger" ? " danger" : ""}`,
              children: [
                s.label,
                s.count != null && /* @__PURE__ */ jsx("span", { className: "sb-stage-badge", children: s.count > 999 ? "999+" : s.count })
              ]
            },
            s.key
          )),
          segmentTrailing,
          historyEntry
        ] }),
        trailing
      ]
    }
  );
}
export {
  FilterChipRow,
  ProcessSegment
};
//# sourceMappingURL=ProcessSegment.js.map