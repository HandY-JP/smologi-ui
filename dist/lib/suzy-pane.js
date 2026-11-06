"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
const SUZY_PANE_BREAKPOINT = 1440;
const SUZY_PANE_WIDTH = 380;
let active = false;
const listeners = /* @__PURE__ */ new Set();
function subscribe(fn) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
function setActive(next) {
  if (active === next) return;
  active = next;
  listeners.forEach((fn) => fn());
}
function useSuzyPaneActive() {
  return useSyncExternalStore(subscribe, () => active, () => false);
}
function useSuzyPane({ open, breakpoint = SUZY_PANE_BREAKPOINT, width = SUZY_PANE_WIDTH }) {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return void 0;
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const read = () => setWide(mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, [breakpoint]);
  const on = wide && open;
  useEffect(() => {
    const root = document.documentElement;
    if (on) {
      root.style.setProperty("--suzy-pane-w", `${width}px`);
      root.setAttribute("data-suzy-pane", "open");
    } else {
      root.style.setProperty("--suzy-pane-w", "0px");
      root.removeAttribute("data-suzy-pane");
    }
    setActive(on);
    return () => {
      root.style.removeProperty("--suzy-pane-w");
      root.removeAttribute("data-suzy-pane");
      setActive(false);
    };
  }, [on, width]);
  return { isPane: wide, active: on };
}
export {
  SUZY_PANE_BREAKPOINT,
  SUZY_PANE_WIDTH,
  useSuzyPane,
  useSuzyPaneActive
};
//# sourceMappingURL=suzy-pane.js.map