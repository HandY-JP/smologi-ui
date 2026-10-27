"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { SidebarNewDot } from "./SidebarNewDot.js";
import { WorkspaceSwitch } from "./WorkspaceSwitch.js";
function SidebarToggleDock({
  collapsed,
  persistedCollapsed,
  onToggle,
  hoverHandlers,
  hasNews = false,
  newsReason,
  home,
  workspaceSwitch,
  allPages,
  renderLink,
  activeClassName = "sb-nav-active !shadow-none"
}) {
  const showNewsDot = hasNews && collapsed;
  const base = persistedCollapsed ? "\u30B5\u30A4\u30C9\u30D0\u30FC\u3092\u958B\u304F" : "\u30B5\u30A4\u30C9\u30D0\u30FC\u3092\u9589\u3058\u308B";
  const newsDotReason = newsReason ?? "\u8981\u5BFE\u5FDC\u3042\u308A";
  const label = showNewsDot ? `${base}\uFF08${newsDotReason}\uFF09` : base;
  const hint = persistedCollapsed ? "\u30B5\u30A4\u30C9\u30D0\u30FC\u3092\u958B\u304F\uFF08\u30DE\u30A6\u30B9\u3092\u91CD\u306D\u308B\u3068\u4E00\u6642\u7684\u306B\u8868\u793A\uFF09" : "\u30B5\u30A4\u30C9\u30D0\u30FC\u3092\u6298\u308A\u305F\u305F\u3080";
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(
    "div",
    {
      ...hoverHandlers,
      className: "fixed left-2 top-4 z-[70] flex h-8 flex-row items-center gap-1 rounded-md transition-colors duration-150 motion-reduce:transition-none print:hidden",
      style: collapsed ? void 0 : {
        backgroundColor: "var(--sb-bg)",
        // ドック幅をサイドバー幅いっぱいに広げ、右端の画面切替（ml-auto、下記）を
        // サイドバー本体の右余白（px-2 = 0.5rem、拠点セレクタ等と同じ）に揃える。
        // left-2（0.5rem）ぶんを引いた上で右にも同じ 0.5rem を残す＝差し引き 1rem。
        // 折りたたみ中（▶だけ）は広げない（ホバー領域が無駄に伸びるのを防ぐ）。
        width: "calc(var(--sidebar-visual-width) - 1rem)"
      },
      children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: onToggle,
            "aria-pressed": persistedCollapsed,
            "aria-label": label,
            title: showNewsDot ? `${hint} / ${newsDotReason}` : hint,
            className: `relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-accent-bg)] ${collapsed ? "text-ink-muted hover:bg-surface-subtle hover:text-ink" : "text-[var(--sb-text)] hover:bg-[var(--sb-hover)]"}`,
            children: [
              /* @__PURE__ */ jsxs(
                "svg",
                {
                  className: "h-4 w-4",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  strokeWidth: 2,
                  "aria-hidden": "true",
                  children: [
                    /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
                    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", d: "M9 3v18" }),
                    /* @__PURE__ */ jsx(
                      "path",
                      {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        d: persistedCollapsed ? "M13.75 9.5 16.25 12l-2.5 2.5" : "M16.25 9.5 13.75 12l2.5 2.5"
                      }
                    )
                  ]
                }
              ),
              showNewsDot && /* @__PURE__ */ jsx(SidebarNewDot, { placement: "corner", label: null, ringColor: "#ffffff" })
            ]
          }
        ),
        !collapsed && /* @__PURE__ */ jsxs(Fragment, { children: [
          home && (() => {
            const linkProps = {
              href: home.href,
              "aria-label": "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9",
              "aria-current": home.active ? "page" : void 0,
              title: home.dot && home.dotTitle ? `\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\uFF08${home.dotTitle}\uFF09` : "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9",
              onMouseEnter: () => home.intent?.enter(home.href),
              onMouseLeave: () => home.intent?.leave(home.href),
              onFocus: () => home.intent?.enter(home.href),
              onBlur: () => home.intent?.leave(home.href),
              onPointerDown: () => home.intent?.commit(home.href),
              className: `relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-accent-bg)] ${home.active ? activeClassName : "text-[var(--sb-text)] hover:bg-[var(--sb-hover)]"}`,
              children: /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) }),
                home.dot && /* @__PURE__ */ jsx(SidebarNewDot, { placement: "corner", label: null })
              ] })
            };
            return renderLink ? renderLink(linkProps) : /* @__PURE__ */ jsx("a", { ...linkProps });
          })(),
          allPages,
          workspaceSwitch && /* @__PURE__ */ jsx("div", { className: "ml-auto flex-shrink-0", children: /* @__PURE__ */ jsx(
            WorkspaceSwitch,
            {
              current: workspaceSwitch.current,
              onSwitch: workspaceSwitch.onSwitch,
              onPrefetch: workspaceSwitch.onPrefetch,
              disabled: workspaceSwitch.disabled,
              pendingTarget: workspaceSwitch.pendingTarget
            }
          ) })
        ] })
      ]
    }
  ) });
}
export {
  SidebarToggleDock
};
//# sourceMappingURL=SidebarToggleDock.js.map