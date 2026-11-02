"use client";
import { useEffect, useState } from "react";
function useSidebarDrawer(pathname) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);
  return { isMobile, mobileOpen, setMobileOpen };
}
export {
  useSidebarDrawer
};
//# sourceMappingURL=useSidebarDrawer.js.map
