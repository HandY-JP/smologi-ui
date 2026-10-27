"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AppBrandIcon } from "./AppBrandIcon.js";
import { SidebarNewDot } from "./SidebarNewDot.js";
import { Tooltip } from "./Tooltip.js";
function DashboardAppRow({
  apps,
  currentAppId,
  loading = false,
  size = "md",
  className = "",
  assetBase,
  renderIcon,
  ariaLabel = "\u5951\u7D04\u4E2D\u306E\u30A2\u30D7\u30EA",
  loadingText = "\u8AAD\u307F\u8FBC\u307F\u4E2D\u2026"
}) {
  if (!loading && apps.length === 0) return null;
  const box = size === "sm" ? "h-10 w-10" : "h-14 w-14";
  return /* @__PURE__ */ jsxs("nav", { "aria-label": ariaLabel, className: `flex flex-wrap items-center gap-3 p-1 ${className}`, children: [
    apps.map((app) => {
      const current = app.id === currentAppId;
      const tileClass = `relative block ${box} flex-shrink-0 rounded-[25%] transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${current ? "outline outline-2 outline-offset-2 outline-accent" : "hover:ring-2 hover:ring-line"}`;
      const inner = /* @__PURE__ */ jsxs(Fragment, { children: [
        renderIcon ? renderIcon(app) : /* @__PURE__ */ jsx(AppBrandIcon, { appId: app.id, assetBase, className: "block h-full w-full" }),
        app.dot && /* @__PURE__ */ jsx(SidebarNewDot, { placement: "corner" })
      ] });
      return /* @__PURE__ */ jsx(Tooltip, { content: app.label, side: "bottom", children: current ? (
        // 今いるアプリは押しても遷移しない（リンクにしない）。
        /* @__PURE__ */ jsx("span", { role: "img", "aria-current": "page", "aria-label": app.label, className: tileClass, children: inner })
      ) : /* @__PURE__ */ jsx("a", { href: app.href, target: "_blank", rel: "noopener noreferrer", "aria-label": app.label, className: tileClass, children: inner }) }, app.id);
    }),
    loading && /* @__PURE__ */ jsx("span", { className: "self-center text-xs text-ink-muted", role: "status", children: loadingText })
  ] });
}
export {
  DashboardAppRow
};
//# sourceMappingURL=DashboardAppRow.js.map