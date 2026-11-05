"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { matchesSettingsSearch, useSettingsSearchQuery } from "../lib/settings-search-store.js";
const SettingsMatchCtx = createContext(null);
function SettingsPage({
  children,
  className = "",
  layout = "default"
}) {
  const query = useSettingsSearchQuery();
  const [matched, setMatched] = useState({});
  const report = useCallback((id, isMatch) => {
    setMatched((prev) => prev[id] === isMatch ? prev : { ...prev, [id]: isMatch });
  }, []);
  const hasMatch = Object.values(matched).some(Boolean);
  const trimmed = query.trim();
  return /* @__PURE__ */ jsx(SettingsMatchCtx.Provider, { value: report, children: /* @__PURE__ */ jsxs("div", { className: `admin-page-tight-top ${layout === "wide" ? "w-full min-w-0" : "max-w-4xl"} ${className}`, children: [
    children,
    trimmed && !hasMatch && /* @__PURE__ */ jsxs("p", { className: "py-10 text-[14px] leading-[22px] text-[rgb(var(--ink-muted))]", children: [
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
  id,
  layout = "default"
}) {
  const wide = layout === "wide";
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
      className: `border-t border-[rgb(var(--line))] first:border-t-0 first:pt-2 ${wide ? "min-w-0 py-7" : "py-6"}`,
      "aria-label": title,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx("h2", { className: `text-[15px] font-semibold text-[rgb(var(--ink))] ${wide ? "leading-6" : "leading-[22px]"}`, children: title }),
            description && /* @__PURE__ */ jsx("p", { className: wide ? "mt-1 max-w-[68ch] text-[13px] leading-6 text-[rgb(var(--ink-muted))]" : "mt-1 text-[12px] leading-5 text-[rgb(var(--ink-muted))]", children: description })
          ] }),
          action && /* @__PURE__ */ jsx("div", { className: "flex shrink-0 items-center gap-2", children: action })
        ] }),
        /* @__PURE__ */ jsx("div", { className: wide ? "mt-5 min-w-0 space-y-5" : "mt-4 space-y-4", children })
      ]
    }
  );
}
function SettingsSubheading({
  children,
  hint
}) {
  return /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-[13px] leading-[20px] font-semibold text-[rgb(var(--ink))]", children }),
    hint && /* @__PURE__ */ jsx("p", { className: "mt-0.5 max-w-[68ch] text-[12px] leading-5 text-[rgb(var(--ink-muted))]", children: hint })
  ] });
}
function SettingsEmpty({ children }) {
  return /* @__PURE__ */ jsx("p", { className: "py-6 text-center text-[14px] leading-[22px] text-[rgb(var(--ink-muted))]", children });
}
function SettingsReadOnlyNotice({ children }) {
  return /* @__PURE__ */ jsx("p", { className: "mb-4 rounded-md border border-[rgb(var(--warning-ink)/0.25)] bg-[rgb(var(--warning-soft))] px-3 py-2 text-[14px] leading-[22px] text-[rgb(var(--warning-ink))]", children: children ?? "\u95B2\u89A7\u306E\u307F\u306E\u6A29\u9650\u3067\u3059\u3002\u5185\u5BB9\u306E\u5909\u66F4\u306F\u3067\u304D\u307E\u305B\u3093\u3002" });
}
function SettingsDisclosure({
  kind = "advanced",
  title,
  hint,
  defaultOpen = false,
  children
}) {
  const query = useSettingsSearchQuery();
  const [open, setOpen] = useState(defaultOpen);
  const forcedOpen = query.trim().length > 0;
  const label = title ?? (kind === "setup" ? "\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7\u306E\u5185\u5BB9\u3092\u898B\u76F4\u3059" : "\u8A73\u7D30\u8A2D\u5B9A");
  const isOpen = open || forcedOpen;
  return /* @__PURE__ */ jsxs("div", { className: "min-w-0 rounded-md border border-[rgb(var(--line))]", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setOpen((v) => !v),
        "aria-expanded": isOpen,
        className: "flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] leading-[22px] font-medium text-[rgb(var(--ink))] hover:bg-[rgb(var(--surface-subtle))]",
        children: [
          /* @__PURE__ */ jsx(
            "svg",
            {
              className: `h-3.5 w-3.5 shrink-0 text-[rgb(var(--ink-muted))] transition-transform ${isOpen ? "rotate-90" : ""}`,
              fill: "none",
              stroke: "currentColor",
              strokeWidth: 2,
              viewBox: "0 0 24 24",
              "aria-hidden": true,
              children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 5l7 7-7 7" })
            }
          ),
          /* @__PURE__ */ jsx("span", { children: label }),
          hint && /* @__PURE__ */ jsx("span", { className: "text-[12px] leading-[18px] font-normal text-[rgb(var(--ink-muted))]", children: hint })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsx("div", { className: "min-w-0 space-y-5 border-t border-[rgb(var(--line))] px-3 py-4", children })
  ] });
}
export {
  SettingsDisclosure,
  SettingsEmpty,
  SettingsPage,
  SettingsReadOnlyNotice,
  SettingsSection,
  SettingsSubheading
};
//# sourceMappingURL=SettingsSection.js.map