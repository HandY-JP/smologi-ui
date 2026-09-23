"use client";
import { jsx, jsxs } from "react/jsx-runtime";
function WorkspaceSwitch({
  current,
  onSwitch,
  onPrefetch,
  disabled = false,
  pendingTarget = null
}) {
  const shown = pendingTarget ?? current;
  const item = (kind, label, title, icon) => {
    const selected = shown === kind;
    return /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        role: "radio",
        "aria-checked": selected,
        "aria-label": label,
        title,
        disabled,
        onPointerEnter: () => onPrefetch?.(kind),
        onFocus: () => onPrefetch?.(kind),
        onClick: () => {
          if (kind === current || disabled) return;
          onSwitch(kind);
        },
        className: "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-accent-bg)] disabled:cursor-default",
        style: selected ? { backgroundColor: "var(--sb-accent-bg)", color: "var(--accent-on)" } : { color: "var(--sb-text)" },
        children: icon
      }
    );
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: "radiogroup",
      "aria-label": "\u753B\u9762\u306E\u5207\u308A\u66FF\u3048",
      className: "flex h-8 flex-shrink-0 items-center gap-0.5 rounded-full px-0.5",
      style: { backgroundColor: "var(--sb-hover)" },
      children: [
        item(
          "logistics",
          "\u5009\u5EAB\u753B\u9762",
          "\u5009\u5EAB\u753B\u9762\uFF08\u30B9\u30E2\u30ED\u30B8\u7BA1\u7406\uFF09",
          // 倉庫＝building/warehouse（切妻屋根＋シャッター）
          /* @__PURE__ */ jsxs("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5Z" }),
            /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 21v-6h8v6" }),
            /* @__PURE__ */ jsx("path", { strokeLinecap: "round", d: "M8 17.5h8" })
          ] })
        ),
        item(
          "customer",
          "\u304A\u5BA2\u69D8\u753B\u9762",
          "\u304A\u5BA2\u69D8\u753B\u9762\uFF08\u81EA\u793E\uFF09",
          // お客様＝人（1人）
          /* @__PURE__ */ jsxs("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", strokeWidth: 2, viewBox: "0 0 24 24", "aria-hidden": "true", children: [
            /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" }),
            /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 20a7.5 7.5 0 0 1 15 0" })
          ] })
        )
      ]
    }
  );
}
export {
  WorkspaceSwitch
};
//# sourceMappingURL=WorkspaceSwitch.js.map