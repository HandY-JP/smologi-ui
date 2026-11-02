"use client";
import { useEffect, useRef, useState } from "react";
import {
  INITIAL_COMPACTION_STATE,
  nextCompactionState,
  resolveScrollTop
} from "../lib/topbar-compaction.js";
const ADMIN_SCROLLER_ID = "app-main";
function useTopbarCompaction(scrollerId = ADMIN_SCROLLER_ID) {
  const [compact, setCompact] = useState(false);
  const stateRef = useRef(INITIAL_COMPACTION_STATE);
  const rafRef = useRef(0);
  useEffect(() => {
    const measure = () => {
      rafRef.current = 0;
      const scroller = document.getElementById(scrollerId);
      const y = resolveScrollTop(scroller, window.scrollY);
      const next = nextCompactionState(stateRef.current, y);
      if (next !== stateRef.current) {
        stateRef.current = next;
        setCompact(next.compact);
      }
    };
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = window.requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, true);
    measure();
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [scrollerId]);
  const scrollToTop = () => {
    const scroller = document.getElementById(scrollerId);
    if (scroller) scroller.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return { compact, scrollToTop };
}
function useTopbarShortcuts({
  onFocusSearch,
  onSelectStageByIndex,
  stageCount,
  enabled = true
}) {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const active = document.activeElement;
      const tag = active?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || active?.isContentEditable) return;
      const openDialog = Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"]')).some((el) => {
        if (el.getAttribute("aria-hidden") === "true") return false;
        if (el.hasAttribute("inert") || el.hasAttribute("hidden")) return false;
        return el.getClientRects().length > 0;
      });
      if (openDialog) return;
      if (event.key === "/") {
        event.preventDefault();
        onFocusSearch();
        return;
      }
      const n = Number(event.key);
      if (Number.isInteger(n) && n >= 1 && n <= stageCount) {
        onSelectStageByIndex(n - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onFocusSearch, onSelectStageByIndex, stageCount]);
}
export {
  ADMIN_SCROLLER_ID,
  useTopbarCompaction,
  useTopbarShortcuts
};
//# sourceMappingURL=useTopbarCompaction.js.map
