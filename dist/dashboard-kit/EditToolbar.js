"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
function EditToolbar({ editing, onEdit, onAdd, onCancel, onDone, pillClassName, primaryClassName }) {
  const doneRef = useRef(null);
  const editRef = useRef(null);
  const wasEditing = useRef(false);
  useEffect(() => {
    if (editing) doneRef.current?.focus();
    else if (wasEditing.current) editRef.current?.focus();
    wasEditing.current = editing;
  }, [editing]);
  if (!editing) {
    return /* @__PURE__ */ jsx("button", { ref: editRef, type: "button", onClick: onEdit, className: pillClassName, children: "\u7DE8\u96C6" });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("button", { type: "button", onClick: onAdd, "aria-label": "\u30A6\u30A3\u30B8\u30A7\u30C3\u30C8\u3092\u8FFD\u52A0", className: pillClassName, children: "\uFF0B" }),
    /* @__PURE__ */ jsx("button", { type: "button", onClick: onCancel, className: pillClassName, children: "\u3084\u3081\u308B" }),
    /* @__PURE__ */ jsx("button", { ref: doneRef, type: "button", onClick: onDone, className: primaryClassName, children: "\u5B8C\u4E86" })
  ] });
}
export {
  EditToolbar
};
//# sourceMappingURL=EditToolbar.js.map