"use client";
import { jsx } from "react/jsx-runtime";
import { Modal } from "./Modal.js";
function LargeModal({
  open,
  onClose,
  title,
  subtitle,
  headerRight,
  size = "default",
  layer = "base",
  dismissable = true,
  closeOnBackdrop = false,
  dirty = false,
  showCloseButton,
  compactHeader,
  footer,
  bodyClassName = "p-0",
  children
}) {
  if (!open) return null;
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open,
      onClose,
      title,
      subtitle,
      headerRight,
      layer,
      dismissable,
      closeOnBackdrop,
      dirty,
      showCloseButton,
      compactHeader,
      size: "4xl",
      panelClassName: `${size === "wide" ? "!max-w-[min(1280px,94vw)]" : "!max-w-[min(1100px,92vw)]"} h-[min(820px,90vh)] !rounded-2xl`,
      panelMaxHeightClassName: "!max-h-[min(820px,90vh)]",
      overlayClassName: "!bg-[rgba(15,23,42,0.35)] backdrop-blur-[4px]",
      bodyClassName,
      footer,
      children
    }
  );
}
export {
  LargeModal
};
//# sourceMappingURL=LargeModal.js.map