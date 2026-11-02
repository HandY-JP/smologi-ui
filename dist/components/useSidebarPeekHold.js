"use client";
import { useEffect, useId } from "react";
import { holdSidebarPeek, releaseSidebarPeek } from "../lib/sidebar-peek.js";
function useSidebarPeekHold(active) {
  const id = useId();
  useEffect(() => {
    if (!active) return;
    holdSidebarPeek(id);
    return () => releaseSidebarPeek(id);
  }, [active, id]);
}
export {
  useSidebarPeekHold
};
//# sourceMappingURL=useSidebarPeekHold.js.map
