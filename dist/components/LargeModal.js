"use client";
import { jsx } from "react/jsx-runtime";
import { Modal } from "./Modal.js";
function LargeModal({
  open,
  onClose,
  title,
  subtitle,
  headerRight,
  layer = "base",
  dismissable = true,
  closeOnBackdrop = false,
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
      size: "4xl",
      panelClassName: "!max-w-[min(1100px,92vw)] h-[min(820px,90vh)] !rounded-2xl",
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
