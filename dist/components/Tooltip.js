"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
function Tooltip({
  content,
  children,
  side = "top",
  className = "",
  wrap = false,
  wrapWidth = "w-56"
}) {
  const [show, setShow] = useState(false);
  const timer = useRef(null);
  function open() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(true), 350);
  }
  function close() {
    if (timer.current) clearTimeout(timer.current);
    setShow(false);
  }
  const sideClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-1",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1",
    right: "left-full top-1/2 -translate-y-1/2 ml-1",
    left: "right-full top-1/2 -translate-y-1/2 mr-1"
  }[side];
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: "relative inline-flex",
      onMouseEnter: open,
      onMouseLeave: close,
      onFocus: open,
      onBlur: close,
      children: [
        children,
        show && /* @__PURE__ */ jsx(
          "span",
          {
            role: "tooltip",
            className: `absolute z-50 px-2 py-1 bg-gray-800 text-white text-[11px] rounded pointer-events-none tooltip-fade ${sideClass} ${wrap ? `${wrapWidth} whitespace-normal leading-relaxed text-left` : "whitespace-nowrap"} ${className}`,
            children: content
          }
        )
      ]
    }
  );
}
function HelpHint({
  text,
  className = "",
  side = "top",
  wrap = true,
  wrapWidth
}) {
  return /* @__PURE__ */ jsx(Tooltip, { content: text, side, wrap, wrapWidth, children: /* @__PURE__ */ jsx(
    "span",
    {
      className: `inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold cursor-help hover:bg-gray-300 transition-colors ${className}`,
      "aria-label": "\u30D8\u30EB\u30D7",
      children: "?"
    }
  ) });
}
export {
  HelpHint
};
//# sourceMappingURL=Tooltip.js.map
