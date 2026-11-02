"use client";
import { jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
function GroupSelectCheckbox({ checked, indeterminate, onToggle, label }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return /* @__PURE__ */ jsx("span", { className: "mr-2 flex shrink-0 items-center", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(
    "input",
    {
      ref,
      type: "checkbox",
      checked,
      onChange: onToggle,
      "aria-label": label,
      title: label,
      className: "h-4 w-4 cursor-pointer rounded border-gray-300 text-[var(--sb-accent-bg)] focus:ring-[var(--sb-accent-bg)]"
    }
  ) });
}
export {
  GroupSelectCheckbox
};
//# sourceMappingURL=GroupSelectCheckbox.js.map
