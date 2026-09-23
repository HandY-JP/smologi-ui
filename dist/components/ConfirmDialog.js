"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Modal } from "./Modal.js";
const TONE_ICON = {
  danger: "bg-rose-50 text-rose-600",
  primary: "bg-blue-50 text-blue-600"
};
const TONE_CONFIRM_BUTTON = {
  danger: "bg-rose-600 hover:bg-rose-700",
  primary: "bg-[var(--sb-accent-bg)] hover:bg-[var(--accent-hover)]"
};
function ConfirmDialog({
  open,
  title,
  lines = [],
  confirmLabel = "\u5B9F\u884C\u3059\u308B",
  cancelLabel = "\u30AD\u30E3\u30F3\u30BB\u30EB",
  tone = "danger",
  busy = false,
  layer = "base",
  overlayClassName,
  panelClassName,
  onConfirm,
  onClose
}) {
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open,
      onClose,
      ariaLabel: title,
      role: "alertdialog",
      layer,
      size: "md",
      dismissable: !busy,
      bodyClassName: "p-5",
      overlayClassName,
      panelClassName,
      footer: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            "data-autofocus": true,
            onClick: onClose,
            disabled: busy,
            className: "rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50",
            children: cancelLabel
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: onConfirm,
            disabled: busy,
            className: `inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${TONE_CONFIRM_BUTTON[tone]}`,
            children: [
              busy && /* @__PURE__ */ jsx("span", { className: "h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white", "aria-hidden": "true" }),
              confirmLabel
            ]
          }
        )
      ] }),
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: `flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONE_ICON[tone]}`, children: /* @__PURE__ */ jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", strokeWidth: 1.8, viewBox: "0 0 24 24", "aria-hidden": "true", children: tone === "danger" ? /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" }) : /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.25 11.25h1.5v5.25m-.75-9h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-slate-900", children: title }),
          lines.length > 0 && /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1.5", children: lines.map((line) => /* @__PURE__ */ jsx("li", { className: "text-xs leading-5 text-slate-600", children: line }, line)) })
        ] })
      ] })
    }
  );
}
export {
  ConfirmDialog
};
//# sourceMappingURL=ConfirmDialog.js.map