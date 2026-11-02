"use client";
import { jsx } from "react/jsx-runtime";
const GRID_ICON = "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z";
const ALL_PAGES_PANEL_ID = "all-pages-panel";
function AllPagesDockButton({
  open,
  onToggle,
  panelId = ALL_PAGES_PANEL_ID
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: onToggle,
      "data-all-pages-trigger": true,
      "aria-haspopup": "dialog",
      "aria-expanded": open,
      "aria-controls": open ? panelId : void 0,
      "aria-label": "\u3059\u3079\u3066\u306E\u30DA\u30FC\u30B8",
      title: "\u3059\u3079\u3066\u306E\u30DA\u30FC\u30B8",
      className: "relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[var(--sb-text)] transition-colors hover:bg-[var(--sb-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-accent-bg)]",
      children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: GRID_ICON }) })
    }
  );
}
export {
  ALL_PAGES_PANEL_ID,
  AllPagesDockButton
};
//# sourceMappingURL=AllPagesDockButton.js.map