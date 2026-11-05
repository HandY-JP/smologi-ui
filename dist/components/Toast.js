"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useRef } from "react";
import { SEMANTIC } from "../lib/theme.js";
import { useBottomBarHeightVar } from "../lib/use-bottom-bar-height-var.js";
const TOAST_DEFAULT_DURATION_MS = 3e3;
const TOAST_ACTION_DURATION_MS = 1e4;
function resolveOptions(options, defaults) {
  if (typeof options === "number") return { durationMs: options, passThrough: false };
  if (options && typeof options === "object") {
    return {
      durationMs: options.durationMs ?? (options.action ? defaults.actionMs : defaults.defaultMs),
      action: options.action,
      passThrough: !options.action && !!options.passThrough
    };
  }
  return { durationMs: defaults.defaultMs, passThrough: false };
}
const ToastContext = createContext(null);
function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      show: (m) => console.warn("[Toast] no provider:", m),
      showSuccess: (m) => console.warn("[Toast] no provider:", m),
      showError: (m) => console.error("[Toast] no provider:", m),
      showInfo: (m) => console.info("[Toast] no provider:", m),
      showWarning: (m) => console.warn("[Toast] no provider:", m)
    };
  }
  return ctx;
}
const STYLES = {
  success: { bg: SEMANTIC.confirm, icon: "\u2713" },
  error: { bg: SEMANTIC.danger, icon: "\u2715" },
  info: { bg: SEMANTIC.info, icon: "\u2139" },
  warning: { bg: SEMANTIC.warn, icon: "\u26A0" }
};
function ToastProvider({
  children,
  defaultDurationMs = TOAST_DEFAULT_DURATION_MS,
  actionDurationMs = TOAST_ACTION_DURATION_MS
}) {
  const [toasts, setToasts] = useState([]);
  useBottomBarHeightVar();
  const timers = useRef(/* @__PURE__ */ new Map());
  const dismiss = useCallback((id) => {
    const entry = timers.current.get(id);
    if (entry) {
      clearTimeout(entry.timeoutId);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const scheduleDismiss = useCallback((id, ms) => {
    const timeoutId = setTimeout(() => dismiss(id), ms);
    timers.current.set(id, { timeoutId, remainingMs: ms, startedAt: Date.now() });
  }, [dismiss]);
  const pause = useCallback((id) => {
    const entry = timers.current.get(id);
    if (!entry) return;
    clearTimeout(entry.timeoutId);
    const elapsed = Date.now() - entry.startedAt;
    entry.remainingMs = Math.max(0, entry.remainingMs - elapsed);
  }, []);
  const resume = useCallback((id) => {
    const entry = timers.current.get(id);
    if (!entry) return;
    entry.startedAt = Date.now();
    entry.timeoutId = setTimeout(() => dismiss(id), entry.remainingMs);
  }, [dismiss]);
  const show = useCallback((message, type = "info", options) => {
    const { durationMs, action, passThrough } = resolveOptions(options, { defaultMs: defaultDurationMs, actionMs: actionDurationMs });
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, action, durationMs, passThrough }]);
    scheduleDismiss(id, durationMs);
  }, [scheduleDismiss, defaultDurationMs, actionDurationMs]);
  const api = {
    show,
    showSuccess: (m, o) => show(m, "success", o),
    showError: (m, o) => show(m, "error", o),
    showInfo: (m, o) => show(m, "info", o),
    showWarning: (m, o) => show(m, "warning", o)
  };
  return /* @__PURE__ */ jsxs(ToastContext.Provider, { value: api, children: [
    children,
    /* @__PURE__ */ jsx("div", { className: "fixed bottom-[max(1.5rem,var(--bottom-bar-h,0px))] left-1/2 -translate-x-1/2 z-[100] transition-[bottom] duration-200 motion-reduce:transition-none flex flex-col gap-2 pointer-events-none w-fit", children: toasts.map((t) => /* @__PURE__ */ jsxs(
      "div",
      {
        "data-toast-type": t.type,
        className: `${t.passThrough ? "pointer-events-none" : "pointer-events-auto"} max-w-[min(90vw,36rem)] px-4 py-2.5 rounded-lg shadow-lg text-[14px] leading-[22px] font-medium text-white flex items-start gap-2 toast-enter`,
        style: { backgroundColor: STYLES[t.type].bg },
        onMouseEnter: () => pause(t.id),
        onMouseLeave: () => resume(t.id),
        children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: STYLES[t.type].icon }),
          /* @__PURE__ */ jsx("span", { className: "flex-1", children: t.message }),
          t.action && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                t.action?.onClick();
                dismiss(t.id);
              },
              className: "shrink-0 rounded-md bg-white/20 px-2.5 py-1 text-[14px] leading-[22px] font-semibold hover:bg-white/30 transition-colors",
              children: t.action.label
            }
          )
        ]
      },
      t.id
    )) })
  ] });
}
export {
  TOAST_ACTION_DURATION_MS,
  TOAST_DEFAULT_DURATION_MS,
  ToastProvider,
  resolveOptions,
  useToast
};
//# sourceMappingURL=Toast.js.map