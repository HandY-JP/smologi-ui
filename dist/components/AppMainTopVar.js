"use client";
import { useLayoutEffect } from "react";
function AppMainTopVar() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const main = document.getElementById("app-main");
    if (!main) return;
    const update = () => {
      const content = document.getElementById("app-main-content");
      if (content) {
        const rect2 = content.getBoundingClientRect();
        root.style.setProperty("--app-main-top", `${Math.round(rect2.top)}px`);
        return;
      }
      const rect = main.getBoundingClientRect();
      const paddingTop = parseFloat(getComputedStyle(main).paddingTop) || 0;
      root.style.setProperty("--app-main-top", `${Math.round(rect.top + paddingTop)}px`);
    };
    update();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(main);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      root.style.removeProperty("--app-main-top");
    };
  }, []);
  return null;
}
export {
  AppMainTopVar
};
//# sourceMappingURL=AppMainTopVar.js.map