"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
const BAND_HEIGHT_PX = 32;
function findListBoundsElement(sentinel) {
  const table = sentinel.closest("table") ?? sentinel;
  let node = table.parentElement;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    if (style.overflowX !== "visible" || style.overflowY !== "visible") return node;
    node = node.parentElement;
  }
  return table;
}
function StickySectionHeader({
  topPx,
  colSpan,
  children,
  className,
  id,
  trailing,
  visuallyActive = true,
  onStuckChange,
  dataTour
}) {
  const [stuck, setStuck] = useState(false);
  const [fixedBounds, setFixedBounds] = useState(null);
  const sentinelRef = useRef(null);
  const showGlass = stuck && visuallyActive;
  const measureBounds = useCallback(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const rect = findListBoundsElement(el).getBoundingClientRect();
    setFixedBounds((prev) => {
      const next = {
        left: rect.left + 8,
        width: Math.max(0, rect.width - 16),
        inView: rect.bottom > Math.max(0, topPx) + BAND_HEIGHT_PX
      };
      if (prev && prev.left === next.left && prev.width === next.width && prev.inView === next.inView) return prev;
      return next;
    });
  }, [topPx]);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const nowStuck = entry.boundingClientRect.top < Math.max(0, topPx) + 1;
        setStuck(nowStuck);
        if (nowStuck) measureBounds();
      },
      { threshold: 0, rootMargin: `-${Math.max(0, topPx) + 1}px 0px 0px 0px` }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [topPx, measureBounds]);
  useEffect(() => {
    onStuckChange?.(stuck);
    return () => onStuckChange?.(false);
  }, [stuck]);
  useEffect(() => {
    if (!showGlass) return;
    measureBounds();
    window.addEventListener("resize", measureBounds);
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        measureBounds();
      });
    };
    window.addEventListener("scroll", onScroll, true);
    let ro;
    if (typeof ResizeObserver !== "undefined" && sentinelRef.current) {
      ro = new ResizeObserver(measureBounds);
      ro.observe(findListBoundsElement(sentinelRef.current));
    }
    return () => {
      window.removeEventListener("resize", measureBounds);
      window.removeEventListener("scroll", onScroll, true);
      if (raf) window.cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [showGlass, measureBounds]);
  const floating = showGlass && !!fixedBounds && fixedBounds.inView;
  const inner = /* @__PURE__ */ jsxs(
    "div",
    {
      className: `sb-sticky-inner${floating ? " sb-sticky-inner-fixed" : ""}`,
      style: floating && fixedBounds ? { top: topPx, left: fixedBounds.left, width: fixedBounds.width } : void 0,
      children: [
        /* @__PURE__ */ jsx("span", { className: "flex min-w-0 items-center overflow-hidden", children }),
        trailing && /* @__PURE__ */ jsx("span", { className: "ml-auto flex min-w-0 flex-1 items-center justify-end pl-3", children: trailing })
      ]
    }
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("tr", { ref: sentinelRef, "aria-hidden": true, className: "pointer-events-none", children: /* @__PURE__ */ jsx("td", { colSpan, style: { padding: 0, border: 0, height: 0, lineHeight: 0 } }) }),
    /* @__PURE__ */ jsx("tr", { className: `sb-sticky-row${floating ? " is-stuck" : ""}${className ? ` ${className}` : ""}`, children: /* @__PURE__ */ jsx("td", { id, "data-tour": dataTour, colSpan, className: "sb-sticky-cell", style: { height: 32 }, children: floating ? createPortal(inner, document.body) : inner }) })
  ] });
}
export {
  StickySectionHeader
};
//# sourceMappingURL=StickySectionHeader.js.map
