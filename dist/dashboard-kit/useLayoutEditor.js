"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { appendItem, cycleItemSize, draftFor, removeItem, reorderItems } from "./layout.js";
function useLayoutEditor({
  layout,
  defs,
  commit,
  onStart,
  onCancel,
  resetKey
}) {
  const [state, setState] = useState(null);
  const draft = draftFor(state, resetKey);
  const setDraft = useCallback(
    (fn) => setState((s) => {
      const cur = draftFor(s, resetKey);
      const next = fn(cur);
      return next ? { key: resetKey, items: next } : null;
    }),
    [resetKey]
  );
  const editing = draft !== null;
  const staleRef = useRef(false);
  useEffect(() => {
    if (state && state.key !== resetKey) {
      if (!staleRef.current) {
        staleRef.current = true;
        onCancel?.();
      }
      setState(null);
    } else {
      staleRef.current = false;
    }
  }, [state, resetKey, onCancel]);
  const start = useCallback(() => {
    onStart?.();
    setDraft(() => layout);
  }, [layout, onStart, setDraft]);
  const done = useCallback(() => {
    if (draft && draft !== layout) commit(draft);
    else onCancel?.();
    setDraft(() => null);
  }, [draft, layout, commit, onCancel, setDraft]);
  const cancel = useCallback(() => {
    onCancel?.();
    setDraft(() => null);
  }, [onCancel, setDraft]);
  const reorder = useCallback((a, o) => setDraft((d) => d ? reorderItems(d, a, o) : d), [setDraft]);
  const remove = useCallback((id) => setDraft((d) => d ? removeItem(d, id) : d), [setDraft]);
  const cycleSize = useCallback((id) => setDraft((d) => d ? cycleItemSize(d, id, defs) : d), [defs, setDraft]);
  const add = useCallback((id) => setDraft((d) => d ? appendItem(d, id) : d), [setDraft]);
  return { editing, current: draft ?? layout, start, done, cancel, reorder, remove, cycleSize, add };
}
export {
  useLayoutEditor
};
//# sourceMappingURL=useLayoutEditor.js.map