"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
const GEAR_ICON_PATH_1 = "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z";
const GEAR_ICON_PATH_2 = "M15 12a3 3 0 11-6 0 3 3 0 016 0z";
function SidebarAccountAvatar({ src, name }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    /* @__PURE__ */ jsx("img", { src, alt: name ?? "", className: "h-7 w-7 flex-shrink-0 rounded-full object-cover" })
  ) : /* @__PURE__ */ jsx("span", { className: "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-600 text-xs font-medium text-white", children: name?.[0] ?? "?" });
}
function SidebarAccountRow({
  avatar,
  name,
  subText,
  onNameClick,
  renderName,
  nameActive = false,
  nameTitle = "\u30A2\u30AB\u30A6\u30F3\u30C8\u8A2D\u5B9A\u3092\u958B\u304F",
  onGear,
  gearActive = false,
  gearLabel,
  gearTitle,
  gearDataTour,
  extraActions,
  collapsed = false
}) {
  const nameProps = {
    title: nameTitle,
    "aria-current": nameActive ? "page" : void 0,
    className: `flex h-9 min-w-0 items-center rounded-md transition-colors hover:bg-[var(--sb-hover)] ${collapsed ? "flex-shrink-0 justify-center px-1.5" : "flex-1 gap-2 px-2"} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--sb-text)]`,
    style: { color: "var(--sb-text)" },
    children: /* @__PURE__ */ jsxs(Fragment, { children: [
      avatar,
      !collapsed && /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1 text-left", children: [
        /* @__PURE__ */ jsx("span", { className: "block truncate text-base", children: name }),
        subText != null && /* @__PURE__ */ jsx("span", { className: "block truncate text-xs", style: { color: "var(--sb-label)" }, children: subText })
      ] })
    ] })
  };
  return /* @__PURE__ */ jsxs("div", { className: `flex h-9 w-full items-center rounded-md ${collapsed ? "justify-center" : "gap-0.5"}`, children: [
    renderName ? renderName(nameProps) : /* @__PURE__ */ jsx("button", { type: "button", onClick: onNameClick, ...nameProps }),
    !collapsed && extraActions,
    !collapsed && onGear && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: onGear,
        "aria-pressed": gearActive,
        "aria-label": gearLabel ?? (gearActive ? "\u8A2D\u5B9A\u3092\u9589\u3058\u308B" : "\u8A2D\u5B9A\u3092\u958B\u304F"),
        title: gearTitle ?? (gearActive ? "\u8A2D\u5B9A\u3092\u9589\u3058\u308B" : "\u8A2D\u5B9A"),
        "data-tour": gearDataTour,
        className: `flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--sb-text)] ${gearActive ? "sb-nav-round-active" : "hover:bg-[var(--sb-hover)]"}`,
        style: gearActive ? void 0 : { color: "var(--sb-text)" },
        children: /* @__PURE__ */ jsxs("svg", { className: "h-[18px] w-[18px]", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: GEAR_ICON_PATH_1 }),
          /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: GEAR_ICON_PATH_2 })
        ] })
      }
    )
  ] });
}
export {
  SidebarAccountAvatar,
  SidebarAccountRow
};
//# sourceMappingURL=SidebarAccountRow.js.map