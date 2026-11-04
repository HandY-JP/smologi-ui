"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { TonePill } from "../TonePill.js";
const PILL_TONE = { ok: "ok", warn: "warn", bad: "bad", off: "mute" };
function IntegrationLogo({ meta, size = "lg" }) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      "aria-hidden": true,
      className: `sb-int-logo grid flex-none place-items-center font-semibold ${size === "lg" ? "h-12 w-12 rounded-xl text-[15px] leading-[22px]" : "h-9 w-9 rounded-[9px] text-[12px] leading-[18px]"}`,
      style: { backgroundColor: `var(${meta.accentVar}, rgb(var(--accent, 37 99 235)))` },
      children: meta.logoText
    }
  );
}
function IntegrationHeader({
  meta,
  statusLabel,
  statusTone = "off",
  description,
  actions
}) {
  return /* @__PURE__ */ jsxs("header", { className: "sb-int flex flex-wrap items-start gap-4", children: [
    /* @__PURE__ */ jsx(IntegrationLogo, { meta }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 basis-[220px]", children: [
      /* @__PURE__ */ jsxs("h2", { className: "flex flex-wrap items-center gap-2.5 text-[22px] leading-[30px] font-semibold", children: [
        meta.label,
        statusLabel && /* @__PURE__ */ jsx(TonePill, { tone: PILL_TONE[statusTone], children: statusLabel })
      ] }),
      description && /* @__PURE__ */ jsx("p", { className: "sb-int-muted mt-1 text-[13px] leading-[20px]", children: description })
    ] }),
    actions && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: actions })
  ] });
}
export {
  IntegrationHeader,
  IntegrationLogo
};
//# sourceMappingURL=IntegrationHeader.js.map