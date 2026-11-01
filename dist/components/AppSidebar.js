"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { isZeroCssLength, summarizeSidebarNews } from "../lib/sidebar-nav.js";
import { useSidebarCollapsed } from "./useSidebarCollapsed.js";
import { useSidebarDrawer } from "./useSidebarDrawer.js";
import { SidebarToggleDock } from "./SidebarToggleDock.js";
import {
  DEFAULT_SIDEBAR_ACTIVE_CLASS,
  SidebarNavSections
} from "./SidebarNav.js";
const resolve = (slot, ctx) => typeof slot === "function" ? slot(ctx) : slot;
function AppSidebar({
  sections,
  pathname,
  top,
  accountMenu,
  storageKey,
  expandedWidth = "14rem",
  collapsedWidth = "0rem",
  renderLink,
  renderLocked,
  lockBadge,
  decorate,
  activeClassName = DEFAULT_SIDEBAR_ACTIVE_CLASS,
  sectionGapClassName,
  quickActionClassName,
  quickActionActiveClassName,
  dock,
  navDimmed = false,
  closeMenuLabel = "\u30E1\u30CB\u30E5\u30FC\u3092\u9589\u3058\u308B",
  openSidebarLabel = "\u30B5\u30A4\u30C9\u30D0\u30FC\u3092\u8868\u793A"
}) {
  const {
    collapsed,
    persistedCollapsed,
    peeking,
    widthMotionClass,
    setCollapsed,
    edgeTriggerHandlers,
    peekHandlers
  } = useSidebarCollapsed(expandedWidth, collapsedWidth, { storageKey });
  const { isMobile, mobileOpen, setMobileOpen } = useSidebarDrawer(pathname);
  const zeroWidthWhenClosed = isZeroCssLength(collapsedWidth);
  const sidebarHidden = zeroWidthWhenClosed && persistedCollapsed && !peeking;
  const dockCollapsed = isMobile ? !mobileOpen : sidebarHidden;
  const asideHidden = isMobile ? !mobileOpen : sidebarHidden;
  const news = summarizeSidebarNews(decorate ? sections.map((s) => ({ ...s, items: s.items.map(decorate) })) : sections);
  const ctx = { collapsed: zeroWidthWhenClosed ? false : collapsed };
  const closeDrawer = () => setMobileOpen(false);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    persistedCollapsed && !isMobile && zeroWidthWhenClosed && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        "aria-label": `${openSidebarLabel}\u3059\u308B`,
        title: openSidebarLabel,
        onClick: () => setCollapsed(false),
        ...edgeTriggerHandlers,
        className: `fixed inset-y-0 left-0 z-[60] w-[15px] bg-transparent focus-visible:bg-orange-300/30 focus-visible:outline-none ${peeking ? "pointer-events-none" : ""}`
      }
    ),
    mobileOpen && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        "aria-label": closeMenuLabel,
        onClick: closeDrawer,
        className: "fixed inset-0 z-40 bg-black/30 md:hidden"
      }
    ),
    /* @__PURE__ */ jsx(
      SidebarToggleDock,
      {
        hasNews: news.hasNews,
        newsReason: news.reason,
        ...dock,
        collapsed: dockCollapsed,
        persistedCollapsed: isMobile ? !mobileOpen : persistedCollapsed,
        onToggle: () => isMobile ? setMobileOpen((value) => !value) : setCollapsed((value) => !value),
        hoverHandlers: isMobile ? void 0 : peekHandlers
      }
    ),
    /* @__PURE__ */ jsxs(
      "aside",
      {
        ...peekHandlers,
        "aria-hidden": asideHidden,
        inert: asideHidden ? true : void 0,
        className: `fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-visual-width)] flex-col overflow-hidden transition-[width] ${widthMotionClass} motion-reduce:transition-none ${peeking ? "shadow-2xl" : ""} max-md:w-56 max-md:transition-transform max-md:duration-200 ${mobileOpen ? "max-md:translate-x-0 max-md:shadow-2xl" : "max-md:-translate-x-full"}`,
        style: { backgroundColor: "var(--sb-bg)" },
        children: [
          /* @__PURE__ */ jsx("div", { className: "mt-4 h-8 flex-shrink-0", "aria-hidden": "true" }),
          top != null && /* @__PURE__ */ jsx("div", { className: "mt-3 mb-2 pb-1", children: resolve(top, ctx) }),
          /* @__PURE__ */ jsx(
            "nav",
            {
              className: `flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-2 transition-opacity duration-150 motion-reduce:transition-none ${navDimmed ? "opacity-40" : ""}`,
              children: /* @__PURE__ */ jsx(
                SidebarNavSections,
                {
                  sections,
                  pathname,
                  collapsed: ctx.collapsed,
                  activeClassName,
                  renderLink,
                  renderLocked,
                  lockBadge,
                  sectionGapClassName,
                  quickActionClassName,
                  quickActionActiveClassName,
                  decorate,
                  onNavigate: closeDrawer
                }
              )
            }
          ),
          accountMenu != null && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 px-2 pb-2 pt-1", children: /* @__PURE__ */ jsx("div", { className: "mt-1 border-t pt-1", style: { borderColor: "var(--sb-border)" }, children: resolve(accountMenu, ctx) }) })
        ]
      }
    )
  ] });
}
export {
  AppSidebar
};
//# sourceMappingURL=AppSidebar.js.map