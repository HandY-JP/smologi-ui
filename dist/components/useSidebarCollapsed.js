"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  SIDEBAR_PEEK_NEAR_PX,
  distanceToSidebarPeekRegion,
  hasSidebarPeekHold,
  isInsideSidebarPeekRegion,
  isKeyboardFocusInsideSidebarPeekRegion,
  onSidebarPeekHoldChange,
  sidebarPeekRegionProps
} from "../lib/sidebar-peek.js";
const DEFAULT_SIDEBAR_STORAGE_KEY = "handy-sidebar-collapsed-v1";
const SIDEBAR_COLLAPSED_EVENT = "handy-sidebar-collapsed-change";
const SIDEBAR_PEEK_EVENT = "handy-sidebar-peek-change";
const SIDEBAR_PEEK_CLOSE_DELAY_MS = 250;
const SIDEBAR_PEEK_LEAVE_CLOSE_DELAY_MS = 80;
const SIDEBAR_TOGGLE_INSET = "3.5rem";
const SIDEBAR_OPEN_MOTION = "duration-[80ms] ease-out";
const SIDEBAR_CLOSE_MOTION = "duration-[80ms] ease-in";
function canHoverPeek() {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return true;
  try {
    return window.matchMedia("(hover: hover)").matches;
  } catch {
    return true;
  }
}
function useSidebarCollapsed(expandedWidth = "14rem", collapsedWidth = "3.5rem", options = {}) {
  const storageKey = options.storageKey ?? DEFAULT_SIDEBAR_STORAGE_KEY;
  const syncDockInset = options.syncDockInset ?? false;
  const [collapsed, setCollapsed] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [peek, setPeek] = useState(false);
  const pointerInsideRef = useRef(false);
  const pointerDownInsideRef = useRef(false);
  const peekCloseTimerRef = useRef(null);
  const peekCloseDeadlineRef = useRef(Number.POSITIVE_INFINITY);
  const peekPointerRef = useRef(null);
  const peekSuppressedUntilPointerLeaveRef = useRef(false);
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        setCollapsed(window.localStorage.getItem(storageKey) === "1");
      } catch {
      } finally {
        setStorageReady(true);
      }
    }, 0);
    const onChanged = (event) => {
      const detail = event.detail;
      if (typeof detail === "boolean") setCollapsed(detail);
    };
    const onPeek = (event) => {
      const detail = event.detail;
      if (typeof detail === "boolean") setPeek(detail);
    };
    window.addEventListener(SIDEBAR_COLLAPSED_EVENT, onChanged);
    window.addEventListener(SIDEBAR_PEEK_EVENT, onPeek);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, onChanged);
      window.removeEventListener(SIDEBAR_PEEK_EVENT, onPeek);
    };
  }, [storageKey]);
  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", collapsed ? collapsedWidth : expandedWidth);
    document.documentElement.style.setProperty("--sidebar-toggle-inset", collapsed ? SIDEBAR_TOGGLE_INSET : "0px");
    if (!storageReady) return;
    try {
      window.localStorage.setItem(storageKey, collapsed ? "1" : "0");
    } catch {
    }
  }, [collapsed, collapsedWidth, expandedWidth, storageKey, storageReady]);
  const displayCollapsed = collapsed && !peek;
  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-visual-width", displayCollapsed ? collapsedWidth : expandedWidth);
    if (syncDockInset) {
      document.documentElement.style.setProperty("--sidebar-dock-inset", displayCollapsed ? SIDEBAR_TOGGLE_INSET : "0px");
    }
  }, [collapsedWidth, displayCollapsed, expandedWidth, syncDockInset]);
  const updateCollapsed = useCallback((next) => {
    setCollapsed((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      peekSuppressedUntilPointerLeaveRef.current = value && pointerInsideRef.current;
      window.setTimeout(() => {
        if (value) {
          window.dispatchEvent(new CustomEvent(SIDEBAR_PEEK_EVENT, { detail: false }));
        }
        window.dispatchEvent(new CustomEvent(SIDEBAR_COLLAPSED_EVENT, { detail: value }));
      }, 0);
      return value;
    });
  }, []);
  const updatePeek = useCallback((value) => {
    window.dispatchEvent(new CustomEvent(SIDEBAR_PEEK_EVENT, { detail: value }));
  }, []);
  const cancelPeekClose = useCallback(() => {
    peekCloseDeadlineRef.current = Number.POSITIVE_INFINITY;
    if (peekCloseTimerRef.current === null) return;
    window.clearTimeout(peekCloseTimerRef.current);
    peekCloseTimerRef.current = null;
  }, []);
  const shouldKeepPeekOpen = useCallback(() => {
    if (pointerDownInsideRef.current) return true;
    if (hasSidebarPeekHold()) return true;
    if (isKeyboardFocusInsideSidebarPeekRegion()) return true;
    const point = peekPointerRef.current;
    if (point && distanceToSidebarPeekRegion(point.x, point.y) === 0) return true;
    return pointerInsideRef.current;
  }, []);
  const openPeekIfCollapsed = useCallback(() => {
    cancelPeekClose();
    if (collapsed && !peekSuppressedUntilPointerLeaveRef.current) updatePeek(true);
  }, [cancelPeekClose, collapsed, updatePeek]);
  const openPeekOnHover = useCallback(() => {
    if (!canHoverPeek()) return;
    openPeekIfCollapsed();
  }, [openPeekIfCollapsed]);
  useEffect(() => cancelPeekClose, [cancelPeekClose]);
  const closePeekWhenIdle = useCallback((delay = SIDEBAR_PEEK_CLOSE_DELAY_MS) => {
    if (pointerDownInsideRef.current) return;
    const deadline = Date.now() + delay;
    if (peekCloseTimerRef.current !== null && peekCloseDeadlineRef.current <= deadline) return;
    cancelPeekClose();
    peekCloseDeadlineRef.current = deadline;
    peekCloseTimerRef.current = window.setTimeout(() => {
      peekCloseTimerRef.current = null;
      peekCloseDeadlineRef.current = Number.POSITIVE_INFINITY;
      if (shouldKeepPeekOpen()) return;
      updatePeek(false);
    }, delay);
  }, [cancelPeekClose, shouldKeepPeekOpen, updatePeek]);
  useEffect(() => {
    if (!peek) return;
    const onPointerMove = (event) => {
      if (event.pointerType === "touch") return;
      peekPointerRef.current = { x: event.clientX, y: event.clientY };
      const distance = isInsideSidebarPeekRegion(event.target) ? 0 : distanceToSidebarPeekRegion(event.clientX, event.clientY);
      pointerInsideRef.current = distance === 0;
      if (distance === 0) {
        cancelPeekClose();
        return;
      }
      closePeekWhenIdle(
        distance > SIDEBAR_PEEK_NEAR_PX ? SIDEBAR_PEEK_LEAVE_CLOSE_DELAY_MS : SIDEBAR_PEEK_CLOSE_DELAY_MS
      );
    };
    document.addEventListener("pointermove", onPointerMove, { capture: true, passive: true });
    return () => {
      document.removeEventListener("pointermove", onPointerMove, { capture: true });
    };
  }, [peek, cancelPeekClose, closePeekWhenIdle]);
  useEffect(() => {
    if (!peek) return;
    return onSidebarPeekHoldChange(() => {
      if (hasSidebarPeekHold()) {
        cancelPeekClose();
        return;
      }
      closePeekWhenIdle();
    });
  }, [peek, cancelPeekClose, closePeekWhenIdle]);
  useEffect(() => {
    const releasePointer = () => {
      pointerDownInsideRef.current = false;
      if (!shouldKeepPeekOpen()) closePeekWhenIdle();
    };
    window.addEventListener("pointerup", releasePointer);
    window.addEventListener("pointercancel", releasePointer);
    window.addEventListener("mouseup", releasePointer);
    return () => {
      window.removeEventListener("pointerup", releasePointer);
      window.removeEventListener("pointercancel", releasePointer);
      window.removeEventListener("mouseup", releasePointer);
    };
  }, [closePeekWhenIdle, shouldKeepPeekOpen]);
  const peekHandlers = {
    ...sidebarPeekRegionProps,
    onPointerEnter: (event) => {
      if (event.pointerType === "touch") return;
      pointerInsideRef.current = true;
      openPeekOnHover();
    },
    onPointerLeave: (event) => {
      if (event.pointerType === "touch") return;
      peekPointerRef.current = { x: event.clientX, y: event.clientY };
      pointerInsideRef.current = false;
      peekSuppressedUntilPointerLeaveRef.current = false;
      closePeekWhenIdle();
    },
    onPointerDown: (event) => {
      if (event.pointerType === "touch") return;
      pointerDownInsideRef.current = true;
      openPeekOnHover();
    },
    onMouseEnter: () => {
      pointerInsideRef.current = true;
      openPeekOnHover();
    },
    onMouseLeave: () => {
      pointerInsideRef.current = false;
      peekSuppressedUntilPointerLeaveRef.current = false;
      closePeekWhenIdle();
    },
    onMouseDown: () => {
      pointerDownInsideRef.current = true;
      openPeekOnHover();
    },
    onFocus: () => {
      openPeekIfCollapsed();
    },
    onBlur: (event) => {
      const next = event.relatedTarget;
      if (next && event.currentTarget.contains(next)) return;
      if (isInsideSidebarPeekRegion(next)) return;
      closePeekWhenIdle();
    }
  };
  const widthMotionClass = displayCollapsed ? SIDEBAR_CLOSE_MOTION : SIDEBAR_OPEN_MOTION;
  return {
    collapsed: displayCollapsed,
    persistedCollapsed: collapsed,
    peeking: collapsed && peek,
    widthMotionClass,
    setCollapsed: updateCollapsed,
    openPeek: openPeekIfCollapsed,
    // 画面左端の細い当たり判定用。ホバーした瞬間に開く（待ち時間は入れない）。
    // ここもピーク領域にしておく（ピーク中は pointer-events-none だが、座標での判定には効く
    // ＝開いた直後にポインターが帯の上に留まっていても「外」と判定されない）。
    edgeTriggerHandlers: {
      ...sidebarPeekRegionProps,
      onPointerEnter: openPeekOnHover,
      onFocus: openPeekIfCollapsed
    },
    peekHandlers
  };
}
export {
  DEFAULT_SIDEBAR_STORAGE_KEY,
  SIDEBAR_TOGGLE_INSET,
  useSidebarCollapsed
};
//# sourceMappingURL=useSidebarCollapsed.js.map