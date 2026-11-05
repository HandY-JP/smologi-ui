"use client";
import { jsx } from "react/jsx-runtime";
const TONE_CLASS = {
  muted: "bg-[rgb(var(--surface-muted))]",
  // 2段目の補助行など、muted より一段薄く見せたいとき
  subtle: "bg-[rgb(var(--surface-subtle))]",
  // 薄い地（surface-subtle）のカードの上に載せる、入力欄などの骨組み
  surface: "bg-[rgb(var(--surface))]",
  // バッジの骨組み
  accent: "bg-[var(--accent-subtle)]"
};
function Skeleton({ className = "", tone = "muted" }) {
  return /* @__PURE__ */ jsx("div", { className: `${TONE_CLASS[tone]} rounded animate-pulse ${className}` });
}
export {
  Skeleton
};
//# sourceMappingURL=Skeleton.js.map