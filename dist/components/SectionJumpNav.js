"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { computeChipOverflow } from "../lib/topbar-compaction.js";
import { measureSectionJumpWidths } from "./section-jump-measure.js";
const MENU_WIDTH_PX = 224;
const MENU_MARGIN_PX = 8;
const MENU_GAP_PX = 6;
function JumpButton({
  item,
  active,
  onJump
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: () => onJump(item.key),
      "aria-current": active ? "true" : void 0,
      className: `sb-section-jump${active ? " on" : ""}`,
      title: `${item.label}\uFF08${item.count}\u4EF6\uFF09\u3078\u79FB\u52D5`,
      children: [
        item.dotClassName && /* @__PURE__ */ jsx("span", { className: `sb-section-jump-dot ${item.dotClassName}`, "aria-hidden": true }),
        /* @__PURE__ */ jsx("span", { className: "sb-section-jump-label", children: item.label }),
        /* @__PURE__ */ jsx("b", { children: item.count > 999 ? "999+" : item.count })
      ]
    }
  );
}
function OverflowMenu({
  items,
  activeKey,
  onJump,
  onClose,
  triggerRef
}) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState(null);
  useLayoutEffect(() => {
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const maxLeft = window.innerWidth - MENU_WIDTH_PX - MENU_MARGIN_PX;
      const left = Math.max(MENU_MARGIN_PX, Math.min(rect.right - MENU_WIDTH_PX, maxLeft));
      setPosition({ top: rect.bottom + MENU_GAP_PX, left });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [triggerRef]);
  useEffect(() => {
    const onMouseDown = (e) => {
      const target = e.target;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      onClose();
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, triggerRef]);
  if (typeof document === "undefined" || !position) return null;
  return createPortal(
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: menuRef,
        role: "menu",
        style: { top: position.top, left: position.left, width: MENU_WIDTH_PX },
        className: "fixed z-[60] flex max-h-[60vh] flex-col overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-xl",
        children: items.map((item) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            role: "menuitem",
            onClick: () => {
              onJump(item.key);
              onClose();
            },
            className: `flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${item.key === activeKey ? "font-semibold text-gray-900" : "text-gray-700"}`,
            children: [
              item.dotClassName && /* @__PURE__ */ jsx("span", { className: `h-2 w-2 shrink-0 rounded-full ${item.dotClassName}`, "aria-hidden": true }),
              /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 truncate", children: item.label }),
              /* @__PURE__ */ jsx("span", { className: "shrink-0 text-xs text-gray-400", children: item.count })
            ]
          },
          item.key
        ))
      }
    ),
    document.body
  );
}
function SectionJumpNav({
  items,
  activeKey,
  onJump,
  ariaLabel
}) {
  const containerRef = useRef(null);
  const moreTriggerRef = useRef(null);
  const [shownIds, setShownIds] = useState(null);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const available = el.clientWidth;
      const measured = measureSectionJumpWidths(items);
      const chips = items.map((item) => ({
        id: item.key,
        widthPx: (measured.widths.get(item.key) ?? 0) + 3
      }));
      const result = computeChipOverflow(chips, available, measured.moreWidthPx + 3);
      setShownIds((prev) => {
        const next = result.collapsedToCount ? [] : result.shownIds;
        if (prev && prev.length === next.length && prev.every((id, i) => id === next[i])) return prev;
        return next;
      });
      setHiddenCount(result.hiddenCount);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [items]);
  if (items.length === 0) return null;
  const shownSet = new Set(shownIds ?? items.map((item) => item.key));
  const visible = items.filter((item) => shownSet.has(item.key));
  const hidden = items.filter((item) => !shownSet.has(item.key));
  return /* @__PURE__ */ jsxs("nav", { ref: containerRef, "aria-label": ariaLabel, className: "sb-section-jump-nav", children: [
    visible.map((item) => /* @__PURE__ */ jsx(JumpButton, { item, active: item.key === activeKey, onJump }, item.key)),
    hiddenCount > 0 && /* @__PURE__ */ jsxs(
      "button",
      {
        ref: moreTriggerRef,
        type: "button",
        onClick: () => setMenuOpen((v) => !v),
        "aria-haspopup": "menu",
        "aria-expanded": menuOpen,
        className: "sb-section-jump",
        title: `\u4ED6${hiddenCount}\u4EF6\u306E\u30B0\u30EB\u30FC\u30D7`,
        children: [
          "\uFF0B",
          hiddenCount,
          " \u25BE"
        ]
      }
    ),
    menuOpen && hidden.length > 0 && /* @__PURE__ */ jsx(
      OverflowMenu,
      {
        items: hidden,
        activeKey,
        onJump,
        onClose: () => setMenuOpen(false),
        triggerRef: moreTriggerRef
      }
    )
  ] });
}
export {
  SectionJumpNav
};
//# sourceMappingURL=SectionJumpNav.js.map
