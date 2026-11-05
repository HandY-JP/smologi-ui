"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog.js";
const ConfirmContext = createContext(null);
const DEFAULT_CANCEL_LABEL = "\u3042\u3068\u3067";
const DEFAULT_NOTICE_LABEL = "OK";
function descriptionToLines(description) {
  return (description ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
}
function ConfirmProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const queueRef = useRef([]);
  const nextId = useRef(0);
  const update = useCallback((next) => {
    queueRef.current = next;
    setQueue(next);
  }, []);
  const enqueue = useCallback((make) => {
    nextId.current += 1;
    update([...queueRef.current, make(nextId.current)]);
  }, [update]);
  const api = useMemo(() => ({
    confirm: (options) => new Promise((resolve) => enqueue((id) => ({ id, kind: "confirm", options, resolve }))),
    notice: (options) => new Promise((resolve) => enqueue((id) => ({ id, kind: "notice", options, resolve })))
  }), [enqueue]);
  const current = queue[0];
  const settle = useCallback((id, value) => {
    const head = queueRef.current[0];
    if (!head || head.id !== id) return;
    update(queueRef.current.slice(1));
    if (head.kind === "confirm") head.resolve(value);
    else head.resolve();
  }, [update]);
  useEffect(() => () => {
    const rest = queueRef.current;
    queueRef.current = [];
    for (const item of rest) {
      if (item.kind === "confirm") item.resolve(false);
      else item.resolve();
    }
  }, []);
  return /* @__PURE__ */ jsxs(ConfirmContext.Provider, { value: api, children: [
    children,
    current && /* @__PURE__ */ jsx(
      ConfirmDialog,
      {
        open: true,
        title: current.options.title,
        lines: descriptionToLines(current.options.description),
        confirmLabel: current.kind === "confirm" ? current.options.confirmLabel : current.options.closeLabel ?? DEFAULT_NOTICE_LABEL,
        cancelLabel: current.kind === "confirm" ? current.options.cancelLabel ?? DEFAULT_CANCEL_LABEL : void 0,
        hideCancel: current.kind === "notice",
        tone: current.options.tone === "danger" ? "danger" : "primary",
        layer: current.options.layer ?? "over",
        onConfirm: () => settle(current.id, true),
        onClose: () => settle(current.id, false)
      },
      current.id
    )
  ] });
}
function useApi() {
  const api = useContext(ConfirmContext);
  if (!api) throw new Error("useConfirm / useNotice \u306F <ConfirmProvider> \u306E\u4E2D\u3067\u4F7F\u3063\u3066\u304F\u3060\u3055\u3044");
  return api;
}
function useConfirm() {
  return useApi().confirm;
}
function useNotice() {
  return useApi().notice;
}
export {
  ConfirmProvider,
  DEFAULT_CANCEL_LABEL,
  DEFAULT_NOTICE_LABEL,
  descriptionToLines,
  useConfirm,
  useNotice
};
//# sourceMappingURL=ConfirmProvider.js.map