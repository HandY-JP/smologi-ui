"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { matchesSettingsSearch, useSettingsSearchQuery } from "../lib/settings-search-store.js";
const SettingsMatchCtx = createContext(null);
function SettingsPage({
  children,
  className = ""
}) {
  const query = useSettingsSearchQuery();
  const [matched, setMatched] = useState({});
  const report = useCallback((id, isMatch) => {
    setMatched((prev) => prev[id] === isMatch ? prev : { ...prev, [id]: isMatch });
  }, []);
  const hasMatch = Object.values(matched).some(Boolean);
  const trimmed = query.trim();
  return /* @__PURE__ */ jsx(SettingsMatchCtx.Provider, { value: report, children: /* @__PURE__ */ jsxs("div", { className: `admin-page-tight-top max-w-4xl ${className}`, children: [
    children,
    trimmed && !hasMatch && /* @__PURE__ */ jsxs("p", { className: "py-10 text-sm text-gray-500", children: [
      "\u3053\u306E\u533A\u5206\u306B\u300C",
      trimmed,
      "\u300D\u306B\u5F53\u305F\u308B\u8A2D\u5B9A\u306F\u3042\u308A\u307E\u305B\u3093\u3002\u5DE6\u306E\u30E1\u30CB\u30E5\u30FC\u3067\u5225\u306E\u533A\u5206\u3092\u9078\u3093\u3067\u304F\u3060\u3055\u3044\u3002"
    ] })
  ] }) });
}
function SettingsSection({
  title,
  description,
  /** 区画見出しの右に置く小さな操作（「追加」など）。主操作は道具バーへ。 */
  action,
  /** 検索の対象にする語（見出し・説明のほかに拾わせたいもの）。 */
  searchText,
  children,
  id
}) {
  const query = useSettingsSearchQuery();
  const descriptionText = typeof description === "string" ? description : void 0;
  const isMatch = matchesSettingsSearch(query, title, descriptionText, ...searchText ?? []);
  const report = useContext(SettingsMatchCtx);
  useEffect(() => {
    report?.(title, isMatch);
    return () => report?.(title, false);
  }, [report, title, isMatch]);
  if (!isMatch) return null;
  return /* @__PURE__ */ jsxs(
    "section",
    {
      id,
      className: "border-t border-gray-100 py-6 first:border-t-0 first:pt-2",
      "aria-label": title,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-[15px] font-bold text-gray-900", children: title }),
            description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs leading-5 text-gray-500", children: description })
          ] }),
          action && /* @__PURE__ */ jsx("div", { className: "flex shrink-0 items-center gap-2", children: action })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-4", children })
      ]
    }
  );
}
function SettingsEmpty({ children }) {
  return /* @__PURE__ */ jsx("p", { className: "py-6 text-center text-sm text-gray-400", children });
}
function SettingsReadOnlyNotice({ children }) {
  return /* @__PURE__ */ jsx("p", { className: "mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800", children: children ?? "\u95B2\u89A7\u306E\u307F\u306E\u6A29\u9650\u3067\u3059\u3002\u5185\u5BB9\u306E\u5909\u66F4\u306F\u3067\u304D\u307E\u305B\u3093\u3002" });
}
export {
  SettingsEmpty,
  SettingsPage,
  SettingsReadOnlyNotice,
  SettingsSection
};
//# sourceMappingURL=SettingsSection.js.map