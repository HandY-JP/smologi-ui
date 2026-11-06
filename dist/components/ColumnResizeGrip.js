"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { clampColumnWidth, COLUMN_WIDTH_DEFAULT_MIN } from "../lib/column-widths.js";
const KEY_STEP_PX = 16;
const BODY_CLASS = "sb-col-resizing";
function ColumnResizeGrip({ width, minWidth = COLUMN_WIDTH_DEFAULT_MIN, onResize, onReset, label, onDragStart }) {
  const ref = useRef(null);
  const drag = useRef(null);
  const [tip, setTip] = useState(null);
  const stop = useCallback(() => {
    drag.current = null;
    setTip(null);
    document.body.classList.remove(BODY_CLASS);
  }, []);
  useEffect(() => () => document.body.classList.remove(BODY_CLASS), []);
  const measure = () => {
    const actual = ref.current?.parentElement?.getBoundingClientRect().width;
    return (onDragStart ? actual ?? width : width ?? actual) ?? minWidth;
  };
  const onPointerDown = (e) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    onDragStart?.();
    drag.current = { startX: e.clientX, startW: measure() };
    document.body.classList.add(BODY_CLASS);
    setTip({ x: e.clientX, y: e.clientY, w: Math.round(drag.current.startW) });
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const next = clampColumnWidth(d.startW + (e.clientX - d.startX), minWidth);
    onResize(next);
    setTip({ x: e.clientX, y: e.clientY, w: next });
  };
  const onPointerUp = (e) => {
    e.stopPropagation();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    stop();
  };
  const onKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    e.stopPropagation();
    onDragStart?.();
    onResize(clampColumnWidth(measure() + (e.key === "ArrowRight" ? KEY_STEP_PX : -KEY_STEP_PX), minWidth));
  };
  const swallow = (e) => e.stopPropagation();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "span",
      {
        ref,
        className: "sb-col-grip",
        "data-dragging": tip ? "true" : void 0,
        role: "separator",
        "aria-orientation": "vertical",
        "aria-label": `${label}\u306E\u5217\u5E45\uFF08\u30C9\u30E9\u30C3\u30B0\u3067\u5909\u66F4\u3001\u30C0\u30D6\u30EB\u30AF\u30EA\u30C3\u30AF\u3067\u5143\u306B\u623B\u3059\uFF09`,
        "aria-valuenow": width ?? void 0,
        "aria-valuemin": minWidth,
        tabIndex: 0,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel: stop,
        onClick: swallow,
        onDoubleClick: (e) => {
          e.stopPropagation();
          onReset();
        },
        onKeyDown
      }
    ),
    tip && typeof document !== "undefined" && createPortal(
      /* @__PURE__ */ jsxs("div", { className: "sb-col-grip-tip", style: { left: tip.x + 14, top: tip.y + 18 }, role: "status", children: [
        tip.w,
        "px"
      ] }),
      document.body
    )
  ] });
}
var ColumnResizeGrip_default = ColumnResizeGrip;
export {
  ColumnResizeGrip,
  ColumnResizeGrip_default as default
};
//# sourceMappingURL=ColumnResizeGrip.js.map