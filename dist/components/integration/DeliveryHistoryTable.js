"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { SETTINGS_GHOST_BUTTON_CLASS } from "../SettingsRow.js";
import { TonePill } from "../TonePill.js";
const HEADS = ["\u9001\u3063\u305F\u6642\u523B", "\u6CE8\u6587\u30FB\u7D0D\u54C1\u756A\u53F7", "\u9001\u308A\u72B6\u756A\u53F7", "\u9001\u308A\u5148", "\u7D50\u679C"];
function DeliveryHistoryTable({
  rows,
  failedOnly,
  defaultFailedOnly = false,
  onFailedOnlyChange,
  onResend,
  onResendAll,
  resendingIds = [],
  emptyText = "\u9001\u4FE1\u5C65\u6B74\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002"
}) {
  const [inner, setInner] = useState(defaultFailedOnly);
  const only = failedOnly ?? inner;
  const setOnly = (next) => {
    if (failedOnly === void 0) setInner(next);
    onFailedOnlyChange?.(next);
  };
  const failCount = rows.filter((r) => r.result === "bad").length;
  const shown = only ? rows.filter((r) => r.result === "bad") : rows;
  return /* @__PURE__ */ jsxs("div", { className: "sb-int", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-2.5 flex flex-wrap items-center gap-1.5", children: [
      /* @__PURE__ */ jsx("button", { type: "button", "aria-pressed": !only, className: "sb-int-filter", onClick: () => setOnly(false), children: "\u3059\u3079\u3066" }),
      /* @__PURE__ */ jsxs("button", { type: "button", "aria-pressed": only, className: "sb-int-filter", onClick: () => setOnly(true), children: [
        "\u5931\u6557\u3060\u3051",
        failCount > 0 ? `\uFF08${failCount}\uFF09` : ""
      ] }),
      failCount > 0 && onResendAll && /* @__PURE__ */ jsx("button", { type: "button", onClick: onResendAll, className: `${SETTINGS_GHOST_BUTTON_CLASS} ml-auto !h-7 !px-2.5 !text-xs`, children: "\u5931\u6557\u3092\u307E\u3068\u3081\u3066\u518D\u9001" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "sb-int-table-wrap overflow-x-auto rounded-[10px]", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[620px] border-collapse text-[13px]", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        HEADS.map((h) => /* @__PURE__ */ jsx("th", { scope: "col", className: "sb-int-th px-3 py-2 text-left text-xs font-medium", children: h }, h)),
        /* @__PURE__ */ jsx("th", { className: "sb-int-th w-px px-3 py-2", children: /* @__PURE__ */ jsx("span", { className: "sr-only", children: "\u64CD\u4F5C" }) })
      ] }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        shown.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "sb-int-muted sb-int-td px-3 py-4 text-center", children: emptyText }) }),
        shown.map((r) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("td", { className: "sb-int-td px-3 py-2 align-top tabular-nums", children: r.at }),
          /* @__PURE__ */ jsx("td", { className: "sb-int-td px-3 py-2 align-top tabular-nums", children: r.ref }),
          /* @__PURE__ */ jsx("td", { className: "sb-int-td px-3 py-2 align-top tabular-nums", children: r.trackingNo }),
          /* @__PURE__ */ jsx("td", { className: "sb-int-td px-3 py-2 align-top", children: r.destination }),
          /* @__PURE__ */ jsxs("td", { className: "sb-int-td px-3 py-2 align-top", children: [
            /* @__PURE__ */ jsx(TonePill, { tone: r.result === "ok" ? "ok" : r.result === "bad" ? "bad" : "warn", children: r.resultLabel }),
            r.error && /* @__PURE__ */ jsx("div", { className: "sb-int-bad-text mt-1 text-xs", children: r.error })
          ] }),
          /* @__PURE__ */ jsx("td", { className: "sb-int-td px-3 py-2 align-top", children: r.result === "bad" && onResend && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              disabled: resendingIds.includes(r.id),
              onClick: () => onResend(r.id),
              className: `${SETTINGS_GHOST_BUTTON_CLASS} !h-7 !px-2.5 !text-xs`,
              children: "\u518D\u9001"
            }
          ) })
        ] }, r.id))
      ] })
    ] }) })
  ] });
}
export {
  DeliveryHistoryTable
};
//# sourceMappingURL=DeliveryHistoryTable.js.map