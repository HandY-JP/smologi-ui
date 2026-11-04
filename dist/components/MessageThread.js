"use client";
import { jsx, jsxs } from "react/jsx-runtime";
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const toDate = (v) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const dayLabel = (d) => `${d.getFullYear()}\u5E74${d.getMonth() + 1}\u6708${d.getDate()}\u65E5`;
const timeLabel = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
function MessageThread({
  messages,
  className = "",
  empty
}) {
  if (messages.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: `p-6 text-center text-[14px] leading-[22px] text-gray-400 ${className}`, children: empty ?? "\u3084\u308A\u53D6\u308A\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002" });
  }
  let prevDay = "";
  return /* @__PURE__ */ jsx("div", { className: `flex flex-col gap-3.5 ${className}`, children: messages.map((m) => {
    const d = toDate(m.at);
    const key = d ? dayKey(d) : "";
    const showDay = d != null && key !== prevDay;
    if (d) prevDay = key;
    const out = m.direction === "out";
    return /* @__PURE__ */ jsxs("div", { className: "contents", children: [
      showDay && d && /* @__PURE__ */ jsx("div", { className: "self-center text-[11px] leading-[16px] text-gray-400", children: dayLabel(d) }),
      /* @__PURE__ */ jsxs("div", { className: `flex max-w-[86%] flex-col gap-1 md:max-w-[76%] ${out ? "items-end self-end" : "items-start self-start"}`, children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `whitespace-pre-wrap break-words px-3.5 py-2.5 text-[13px] leading-relaxed text-gray-900 ${out ? "rounded-2xl rounded-tr bg-[var(--accent-subtle)]" : "rounded-2xl rounded-tl bg-gray-100"}`,
            children: m.body
          }
        ),
        (m.sender || d) && /* @__PURE__ */ jsxs("span", { className: "text-[11px] leading-[16px] text-gray-400", children: [
          m.sender,
          m.sender && d ? " \u30FB " : "",
          d ? timeLabel(d) : ""
        ] })
      ] })
    ] }, m.id);
  }) });
}
export {
  MessageThread
};
//# sourceMappingURL=MessageThread.js.map