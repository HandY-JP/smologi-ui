"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { isSidebarNavItemActive } from "../lib/sidebar-nav.js";
import { SidebarNewDot } from "./SidebarNewDot.js";
const DEFAULT_SIDEBAR_ACTIVE_CLASS = "sb-nav-active";
const defaultRenderLink = (props) => /* @__PURE__ */ jsx("a", { ...props });
const ROW_FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-text)]";
function SidebarNavSectionLabel({ label }) {
  return /* @__PURE__ */ jsx("div", { className: "truncate px-3 pt-4 pb-1 text-[10px] font-semibold tracking-wider", style: { color: "var(--sb-label)" }, children: label });
}
function CountBadge({ item }) {
  if (typeof item.count !== "number" || item.count <= 0) return null;
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: `min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none tabular-nums ${item.countTone === "danger" ? "bg-red-600 text-white" : item.countTone === "info" ? "bg-blue-600 text-white" : item.countTone === "accent" ? "bg-[var(--sb-accent-bg)] text-[color:var(--accent-on)]" : "bg-[var(--sb-hover,#FBF7F2)] text-[#C2560D]"}`,
      "aria-label": item.countLabel ?? `${item.count}\u4EF6`,
      children: item.count > 999 ? "999+" : item.count
    }
  );
}
const PLUS_ICON = /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 5v14M5 12h14" }) });
function SidebarNavLink({
  item,
  pathname,
  collapsed = false,
  activeClassName = DEFAULT_SIDEBAR_ACTIVE_CLASS,
  renderLink = defaultRenderLink,
  renderLocked,
  lockBadge = "PRO",
  quickActionClassName,
  quickActionActiveClassName,
  onNavigate
}) {
  if (item.comingSoon) {
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: `flex h-9 items-center rounded-md text-base cursor-not-allowed opacity-50 select-none ${collapsed ? "justify-center" : "gap-2.5 px-3"}`,
        style: { color: "var(--sb-text)" },
        title: "\u4ECA\u5F8C\u5B9F\u88C5\u4E88\u5B9A\u306E\u6A5F\u80FD\u3067\u3059",
        children: [
          item.icon,
          !collapsed && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: item.label }),
            /* @__PURE__ */ jsx(
              "span",
              {
                className: "flex-shrink-0 whitespace-nowrap rounded px-1 py-px text-[9px] font-bold",
                style: { backgroundColor: "var(--sb-hover)", color: "var(--sb-label)" },
                children: "\u6E96\u5099\u4E2D"
              }
            )
          ] })
        ]
      }
    );
  }
  if (item.locked) {
    const title2 = item.lockedReason ?? `${item.label}\uFF08\u5229\u7528\u3067\u304D\u307E\u305B\u3093\uFF09`;
    const body = /* @__PURE__ */ jsxs(Fragment, { children: [
      item.icon,
      !collapsed && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: item.label }),
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "flex-shrink-0 whitespace-nowrap rounded px-1 py-px text-[9px] font-bold",
            style: { backgroundColor: "var(--sb-hover)", color: "var(--sb-label)" },
            children: lockBadge
          }
        )
      ] })
    ] });
    const className = `flex h-9 w-full items-center rounded-md text-left text-base text-[var(--sb-text)] opacity-50 transition-opacity hover:opacity-90 ${collapsed ? "justify-center" : "gap-2.5 px-3"} focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sb-accent-bg)]`;
    return renderLocked ? /* @__PURE__ */ jsx(Fragment, { children: renderLocked({ className, title: title2, children: body }, item) }) : /* @__PURE__ */ jsx("div", { className: `${className} cursor-not-allowed`, title: title2, "aria-disabled": "true", children: body });
  }
  const isActive = isSidebarNavItemActive(item, pathname);
  const baseLabel = item.badge ? `${item.label} (${item.badge}\u7248)` : item.label;
  const title = item.dot && item.dotReason ? `${baseLabel}\uFF08${item.dotReason}\uFF09` : item.dim && !isActive ? `${baseLabel}\uFF08\u672A\u8A2D\u5B9A\uFF09` : baseLabel;
  const quickAction = !collapsed ? item.quickAction : void 0;
  const pillClass = "sb-glass-surface-ringed whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none";
  const main = renderLink(
    {
      href: item.href,
      title,
      "aria-label": item.badge || item.dot && item.dotReason ? title : item.label,
      "aria-current": isActive ? "page" : void 0,
      onClick: onNavigate,
      "data-tour": item.dataTour,
      className: `relative flex h-9 items-center rounded-md text-base transition-colors ${ROW_FOCUS} ${collapsed ? "justify-center px-0" : quickAction ? "gap-2.5 pl-3 pr-10" : "gap-2.5 px-3"} ${isActive ? `${activeClassName} font-semibold` : "hover:bg-[var(--sb-hover)]"} ${item.dim && !isActive ? "opacity-55" : ""}`,
      style: isActive ? void 0 : { color: "var(--sb-text)" },
      children: /* @__PURE__ */ jsxs(Fragment, { children: [
        item.icon,
        !collapsed && /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: item.label }),
        !collapsed && /* @__PURE__ */ jsx(CountBadge, { item }),
        !collapsed && item.unlockPill && /* @__PURE__ */ jsx("span", { className: pillClass, style: { color: "var(--sb-label)" }, children: item.unlockPill }),
        !collapsed && item.badge && /* @__PURE__ */ jsx("span", { className: "rounded-full border border-orange-300 bg-white px-1.5 py-0.5 text-[11px] font-bold leading-none text-orange-700", children: item.badge }),
        item.dot && /* @__PURE__ */ jsx(SidebarNewDot, { placement: collapsed ? "corner" : "inline", label: item.dotReason ?? "\u65B0\u7740\u3042\u308A", onAccent: false })
      ] })
    },
    { kind: "item", item }
  );
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    main,
    quickAction && renderLink(
      {
        href: quickAction.href,
        title: quickAction.label,
        "aria-label": quickAction.label,
        className: `absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--sb-accent-bg)] ${isActive ? quickActionActiveClassName ?? "sb-nav-round-active" : quickActionClassName ?? "bg-[var(--sb-hover)] hover:shadow-[0_0_0_1px_var(--sb-label)]"}`,
        style: isActive || quickActionClassName ? void 0 : { color: "var(--sb-text)" },
        children: PLUS_ICON
      },
      { kind: "quickAction", item }
    ),
    quickAction && item.quickActionCount && typeof item.quickActionCount.count === "number" && item.quickActionCount.count > 0 && renderLink(
      {
        href: item.quickActionCount.href,
        title: `${item.quickActionCount.label} ${item.quickActionCount.count}\u4EF6`,
        "aria-label": `${item.quickActionCount.label} ${item.quickActionCount.count}\u4EF6`,
        className: "absolute right-0 top-0 min-w-[1rem] rounded-full bg-[#C2560D] px-1 py-0.5 text-center text-[10px] font-semibold leading-none tabular-nums text-white",
        children: item.quickActionCount.count > 99 ? "99+" : item.quickActionCount.count
      },
      { kind: "quickActionCount", item }
    )
  ] });
}
function CollapsibleSectionHeader({ label, open, dot, onToggle }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: onToggle,
      "aria-expanded": open,
      className: "mt-3 mb-1 flex h-7 w-full items-center gap-2 rounded-md px-3 text-left text-[10px] font-semibold tracking-wider transition-colors hover:bg-[var(--sb-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-text)]",
      style: { color: "var(--sb-label)" },
      children: [
        /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: label }),
        dot && /* @__PURE__ */ jsx(SidebarNewDot, { label: "\u4E2D\u306B\u8981\u5BFE\u5FDC\u3042\u308A" }),
        /* @__PURE__ */ jsx("svg", { className: `h-3.5 w-3.5 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "m6 9 6 6 6-6" }) })
      ]
    }
  );
}
function SidebarNavSectionBlock({
  section,
  index,
  gapClassName,
  decorate,
  ...rest
}) {
  const items = decorate ? section.items.map(decorate) : section.items;
  const [expanded, setExpanded] = useState(section.defaultOpen ?? false);
  useEffect(() => {
    if (!section.collapsible || !section.storageKey) return;
    try {
      const v = window.localStorage.getItem(section.storageKey);
      if (v === "1" || v === "0") setExpanded(v === "1");
    } catch {
    }
  }, [section.collapsible, section.storageKey]);
  const toggle = () => {
    setExpanded((prev) => {
      const next = !prev;
      if (section.storageKey) {
        try {
          window.localStorage.setItem(section.storageKey, next ? "1" : "0");
        } catch {
        }
      }
      return next;
    });
  };
  const sectionActive = items.some((item) => isSidebarNavItemActive(item, rest.pathname));
  const open = !section.collapsible || sectionActive || expanded;
  const hasDot = items.some((item) => item.dot);
  const gap = index === 0 ? "pt-1" : gapClassName ?? (section.label ? "" : "mt-4");
  return /* @__PURE__ */ jsxs("div", { className: gap, children: [
    section.label && !rest.collapsed && (section.collapsible ? /* @__PURE__ */ jsx(CollapsibleSectionHeader, { label: section.label, open, dot: hasDot, onToggle: toggle }) : /* @__PURE__ */ jsx(SidebarNavSectionLabel, { label: section.label })),
    open && /* @__PURE__ */ jsx("div", { className: "space-y-0.5", children: items.map((item, i) => /* @__PURE__ */ jsx(SidebarNavLink, { item, ...rest }, `${item.href}#${i}`)) })
  ] });
}
function SidebarNavSections({
  sections,
  decorate,
  sectionGapClassName,
  ...rest
}) {
  return /* @__PURE__ */ jsx(Fragment, { children: sections.map((section, index) => /* @__PURE__ */ jsx(SidebarNavSectionBlock, { section, index, gapClassName: sectionGapClassName, decorate, ...rest }, section.key)) });
}
export {
  DEFAULT_SIDEBAR_ACTIVE_CLASS,
  SidebarNavLink,
  SidebarNavSectionLabel,
  SidebarNavSections
};
//# sourceMappingURL=SidebarNav.js.map