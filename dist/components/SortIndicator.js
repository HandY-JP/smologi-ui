"use client";
import { jsx } from "react/jsx-runtime";
function SortIndicator({ active, dir }) {
  return /* @__PURE__ */ jsx("span", { className: `text-[10px] leading-none ${active ? "text-[var(--sb-accent-bg)]" : "text-gray-300"}`, "aria-hidden": true, children: active ? dir === "asc" ? "\u25B2" : "\u25BC" : "\u2195" });
}
export {
  SortIndicator
};
//# sourceMappingURL=SortIndicator.js.map