"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
function AddWidgetSheet({
  open,
  candidates,
  onPick,
  onClose,
  sheetClassName,
  candidateClassName,
  scrimClassName = "bg-black/35"
}) {
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      if (opener && opener.isConnected) opener.focus();
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const items = Array.from(root.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'));
        if (items.length === 0) {
          e.preventDefault();
          root.focus();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === root || !root.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !root.contains(active))) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: `fixed inset-0 z-40 ${scrimClassName}`, onClick: onClose, "aria-hidden": true }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          ref: dialogRef,
          role: "dialog",
          "aria-modal": "true",
          "aria-label": "\u30A6\u30A3\u30B8\u30A7\u30C3\u30C8\u3092\u8FFD\u52A0",
          tabIndex: -1,
          className: `fixed bottom-0 left-1/2 z-[41] max-h-[70vh] w-[min(560px,100%)] -translate-x-1/2 overflow-auto outline-none px-4 pb-[calc(20px+env(safe-area-inset-bottom,0px))] pt-2.5 ${sheetClassName}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "mx-auto mb-2.5 mt-1 h-[5px] w-10 rounded-[3px] bg-current opacity-20" }),
            /* @__PURE__ */ jsx("h4", { className: "mb-2.5 text-base font-semibold", children: "\u30A6\u30A3\u30B8\u30A7\u30C3\u30C8\u3092\u8FFD\u52A0" }),
            candidates.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-[13px] opacity-60", children: "\u3059\u3079\u3066\u306E\u30A6\u30A3\u30B8\u30A7\u30C3\u30C8\u3092\u8868\u793A\u4E2D\u3067\u3059\u3002" }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5", children: candidates.map((c) => /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                disabled: c.disabled,
                "aria-disabled": c.disabled || void 0,
                onClick: () => {
                  if (!c.disabled) onPick(c.id);
                },
                className: `text-left ${c.disabled ? "cursor-not-allowed opacity-50" : ""} ${candidateClassName}`,
                children: [
                  /* @__PURE__ */ jsxs("b", { className: "mb-1 flex items-center gap-1.5 text-sm", children: [
                    /* @__PURE__ */ jsxs("span", { children: [
                      c.disabled ? "" : "\uFF0B ",
                      c.title
                    ] }),
                    c.badge ? /* @__PURE__ */ jsx("span", { className: "rounded-full border border-current px-1.5 py-px text-[10px] font-semibold leading-none opacity-70", children: c.badge }) : null
                  ] }),
                  c.description ? /* @__PURE__ */ jsx("small", { className: "text-xs leading-normal opacity-60", children: c.description }) : null
                ]
              },
              c.id
            )) })
          ]
        }
      )
    ] }),
    document.body
  );
}
export {
  AddWidgetSheet
};
//# sourceMappingURL=AddWidgetSheet.js.map