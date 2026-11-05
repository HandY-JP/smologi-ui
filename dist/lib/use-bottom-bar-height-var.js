"use client";
import { useEffect } from "react";
const BAR_GAP = 8;
function useBottomBarHeightVar() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const vh = window.innerHeight;
      let h = 0;
      document.querySelectorAll("[data-bottom-bar]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.height < 1 || r.width < 1 || r.top >= vh || r.bottom < vh - 80) return;
        h = Math.max(h, vh - r.top);
      });
      root.style.setProperty("--bottom-bar-h", h > 0 ? `${Math.round(h + BAR_GAP)}px` : "0px");
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "hidden"] });
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { capture: true, passive: true });
    schedule();
    return () => {
      mo.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, { capture: true });
      if (frame) window.cancelAnimationFrame(frame);
      root.style.removeProperty("--bottom-bar-h");
    };
  }, []);
}
export {
  useBottomBarHeightVar
};
//# sourceMappingURL=use-bottom-bar-height-var.js.map