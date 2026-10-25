"use client";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useDndContext,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { GRID_CLASS, SIZE_LABEL, sizeClassFor } from "./sizes.js";
const REMEASURE_MS = 80;
const STOP_DRAG = {
  onPointerDown: (e) => e.stopPropagation(),
  onMouseDown: (e) => e.stopPropagation(),
  onTouchStart: (e) => e.stopPropagation()
};
const DEFAULT_CLASSES = {
  frame: "rounded-[18px] border",
  editing: "outline-1 outline-dashed",
  minus: "bg-black/70 text-white",
  sizeButton: "bg-black/10",
  addTile: "border-2 border-dashed rounded-[18px]",
  ghost: "rounded-[18px] border bg-black/10 backdrop-blur"
};
function Tile({
  item,
  def,
  index,
  editing,
  classes,
  node,
  onRemove,
  onCycleSize
}) {
  const { id, size } = item;
  const { attributes, listeners, setNodeRef: setDragRef, setActivatorNodeRef, isDragging } = useDraggable({ id, disabled: !editing });
  const { setNodeRef: setDropRef } = useDroppable({ id, disabled: !editing });
  const setRefs = useCallback((el) => {
    setDragRef(el);
    setActivatorNodeRef(el);
    setDropRef(el);
  }, [setDragRef, setActivatorNodeRef, setDropRef]);
  const dndProps = editing ? { ...attributes, ...listeners, "aria-label": `${def.title}\u3092\u79FB\u52D5\uFF08\u30C9\u30E9\u30C3\u30B0\u3067\u4E26\u3079\u66FF\u3048\uFF09` } : {};
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: setRefs,
      "data-widget-id": id,
      "data-widget-size": size,
      style: {
        touchAction: editing ? "manipulation" : void 0,
        animationDelay: editing && index % 2 === 1 ? "-0.16s" : void 0
      },
      className: [
        "relative min-w-0",
        sizeClassFor(size, def.rows),
        classes.frame,
        editing ? `cursor-grab select-none motion-safe:animate-dash-jiggle motion-reduce:outline ${classes.editing} [&_[data-widget-header]]:pl-3 [&_[data-widget-header]]:pr-24 [&_[data-widget-right]]:hidden` : "",
        isDragging ? "opacity-35 !animate-none" : ""
      ].join(" "),
      ...dndProps,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            inert: editing,
            className: `h-full overflow-hidden rounded-[inherit] ${editing ? "pointer-events-none" : ""}`,
            children: node
          }
        ),
        editing && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              "aria-label": `${def.title}\u3092\u5916\u3059`,
              ...STOP_DRAG,
              onClick: () => onRemove(id),
              className: `absolute -left-2 -top-2 z-20 grid h-[26px] w-[26px] cursor-pointer place-items-center rounded-full text-lg leading-none shadow-[0_2px_6px_rgba(0,0,0,0.25)] ${classes.minus}`,
              children: "\u2212"
            }
          ),
          def.sizes.length > 1 && /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              "aria-label": `${def.title}\u306E\u30B5\u30A4\u30BA\u3092\u5909\u3048\u308B\uFF08\u73FE\u5728: ${SIZE_LABEL[size]}\uFF09`,
              ...STOP_DRAG,
              onClick: () => onCycleSize(id),
              className: `absolute right-2.5 top-2.5 z-20 inline-flex cursor-pointer items-center rounded-full px-2.5 py-1 text-xs ${classes.sizeButton}`,
              children: [
                "\u30B5\u30A4\u30BA: ",
                SIZE_LABEL[size]
              ]
            }
          )
        ] })
      ]
    }
  );
}
function Remeasure({ ids, stamp }) {
  const { measureDroppableContainers } = useDndContext();
  useEffect(() => {
    if (stamp === 0) return;
    const t = window.setTimeout(() => measureDroppableContainers(ids), REMEASURE_MS);
    return () => window.clearTimeout(t);
  }, [stamp, ids, measureDroppableContainers]);
  return null;
}
function WidgetGrid({
  items,
  getDef,
  editing,
  renderWidget,
  onReorder,
  onRemove,
  onCycleSize,
  onAdd,
  onEscape,
  classNames,
  emptyContent
}) {
  const classes = { ...DEFAULT_CLASSES, ...classNames };
  const busyRef = useRef(false);
  const blockedUntilRef = useRef(0);
  const [activeId, setActiveId] = useState(null);
  const [activeSize, setActiveSize] = useState({ width: 320, height: 160 });
  const [stamp, setStamp] = useState(0);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  );
  useEffect(() => {
    if (!editing || !onEscape) return;
    const onKey = (e) => {
      if (e.key !== "Escape" || e.defaultPrevented || busyRef.current) return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
      onEscape();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [editing, onEscape]);
  const onDragStart = (e) => {
    busyRef.current = true;
    setActiveId(String(e.active.id));
    const r = e.active.rect.current.initial;
    if (r) setActiveSize({ width: r.width, height: r.height });
    blockedUntilRef.current = 0;
  };
  const onDragOver = (e) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    if (performance.now() < blockedUntilRef.current) return;
    onReorder(String(active.id), String(over.id));
    blockedUntilRef.current = performance.now() + REMEASURE_MS + 30;
    setStamp((n) => n + 1);
  };
  const finish = () => {
    busyRef.current = false;
    setActiveId(null);
  };
  const ids = items.map((i) => i.id);
  const activeDef = activeId ? getDef(activeId) : void 0;
  if (items.length === 0 && !editing) return /* @__PURE__ */ jsx(Fragment, { children: emptyContent });
  return /* @__PURE__ */ jsxs(
    DndContext,
    {
      id: "dashboard-kit-dnd",
      sensors,
      collisionDetection: closestCorners,
      autoScroll: true,
      onDragStart,
      onDragOver,
      onDragEnd: finish,
      onDragCancel: finish,
      children: [
        /* @__PURE__ */ jsxs("div", { className: GRID_CLASS, children: [
          items.map((item, index) => {
            const def = getDef(item.id);
            if (!def) return null;
            return /* @__PURE__ */ jsx(
              Tile,
              {
                item,
                def,
                index,
                editing,
                classes,
                node: renderWidget(item.id, item.size),
                onRemove,
                onCycleSize
              },
              item.id
            );
          }),
          editing && /* @__PURE__ */ jsx("button", { type: "button", onClick: onAdd, className: `grid place-items-center text-[15px] min-[821px]:col-span-4 ${classes.addTile}`, children: "\uFF0B \u30A6\u30A3\u30B8\u30A7\u30C3\u30C8\u3092\u8FFD\u52A0" })
        ] }),
        /* @__PURE__ */ jsx(DragOverlay, { dropAnimation: { duration: 200, easing: "cubic-bezier(0.34, 1.4, 0.64, 1)" }, children: activeId && activeDef ? /* @__PURE__ */ jsxs(
          "div",
          {
            className: `cursor-grabbing px-4 pt-3 shadow-[0_24px_48px_rgba(0,0,0,0.28)] ${classes.ghost}`,
            style: { width: activeSize.width, height: Math.min(activeSize.height, 220) },
            children: [
              /* @__PURE__ */ jsx("p", { className: "text-[13px] font-semibold", children: activeDef.title }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-2 opacity-30", children: [
                /* @__PURE__ */ jsx("div", { className: "h-3 w-3/4 rounded bg-current" }),
                /* @__PURE__ */ jsx("div", { className: "h-3 w-1/2 rounded bg-current" }),
                /* @__PURE__ */ jsx("div", { className: "h-3 w-2/3 rounded bg-current" })
              ] })
            ]
          }
        ) : null }),
        /* @__PURE__ */ jsx(Remeasure, { ids, stamp })
      ]
    }
  );
}
export {
  WidgetGrid
};
//# sourceMappingURL=WidgetGrid.js.map