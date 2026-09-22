"use client";
import { jsx } from "react/jsx-runtime";
function SidebarNewDot({
  placement = "inline",
  onAccent = false,
  muted = false,
  ringColor,
  label = "\u65B0\u7740\u3042\u308A",
  tone = "red"
}) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      role: label ? "img" : void 0,
      "aria-label": label ?? void 0,
      "aria-hidden": label ? void 0 : true,
      title: label ?? void 0,
      className: `h-2 w-2 rounded-full ${placement === "corner" ? "pointer-events-none absolute right-1 top-1" : "ml-1 inline-block flex-shrink-0"} ${muted ? "opacity-60" : ""} ${onAccent ? "bg-white" : tone === "blue" ? "bg-blue-500" : "bg-red-500"}`,
      style: ringColor ? { boxShadow: `0 0 0 2px ${ringColor}` } : void 0
    }
  );
}
export {
  SidebarNewDot
};
//# sourceMappingURL=SidebarNewDot.js.map
