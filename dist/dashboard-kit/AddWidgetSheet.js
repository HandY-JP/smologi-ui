"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { confirmedSelection, toggleSelected } from "./selection.js";
const WIDE_QUERY = "(min-width: 640px)";
function subscribeWide(cb) {
  const mql = window.matchMedia(WIDE_QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}
function useIsWide() {
  return useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE_QUERY).matches, () => false);
}
function PreviewArt({ kind = "stats" }) {
  return /* @__PURE__ */ jsx("div", { "aria-hidden": true, className: "mb-2 flex h-14 items-end overflow-hidden rounded-lg bg-current/5 p-2", children: kind === "chart" ? /* @__PURE__ */ jsx("svg", { viewBox: "0 0 100 32", preserveAspectRatio: "none", className: "h-full w-full", children: /* @__PURE__ */ jsx("polyline", { points: "0,26 16,20 32,23 48,12 64,15 80,6 100,9", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinejoin: "round", strokeLinecap: "round", vectorEffect: "non-scaling-stroke", opacity: "0.6" }) }) : kind === "bars" ? /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-end gap-1.5", children: [40, 65, 50, 85, 60, 95].map((h, i) => /* @__PURE__ */ jsx("span", { className: "flex-1 rounded-sm bg-current opacity-40", style: { height: `${h}%` } }, i)) }) : kind === "list" ? /* @__PURE__ */ jsx("div", { className: "flex h-full w-full flex-col justify-between", children: [90, 70, 80].map((w, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
    /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-current opacity-40" }),
    /* @__PURE__ */ jsx("span", { className: "h-1.5 rounded-full bg-current opacity-30", style: { width: `${w}%` } })
  ] }, i)) }) : /* @__PURE__ */ jsxs("div", { className: "flex w-full flex-col gap-1.5 self-center", children: [
    /* @__PURE__ */ jsx("span", { className: "h-3 w-2/5 rounded-sm bg-current opacity-50" }),
    /* @__PURE__ */ jsx("span", { className: "h-1.5 w-3/5 rounded-full bg-current opacity-25" })
  ] }) });
}
function AddWidgetSheet({
  open,
  candidates,
  onPick,
  onClose,
  sheetClassName,
  candidateClassName,
  scrimClassName = "bg-black/35",
  multiple = false,
  onPickMany,
  title,
  hint,
  confirmLabel = "\u8FFD\u52A0\u3059\u308B",
  cancelLabel = "\u3084\u3081\u308B",
  footerButtonClassName = "rounded-full border border-current px-4 py-2 text-sm font-medium",
  footerPrimaryClassName = "rounded-full bg-current px-4 py-2 text-sm font-medium",
  selectedClassName = "ring-2 ring-current",
  footerClassName = ""
}) {
  const wide = useIsWide();
  const [selected, setSelected] = useState([]);
  useEffect(() => {
    if (open) setSelected([]);
  }, [open]);
  const confirm = () => {
    const ids = confirmedSelection(selected, candidates);
    if (ids.length === 0) return;
    onPickMany?.(ids);
  };
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
  const heading = title ?? (multiple ? "\u30A6\u30A3\u30B8\u30A7\u30C3\u30C8\u3092\u9078\u3076" : "\u30A6\u30A3\u30B8\u30A7\u30C3\u30C8\u3092\u8FFD\u52A0");
  const allAdded = candidates.every((c) => c.added);
  const body = /* @__PURE__ */ jsxs(Fragment, { children: [
    multiple ? /* @__PURE__ */ jsx("p", { className: "mb-3 text-[13px] opacity-60", children: hint ?? "\u62BC\u3057\u3066\u9078\u3073\u3001\u300C\u8FFD\u52A0\u3059\u308B\u300D\u3067\u4E26\u3079\u307E\u3059\u3002\u3042\u3068\u304B\u3089\u300C\u7DE8\u96C6\u300D\u3067\u3044\u3064\u3067\u3082\u5909\u3048\u3089\u308C\u307E\u3059\u3002" }) : null,
    allAdded ? /* @__PURE__ */ jsx("p", { className: "text-[13px] opacity-60", children: "\u3059\u3079\u3066\u306E\u30A6\u30A3\u30B8\u30A7\u30C3\u30C8\u3092\u8868\u793A\u4E2D\u3067\u3059\u3002" }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5", children: candidates.map((c) => {
      const locked = !!c.disabled && !c.added;
      const inert = locked || !!c.added;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          disabled: inert,
          "aria-disabled": inert || void 0,
          "aria-pressed": multiple && !inert ? selected.includes(c.id) : void 0,
          onClick: () => {
            if (inert) return;
            if (multiple) setSelected((cur) => toggleSelected(cur, candidates, c.id));
            else onPick(c.id);
          },
          className: `relative text-left ${c.added ? "cursor-default" : ""} ${multiple && selected.includes(c.id) ? selectedClassName : ""} ${candidateClassName}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: locked ? "opacity-50" : void 0, children: /* @__PURE__ */ jsx(PreviewArt, { kind: c.preview }) }),
            /* @__PURE__ */ jsxs("div", { className: locked ? "opacity-50" : void 0, children: [
              /* @__PURE__ */ jsxs("b", { className: "mb-1 flex flex-wrap items-center gap-1.5 text-sm", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  inert || multiple ? "" : "\uFF0B ",
                  c.title
                ] }),
                c.added ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-current/10 px-2 py-0.5 text-[11px] font-semibold leading-none", children: [
                  /* @__PURE__ */ jsx("svg", { viewBox: "0 0 12 12", width: "11", height: "11", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { d: "M2.5 6.5l2.5 2.5 4.5-5.5", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" }) }),
                  "\u8FFD\u52A0\u6E08\u307F"
                ] }) : null,
                c.badge ? /* @__PURE__ */ jsx("span", { className: "rounded-full border border-current px-1.5 py-px text-[10px] font-semibold leading-none opacity-70", children: c.badge }) : null,
                c.recommended && !c.disabled && !c.added ? /* @__PURE__ */ jsx("span", { className: "rounded-full border border-current px-1.5 py-px text-[10px] font-semibold leading-none opacity-70", children: "\u304A\u3059\u3059\u3081" }) : null
              ] }),
              c.description ? /* @__PURE__ */ jsx("small", { className: "text-xs leading-normal opacity-60", children: c.description }) : null
            ] })
          ]
        },
        c.id
      );
    }) })
  ] });
  const footer = multiple ? /* @__PURE__ */ jsxs("div", { className: `${wide ? "shrink-0 px-5 py-3" : "sticky bottom-0 -mx-4 mt-3.5 px-4 py-2"} flex justify-end gap-2 ${footerClassName}`, children: [
    /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: footerButtonClassName, children: cancelLabel }),
    /* @__PURE__ */ jsx("button", { type: "button", onClick: confirm, disabled: confirmedSelection(selected, candidates).length === 0, className: `${footerPrimaryClassName} disabled:opacity-50`, children: confirmLabel })
  ] }) : null;
  return createPortal(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: `fixed inset-0 z-40 ${scrimClassName}`, onClick: onClose, "aria-hidden": true }),
      wide ? (
        // PC 幅: 画面中央のモーダル。大きさは固定で、中身だけスクロールする。
        /* @__PURE__ */ jsxs(
          "div",
          {
            ref: dialogRef,
            role: "dialog",
            "aria-modal": "true",
            "aria-label": heading,
            tabIndex: -1,
            className: `fixed left-1/2 top-1/2 z-[41] flex h-[min(640px,80vh)] w-[min(768px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden outline-none ${sheetClassName}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 items-center justify-between gap-3 px-5 pb-2 pt-4", children: [
                /* @__PURE__ */ jsx("h4", { className: "text-base font-semibold", children: heading }),
                /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, "aria-label": "\u9589\u3058\u308B", className: "rounded-full p-1.5 opacity-60 hover:opacity-100", children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 16 16", width: "16", height: "16", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { d: "M3.5 3.5l9 9m0-9l-9 9", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" }) }) })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "min-h-0 flex-1 overflow-y-auto px-5 pb-4", children: body }),
              footer
            ]
          }
        )
      ) : /* @__PURE__ */ jsxs(
        "div",
        {
          ref: dialogRef,
          role: "dialog",
          "aria-modal": "true",
          "aria-label": heading,
          tabIndex: -1,
          className: `fixed bottom-0 left-1/2 z-[41] max-h-[70vh] w-[min(560px,100%)] -translate-x-1/2 overflow-auto outline-none px-4 pb-[calc(20px+env(safe-area-inset-bottom,0px))] pt-2.5 ${sheetClassName}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "mx-auto mb-2.5 mt-1 h-[5px] w-10 rounded-[3px] bg-current opacity-20" }),
            /* @__PURE__ */ jsx("h4", { className: `${multiple ? "mb-1" : "mb-2.5"} text-base font-semibold`, children: heading }),
            body,
            footer
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