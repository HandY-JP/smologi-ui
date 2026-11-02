"use client";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_TOP_BAR_FIT } from "./app-chrome.js";
const PILL_MIN_PX = 360;
const PILL_MAX_PX = 520;
const ROW_GAP_PX = 12;
const TOOLS_TO_RIGHT_GAP_PX = 24;
const ROW1_HYSTERESIS_PX = 40;
function useTopBarFit(setTopBarFit) {
  const rowRef = useRef(null);
  const toolsSlotRef = useRef(null);
  const centerSlotRef = useRef(null);
  const [rowContentWidth, setRowContentWidth] = useState(0);
  const [toolsWidth, setToolsWidth] = useState(0);
  const [centerWidth, setCenterWidth] = useState(0);
  const [toolsLeftExtraOffset, setToolsLeftExtraOffset] = useState(0);
  const lastKnownCenterWidthRef = useRef(0);
  const [processInRow2, setProcessInRow2] = useState(false);
  const measureContentWidth = (el) => {
    const cs = getComputedStyle(el);
    return el.clientWidth - parseFloat(cs.paddingLeft || "0") - parseFloat(cs.paddingRight || "0");
  };
  function useSlotWidth(ref, setWidth) {
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const measure = () => setWidth(measureContentWidth(el));
      measure();
      const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
      ro?.observe(el);
      const mo = typeof MutationObserver !== "undefined" ? new MutationObserver(measure) : null;
      mo?.observe(el, { childList: true, subtree: true, characterData: true });
      const intervalId = window.setInterval(measure, 400);
      return () => {
        ro?.disconnect();
        mo?.disconnect();
        window.clearInterval(intervalId);
      };
    }, []);
  }
  useSlotWidth(rowRef, setRowContentWidth);
  useSlotWidth(toolsSlotRef, setToolsWidth);
  useSlotWidth(centerSlotRef, setCenterWidth);
  useEffect(() => {
    const measureOffset = () => {
      const rowEl = rowRef.current;
      const toolsEl = toolsSlotRef.current;
      if (!rowEl || !toolsEl) return;
      const rowPaddingLeft = parseFloat(getComputedStyle(rowEl).paddingLeft || "0");
      const contentLeft = rowEl.getBoundingClientRect().left + rowPaddingLeft;
      const extra = Math.max(0, toolsEl.getBoundingClientRect().left - contentLeft);
      setToolsLeftExtraOffset(extra);
    };
    measureOffset();
    const intervalId = window.setInterval(measureOffset, 400);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measureOffset) : null;
    if (rowRef.current) ro?.observe(rowRef.current);
    return () => {
      window.clearInterval(intervalId);
      ro?.disconnect();
    };
  }, []);
  const [hasMeasuredCenter, setHasMeasuredCenter] = useState(false);
  useEffect(() => {
    if (centerWidth > 0) {
      lastKnownCenterWidthRef.current = centerWidth;
      setHasMeasuredCenter(true);
    }
  }, [centerWidth]);
  const canDecide = rowContentWidth > 0 && toolsWidth > 0 && (hasMeasuredCenter || processInRow2);
  useEffect(() => {
    if (!canDecide) return;
    const processWidth = centerWidth > 0 ? centerWidth : lastKnownCenterWidthRef.current;
    const availableForRight = rowContentWidth - toolsLeftExtraOffset - toolsWidth - TOOLS_TO_RIGHT_GAP_PX;
    const fitsWithMinPill = availableForRight >= processWidth + ROW_GAP_PX + PILL_MIN_PX;
    const fitsWithMaxPillPlusMargin = availableForRight >= processWidth + ROW_GAP_PX + PILL_MAX_PX + ROW1_HYSTERESIS_PX;
    setProcessInRow2((prev) => {
      if (!prev && !fitsWithMinPill) return true;
      if (prev && fitsWithMaxPillPlusMargin) return false;
      return prev;
    });
  }, [canDecide, rowContentWidth, toolsWidth, toolsLeftExtraOffset, centerWidth]);
  const hasDecidedOnceRef = useRef(false);
  useEffect(() => {
    if (!canDecide) {
      if (!hasDecidedOnceRef.current) setTopBarFit(DEFAULT_TOP_BAR_FIT);
      return;
    }
    hasDecidedOnceRef.current = true;
    const availableForRight = rowContentWidth - toolsLeftExtraOffset - toolsWidth - TOOLS_TO_RIGHT_GAP_PX;
    const processWidth = centerWidth > 0 ? centerWidth : lastKnownCenterWidthRef.current;
    const pillBudget = processInRow2 ? availableForRight : availableForRight - processWidth - ROW_GAP_PX;
    const pillWidthPx = Math.round(Math.max(PILL_MIN_PX, Math.min(PILL_MAX_PX, pillBudget)));
    setTopBarFit({ pillWidthPx, processInRow2 });
  }, [canDecide, rowContentWidth, toolsWidth, toolsLeftExtraOffset, centerWidth, processInRow2, setTopBarFit]);
  return { rowRef, toolsSlotRef, centerSlotRef };
}
export {
  useTopBarFit
};
//# sourceMappingURL=useTopBarFit.js.map
