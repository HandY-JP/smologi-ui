"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { SidebarAccountAvatar } from "./SidebarAccountRow.js";
import { useSidebarPeekHold } from "./useSidebarPeekHold.js";
const SIDEBAR_MENU_ICONS = {
  settings: /* @__PURE__ */ jsxs("svg", { className: "h-[18px] w-[18px] text-[var(--sb-label)]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.325 4.317a1.724 1.724 0 013.35 0 1.724 1.724 0 002.573 1.066 1.724 1.724 0 012.37 2.37 1.724 1.724 0 001.065 2.572 1.724 1.724 0 010 3.35 1.724 1.724 0 00-1.066 2.573 1.724 1.724 0 01-2.37 2.37 1.724 1.724 0 00-2.572 1.065 1.724 1.724 0 01-3.35 0 1.724 1.724 0 00-2.573-1.066 1.724 1.724 0 01-2.37-2.37 1.724 1.724 0 00-1.065-2.572 1.724 1.724 0 010-3.35 1.724 1.724 0 001.066-2.573 1.724 1.724 0 012.37-2.37 1.724 1.724 0 002.572-1.065z" }),
    /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
  ] }),
  help: /* @__PURE__ */ jsx("svg", { className: "h-[18px] w-[18px] text-[var(--sb-label)]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.879 7.519a3 3 0 115.242 2.532c-.966.966-1.5 1.29-1.5 2.949M12 17.5h.01M12 3a9 9 0 100 18 9 9 0 000-18z" }) }),
  logout: /* @__PURE__ */ jsx("svg", { className: "h-[18px] w-[18px] text-[var(--sb-label)]", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) })
};
const ITEM_CLASS = "flex w-full items-center gap-3 px-3 py-2.5 text-left text-[14px] leading-[22px] text-[var(--sb-text)] transition-colors hover:bg-[var(--sb-hover)]";
function AppSidebarAccountMenu({
  name,
  email,
  image,
  items,
  extra,
  signOut,
  renderLink,
  buttonTitle
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useSidebarPeekHold(open);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);
  const display = name ?? email ?? "\u30E6\u30FC\u30B6\u30FC";
  const avatar = /* @__PURE__ */ jsx(SidebarAccountAvatar, { src: image, name: name ?? email });
  return /* @__PURE__ */ jsxs("div", { className: "relative", ref, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen((value) => !value),
        "aria-haspopup": "menu",
        "aria-expanded": open,
        title: buttonTitle ?? name ?? "\u30A2\u30AB\u30A6\u30F3\u30C8",
        className: "flex h-9 w-full items-center gap-2 rounded-md px-2 transition-colors hover:bg-[var(--sb-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--sb-text)]",
        style: { color: "var(--sb-text)" },
        children: [
          avatar,
          /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate text-left text-[15px] leading-[22px]", children: display }),
          /* @__PURE__ */ jsx("svg", { className: "h-3.5 w-3.5 flex-shrink-0 text-[var(--sb-label)]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 15l4-4 4 4M8 9l4-4 4 4" }) })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxs(
      "div",
      {
        role: "menu",
        className: "absolute bottom-full left-2 right-2 z-30 mb-1 overflow-hidden rounded-md border shadow-lg",
        style: { backgroundColor: "var(--sb-glass-bg-opaque, #fff)", borderColor: "var(--sb-border, #e5e7eb)", color: "var(--sb-text)" },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-3 py-3", children: [
            avatar,
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "truncate text-[14px] leading-[22px] font-semibold", style: { color: "var(--sb-heading, var(--sb-text))" }, children: display }),
              email && /* @__PURE__ */ jsx("p", { className: "truncate text-[12px] leading-[18px]", style: { color: "var(--sb-label)" }, children: email })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-t py-1", style: { borderColor: "var(--sb-hover)" }, children: [
            extra,
            items.map((item) => {
              const body = /* @__PURE__ */ jsxs(Fragment, { children: [
                item.icon,
                item.label
              ] });
              if (item.href) {
                const linkProps = {
                  href: item.href,
                  title: item.label,
                  onClick: () => {
                    setOpen(false);
                    item.onSelect?.();
                  },
                  className: ITEM_CLASS,
                  role: "menuitem",
                  children: body
                };
                return renderLink ? /* @__PURE__ */ jsx("div", { children: renderLink(linkProps, { kind: "item", item: { href: item.href, label: item.label, icon: item.icon } }) }, item.key) : /* @__PURE__ */ jsx("a", { ...linkProps }, item.key);
              }
              return /* @__PURE__ */ jsx("button", { type: "button", role: "menuitem", onClick: () => {
                setOpen(false);
                item.onSelect?.();
              }, className: ITEM_CLASS, children: body }, item.key);
            })
          ] }),
          signOut && /* @__PURE__ */ jsx("div", { className: "border-t py-1", style: { borderColor: "var(--sb-hover)" }, children: /* @__PURE__ */ jsxs("button", { type: "button", role: "menuitem", onClick: signOut.onSelect, className: ITEM_CLASS, children: [
            SIDEBAR_MENU_ICONS.logout,
            signOut.label ?? "\u30ED\u30B0\u30A2\u30A6\u30C8"
          ] }) })
        ]
      }
    )
  ] });
}
export {
  AppSidebarAccountMenu,
  SIDEBAR_MENU_ICONS
};
//# sourceMappingURL=AppSidebarAccountMenu.js.map