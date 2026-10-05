"use client";
import { jsx, jsxs } from "react/jsx-runtime";
const WAREHOUSE_ICON = /* @__PURE__ */ jsxs("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", "aria-hidden": "true", children: [
  /* @__PURE__ */ jsx("rect", { x: "4", y: "5", width: "16", height: "14", rx: "1" }),
  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", d: "M4 9.5h16" }),
  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", d: "M12 9.5V19" })
] });
const STOREFRONT_ICON = /* @__PURE__ */ jsxs("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", "aria-hidden": "true", children: [
  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 21h18" }),
  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4 21V10M20 21V10" }),
  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 10 4 4h16l1 6" }),
  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 10h18" }),
  /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10 21v-5a2 2 0 0 1 4 0v5" })
] });
const DEFAULT_WORKSPACE_ITEMS = [
  { kind: "logistics", label: "\u5009\u5EAB\u753B\u9762", title: "\u5009\u5EAB\u753B\u9762\uFF08\u30B9\u30E2\u30ED\u30B8\u7BA1\u7406\uFF09", icon: WAREHOUSE_ICON },
  { kind: "customer", label: "\u304A\u5BA2\u69D8\u753B\u9762", title: "\u304A\u5BA2\u69D8\u753B\u9762\uFF08\u81EA\u793E\uFF09", icon: STOREFRONT_ICON }
];
function WorkspaceSwitch({
  items,
  current,
  onSelect,
  onSwitch,
  onPrefetch,
  disabled = false,
  pendingTarget = null,
  pending,
  ariaLabel = "\u753B\u9762\u306E\u5207\u308A\u66FF\u3048"
}) {
  const list = items ?? DEFAULT_WORKSPACE_ITEMS;
  const shown = pending ?? pendingTarget ?? current;
  return /* @__PURE__ */ jsx(
    "div",
    {
      role: "radiogroup",
      "aria-label": ariaLabel,
      className: "flex h-8 flex-shrink-0 items-center gap-0.5 rounded-full px-0.5",
      style: { backgroundColor: "var(--sb-hover)" },
      children: list.map(({ kind, label, title, icon }) => {
        const selected = shown === kind;
        return /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            role: "radio",
            "aria-checked": selected,
            "aria-label": label,
            title: title ?? label,
            disabled,
            onPointerEnter: () => onPrefetch?.(kind),
            onFocus: () => onPrefetch?.(kind),
            onClick: () => {
              if (kind === current || disabled) return;
              onSelect?.(kind);
              onSwitch?.(kind);
            },
            className: "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-accent-bg)] disabled:cursor-default",
            style: selected ? { backgroundColor: "var(--sb-accent-bg)", color: "var(--accent-on)" } : { color: "var(--sb-text)" },
            children: icon
          },
          kind
        );
      })
    }
  );
}
export {
  DEFAULT_WORKSPACE_ITEMS,
  STOREFRONT_ICON,
  WAREHOUSE_ICON,
  WorkspaceSwitch
};
//# sourceMappingURL=WorkspaceSwitch.js.map