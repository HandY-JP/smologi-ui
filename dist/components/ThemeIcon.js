import { jsx } from "react/jsx-runtime";
function ThemeIcon({ isDark, className = "h-4 w-4" }) {
  return isDark ? (
    // 太陽＝ライトへ戻す
    /* @__PURE__ */ jsx("svg", { className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, "aria-hidden": "true", children: /* @__PURE__ */ jsx(
      "path",
      {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M12 3v1.5m0 15V21m9-9h-1.5m-15 0H3m15.364-6.364l-1.06 1.06M6.696 17.304l-1.06 1.06m12.728 0l-1.06-1.06M6.696 6.696l-1.06-1.06M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      }
    ) })
  ) : (
    // 月＝ダークモードにする
    /* @__PURE__ */ jsx("svg", { className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", strokeWidth: 2, "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" }) })
  );
}
export {
  ThemeIcon
};
//# sourceMappingURL=ThemeIcon.js.map