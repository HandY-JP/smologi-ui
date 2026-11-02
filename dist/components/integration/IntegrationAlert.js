"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { SETTINGS_GHOST_BUTTON_CLASS } from "../SettingsRow.js";
function IntegrationAlert({
  tone = "bad",
  children,
  actionLabel,
  onAction,
  actionBusy = false
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      role: tone === "bad" ? "alert" : "status",
      className: `sb-int sb-int-alert sb-int-alert--${tone} mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] px-3.5 py-2.5 text-[13px]`,
      children: [
        /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1", children }),
        actionLabel && onAction && /* @__PURE__ */ jsx("button", { type: "button", onClick: onAction, disabled: actionBusy, className: `${SETTINGS_GHOST_BUTTON_CLASS} !h-7 !px-2.5 !text-xs`, children: actionLabel })
      ]
    }
  );
}
export {
  IntegrationAlert
};
//# sourceMappingURL=IntegrationAlert.js.map