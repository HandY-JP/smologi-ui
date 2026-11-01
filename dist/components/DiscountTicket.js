"use client";
import { jsx, jsxs } from "react/jsx-runtime";
function DiscountTicket({
  big,
  small,
  muted = false,
  notchColor = "var(--sb-glass-bg-opaque, #ffffff)",
  className = ""
}) {
  const notch = "absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `relative flex h-[52px] w-[92px] flex-shrink-0 flex-col items-center justify-center rounded-[10px] font-bold leading-[1.1] ${muted ? "bg-gray-100 text-gray-400" : "bg-[var(--accent-subtle)] text-[var(--sb-accent-bg)]"} ${className}`,
      children: [
        /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: `${notch} -left-[5px]`, style: { background: notchColor } }),
        /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: `${notch} -right-[5px]`, style: { background: notchColor } }),
        /* @__PURE__ */ jsx("span", { className: "text-[17px]", children: big }),
        small && /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold opacity-85", children: small })
      ]
    }
  );
}
export {
  DiscountTicket
};
//# sourceMappingURL=DiscountTicket.js.map