"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog.js";
const ConfirmContext = createContext(null);
const DEFAULT_CANCEL_LABEL = "\u3042\u3068\u3067";
const DEFAULT_NOTICE_LABEL = "OK";
function descriptionToLines(description) {
  return (description ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
}
const FIELD_CLASS = "mt-3 block w-full rounded-lg border border-[rgb(var(--line-strong))] bg-[rgb(var(--surface))] px-3 py-2 text-[14px] leading-[22px] text-[rgb(var(--ink))] placeholder:text-[rgb(var(--ink-muted))] focus:border-[var(--sb-accent-bg)] focus:outline-none";
function PromptField({
  options,
  onChange,
  onSubmit
}) {
  const id = useId();
  const [value, setValue] = useState(options.defaultValue ?? "");
  useEffect(() => {
    onChange(options.defaultValue ?? "");
  }, []);
  const set = (next) => {
    setValue(next);
    onChange(next);
  };
  const common = {
    id,
    value,
    placeholder: options.placeholder,
    "data-autofocus": true,
    className: FIELD_CLASS
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    options.label && /* @__PURE__ */ jsx("label", { htmlFor: id, className: "mt-3 block text-[12px] leading-[18px] font-medium text-[rgb(var(--ink))]", children: options.label }),
    options.multiline ? /* @__PURE__ */ jsx(
      "textarea",
      {
        ...common,
        rows: 4,
        onChange: (e) => set(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing) {
            e.preventDefault();
            onSubmit();
          }
        }
      }
    ) : /* @__PURE__ */ jsx(
      "input",
      {
        ...common,
        type: "text",
        onChange: (e) => set(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault();
            onSubmit();
          }
        }
      }
    )
  ] });
}
function ConfirmProvider({ children, panelClassName }) {
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
    notice: (options) => new Promise((resolve) => enqueue((id) => ({ id, kind: "notice", options, resolve }))),
    prompt: (options) => new Promise((resolve) => enqueue((id) => ({ id, kind: "prompt", options, resolve })))
  }), [enqueue]);
  const promptValue = useRef("");
  const [promptText, setPromptText] = useState("");
  const onPromptChange = useCallback((value) => {
    promptValue.current = value;
    setPromptText(value);
  }, []);
  const current = queue[0];
  const settle = useCallback((id, value) => {
    const head = queueRef.current[0];
    if (!head || head.id !== id) return;
    update(queueRef.current.slice(1));
    if (head.kind === "confirm") head.resolve(value);
    else if (head.kind === "prompt") head.resolve(value ? promptValue.current : null);
    else head.resolve();
  }, [update]);
  useEffect(() => () => {
    const rest = queueRef.current;
    queueRef.current = [];
    for (const item of rest) {
      if (item.kind === "confirm") item.resolve(false);
      else if (item.kind === "prompt") item.resolve(null);
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
        confirmLabel: current.kind === "notice" ? current.options.closeLabel ?? DEFAULT_NOTICE_LABEL : current.options.confirmLabel,
        cancelLabel: current.kind === "notice" ? void 0 : current.options.cancelLabel ?? DEFAULT_CANCEL_LABEL,
        hideCancel: current.kind === "notice",
        tone: current.kind !== "prompt" && current.options.tone === "danger" ? "danger" : "primary",
        layer: current.options.layer ?? "over",
        panelClassName: current.options.panelClassName ?? panelClassName,
        confirmDisabled: current.kind === "prompt" && !!current.options.required && promptText.trim() === "",
        onConfirm: () => settle(current.id, true),
        onClose: () => settle(current.id, false),
        children: current.kind === "prompt" && /* @__PURE__ */ jsx(
          PromptField,
          {
            options: current.options,
            onChange: onPromptChange,
            onSubmit: () => {
              if (current.options.required && promptValue.current.trim() === "") return;
              settle(current.id, true);
            }
          }
        )
      },
      current.id
    )
  ] });
}
function useApi() {
  const api = useContext(ConfirmContext);
  if (!api) throw new Error("useConfirm / useNotice / usePrompt \u306F <ConfirmProvider> \u306E\u4E2D\u3067\u4F7F\u3063\u3066\u304F\u3060\u3055\u3044");
  return api;
}
function useConfirm() {
  return useApi().confirm;
}
function useNotice() {
  return useApi().notice;
}
function usePrompt() {
  return useApi().prompt;
}
export {
  ConfirmProvider,
  DEFAULT_CANCEL_LABEL,
  DEFAULT_NOTICE_LABEL,
  descriptionToLines,
  useConfirm,
  useNotice,
  usePrompt
};
//# sourceMappingURL=ConfirmProvider.js.map