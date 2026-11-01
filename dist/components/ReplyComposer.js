"use client";
import { jsx, jsxs } from "react/jsx-runtime";
function ReplyComposer({
  value,
  onChange,
  onSend,
  id,
  tools,
  footer,
  label = "\u9001\u4FE1",
  busy = false,
  disabled = false,
  placeholder,
  rows = 4,
  className = ""
}) {
  return /* @__PURE__ */ jsxs("div", { className: `flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm ${className}`, children: [
    tools && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-center gap-1.5", children: tools }),
    /* @__PURE__ */ jsx(
      "textarea",
      {
        id,
        value,
        rows,
        placeholder,
        disabled: busy,
        onChange: (e) => onChange(e.target.value),
        className: "min-h-[84px] w-full resize-y rounded-md border-0 bg-transparent p-0 text-[13.5px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 disabled:opacity-60"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "min-w-0 flex-1 text-xs text-gray-500", children: footer }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: onSend,
          disabled: busy || disabled,
          "aria-busy": busy,
          className: "inline-flex h-8 flex-shrink-0 items-center rounded-full bg-[var(--sb-accent-bg)] px-4 text-sm font-semibold text-[var(--accent-on)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
          children: busy ? "\u9001\u4FE1\u4E2D\u2026" : label
        }
      )
    ] })
  ] });
}
export {
  ReplyComposer
};
//# sourceMappingURL=ReplyComposer.js.map