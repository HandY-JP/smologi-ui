"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Children, cloneElement, isValidElement } from "react";
import { LIST_PAGE_SIZE_OPTIONS } from "../lib/list-page-size.js";
const PAGER_BUTTON = "h-8 rounded-full px-3 text-[12.5px] text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100";
const PAGER_BUTTON_COMPACT = "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[14px] text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100";
function computePaginationView(total, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);
  return { totalPages, safePage, start, end };
}
function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  // 既定は一覧共通の選択肢（list-page-size.ts）。ここに数値を直書きすると ListFooter 経由の
  // 一覧とズレるので、独自の選択肢が要る画面（仕入先ポータル）だけが props で渡すこと。
  pageSizeOptions = LIST_PAGE_SIZE_OPTIONS,
  className = "",
  unitLabel = "\u4EF6",
  compact = false
}) {
  const { totalPages, safePage, start, end } = computePaginationView(total, page, pageSize);
  if (compact) {
    return /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-1 text-sm ${className}`, children: [
      /* @__PURE__ */ jsxs("span", { className: "whitespace-nowrap px-0.5 text-[12px] tabular-nums text-gray-500", children: [
        total.toLocaleString("ja-JP"),
        unitLabel
      ] }),
      /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "mx-0.5 h-4 w-px bg-gray-200/70" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onPageChange(safePage - 1),
          disabled: safePage <= 1,
          "aria-label": "\u524D\u306E\u30DA\u30FC\u30B8",
          className: PAGER_BUTTON_COMPACT,
          children: "\u2039"
        }
      ),
      /* @__PURE__ */ jsxs("span", { className: "px-0.5 font-semibold tabular-nums text-gray-800", children: [
        safePage,
        " / ",
        totalPages
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onPageChange(safePage + 1),
          disabled: safePage >= totalPages,
          "aria-label": "\u6B21\u306E\u30DA\u30FC\u30B8",
          className: PAGER_BUTTON_COMPACT,
          children: "\u203A"
        }
      ),
      onPageSizeChange && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "mx-1 h-4 w-px bg-gray-200/70" }),
        /* @__PURE__ */ jsxs("div", { className: "relative flex items-center", children: [
          /* @__PURE__ */ jsx(
            "select",
            {
              value: pageSize,
              onChange: (e) => onPageSizeChange(Number(e.target.value)),
              "aria-label": "1\u30DA\u30FC\u30B8\u306E\u4EF6\u6570",
              title: "\u8868\u793A\u4EF6\u6570\uFF08\u6B21\u306B\u958B\u3044\u305F\u3068\u304D\u3082\u540C\u3058\u4EF6\u6570\u3067\u8868\u793A\u3057\u307E\u3059\uFF09",
              className: "appearance-none rounded-full bg-transparent py-1 pl-1 pr-3.5 text-[12.5px] text-gray-700 focus:outline-none",
              children: pageSizeOptions.map((opt) => /* @__PURE__ */ jsxs("option", { value: opt, children: [
                opt,
                unitLabel
              ] }, opt))
            }
          ),
          /* @__PURE__ */ jsx("span", { "aria-hidden": "true", className: "pointer-events-none absolute right-0 text-[9px] text-gray-400", children: "\u23F7" })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: `flex flex-wrap items-center gap-2 text-sm ${className}`, children: [
    /* @__PURE__ */ jsx("div", { className: "whitespace-nowrap text-[12px] text-gray-600", children: total === 0 ? `0${unitLabel}` : `${total}${unitLabel}\u4E2D ${start}-${end}${unitLabel}\u3092\u8868\u793A` }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-end gap-1", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onPageChange(1), disabled: safePage <= 1, className: PAGER_BUTTON, children: "\u6700\u521D\u3078" }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onPageChange(safePage - 1), disabled: safePage <= 1, className: PAGER_BUTTON, children: "\u524D\u3078" }),
      /* @__PURE__ */ jsxs("span", { className: "px-1 font-semibold tabular-nums text-gray-800", children: [
        safePage,
        " / ",
        totalPages
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onPageChange(safePage + 1),
          disabled: safePage >= totalPages,
          className: PAGER_BUTTON,
          children: "\u6B21\u3078"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => onPageChange(totalPages),
          disabled: safePage >= totalPages,
          className: PAGER_BUTTON,
          children: "\u6700\u5F8C\u3078"
        }
      ),
      onPageSizeChange && /* @__PURE__ */ jsx(
        "select",
        {
          value: pageSize,
          onChange: (e) => onPageSizeChange(Number(e.target.value)),
          "aria-label": "\u8868\u793A\u4EF6\u6570",
          title: "\u8868\u793A\u4EF6\u6570\uFF08\u6B21\u306B\u958B\u3044\u305F\u3068\u304D\u3082\u540C\u3058\u4EF6\u6570\u3067\u8868\u793A\u3057\u307E\u3059\uFF09",
          className: "ml-1 h-8 rounded-full border border-gray-200/80 bg-white/70 px-2 text-[12.5px] text-gray-700",
          children: pageSizeOptions.map((opt) => /* @__PURE__ */ jsxs("option", { value: opt, children: [
            opt,
            "/\u30DA\u30FC\u30B8"
          ] }, opt))
        }
      )
    ] })
  ] });
}
function StickyPagerBar({
  tone = "default",
  className,
  title,
  children
}) {
  const compactChildren = Children.map(children, (child) => isValidElement(child) ? cloneElement(child, { compact: true }) : child);
  return /* @__PURE__ */ jsx("div", { className: `pointer-events-none sticky bottom-3 z-[26] flex justify-end ${className ?? ""}`, children: /* @__PURE__ */ jsx(
    "div",
    {
      title,
      "data-tone": tone,
      className: "app-sticky-glass pointer-events-auto flex w-fit max-w-full items-center gap-2 rounded-full border px-3 py-1.5 shadow-[0_6px_18px_rgba(15,23,42,0.10)] backdrop-blur-[10px] backdrop-saturate-150",
      children: compactChildren
    }
  ) });
}
export {
  Pagination,
  StickyPagerBar,
  computePaginationView
};
//# sourceMappingURL=Pagination.js.map