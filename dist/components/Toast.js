"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from "react";
import { SEMANTIC } from "../lib/theme.js";
const DEFAULT_DURATION_MS = 3e3;
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
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((message, type = "info", durationMs = DEFAULT_DURATION_MS) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, durationMs);
  }, []);
  const api = {
    show,
    showSuccess: (m) => show(m, "success"),
    showError: (m) => show(m, "error"),
    showInfo: (m) => show(m, "info"),
    showWarning: (m, durationMs) => show(m, "warning", durationMs)
  };
  return /* @__PURE__ */ jsxs(ToastContext.Provider, { value: api, children: [
    children,
    /* @__PURE__ */ jsx("div", { className: "fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none w-fit", children: toasts.map((t) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "pointer-events-auto max-w-[min(90vw,36rem)] px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium text-white flex items-start gap-2 toast-enter",
        style: { backgroundColor: STYLES[t.type].bg },
        children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: STYLES[t.type].icon }),
          /* @__PURE__ */ jsx("span", { children: t.message })
        ]
      },
      t.id
    )) })
  ] });
}
export {
  ToastProvider,
  useToast
};
//# sourceMappingURL=Toast.js.map