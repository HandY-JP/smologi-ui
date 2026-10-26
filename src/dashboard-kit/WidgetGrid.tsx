'use client';
// 編集できるウィジェットグリッド（12 列・行の高さ固定・row）。Amazon 等には依存しない。
// - 編集中: タイルは止めたまま、縁を細い光が 1 周する（.dash-edit-glow。reduced-motion では静的な縁だけ）。ドラッグで並べ替え、「−」で外す、サイズボタンで切り替え。
// - 並べ替えは @dnd-kit/core（MouseSensor/TouchSensor/KeyboardSensor。タッチは長押し 200ms 後に掴み、それまではページをスクロールできる）。下書きは呼び出し側（useLayoutEditor）が持つ。
// - タイルの要素型・入れ子は編集の ON/OFF で変えない（中身の状態＝フィードの途中経過などが作り直されて飛ぶのを防ぐ）。
//   編集中は中身を inert + pointer-events-none にするだけ。
import { useCallback, useEffect, useRef, useState } from 'react';
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
  useSensors,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { GRID_CLASS, SIZE_LABEL, sizeClassFor } from './sizes';
import type { LayoutItem, WidgetDef, WidgetSize } from './types';

const REMEASURE_MS = 80;

export interface WidgetGridClassNames {
  /** タイルの枠（ガラス・角丸・影）。 */
  frame: string;
  /** 編集中のタイルに足すクラス（枠線の色など）。 */
  editing?: string;
  /** 「−」ボタン。 */
  minus?: string;
  /** サイズボタン。 */
  sizeButton?: string;
  /** 末尾の破線タイル。 */
  addTile?: string;
  /** ドラッグ中に指に付く代役。 */
  ghost?: string;
}

/** ボタン上の押下をドラッグ開始（Mouse/Touch/Pointer センサー）に渡さない。 */
const STOP_DRAG = {
  onPointerDown: (e: { stopPropagation(): void }) => e.stopPropagation(),
  onMouseDown: (e: { stopPropagation(): void }) => e.stopPropagation(),
  onTouchStart: (e: { stopPropagation(): void }) => e.stopPropagation(),
};

const DEFAULT_CLASSES: Required<WidgetGridClassNames> = {
  frame: 'rounded-[18px] border',
  editing: '',
  minus: 'bg-black/70 text-white',
  sizeButton: 'bg-black/10',
  addTile: 'border-2 border-dashed rounded-[18px]',
  ghost: 'rounded-[18px] border bg-black/10 backdrop-blur',
};

function Tile({
  item,
  def,

  editing,
  classes,
  node,
  onRemove,
  onCycleSize,
}: {
  item: LayoutItem;
  def: WidgetDef;
  editing: boolean;
  classes: Required<WidgetGridClassNames>;
  node: React.ReactNode;
  onRemove: (id: string) => void;
  onCycleSize: (id: string) => void;
}) {
  const { id, size } = item;
  const { attributes, listeners, setNodeRef: setDragRef, setActivatorNodeRef, isDragging } = useDraggable({ id, disabled: !editing });
  const { setNodeRef: setDropRef } = useDroppable({ id, disabled: !editing });
  const setRefs = useCallback((el: HTMLDivElement | null) => {
    setDragRef(el);
    setActivatorNodeRef(el);
    setDropRef(el);
  }, [setDragRef, setActivatorNodeRef, setDropRef]);

  const dndProps = editing
    ? ({ ...attributes, ...listeners, 'aria-label': `${def.title}を移動（ドラッグで並べ替え）` } as Record<string, unknown>)
    : {};

  return (
    <div
      ref={setRefs}
      data-widget-id={id}
      data-widget-size={size}
      style={{
        touchAction: editing ? 'manipulation' : undefined,
      }}
      className={[
        'relative min-w-0',
        sizeClassFor(size, def.rows),
        classes.frame,
        editing
          ? `cursor-grab select-none dash-edit-glow ${classes.editing} [&_[data-widget-header]]:pl-3 [&_[data-widget-header]]:pr-24 [&_[data-widget-right]]:hidden`
          : '',
        isDragging ? 'opacity-35 after:![animation:none]' : '',
      ].join(' ')}
      {...dndProps}
    >
      <div
        // 編集中は中身のリンク・ボタン・期間切替を無効化（遷移させない）。ボタン類はこの外側なので効く。
        inert={editing}
        className={`h-full overflow-hidden rounded-[inherit] ${editing ? 'pointer-events-none' : ''}`}
      >
        {node}
      </div>
      {editing && (
        <>
          <button
            type="button"
            aria-label={`${def.title}を外す`}
            {...STOP_DRAG}
            onClick={() => onRemove(id)}
            className={`absolute -left-2 -top-2 z-20 grid h-[26px] w-[26px] cursor-pointer place-items-center rounded-full text-lg leading-none shadow-[0_2px_6px_rgba(0,0,0,0.25)] ${classes.minus}`}
          >
            −
          </button>
          {def.sizes.length > 1 && (
            <button
              type="button"
              aria-label={`${def.title}のサイズを変える（現在: ${SIZE_LABEL[size]}）`}
              {...STOP_DRAG}
              onClick={() => onCycleSize(id)}
              className={`absolute right-2.5 top-2.5 z-20 inline-flex cursor-pointer items-center rounded-full px-2.5 py-1 text-xs ${classes.sizeButton}`}
            >
              サイズ: {SIZE_LABEL[size]}
            </button>
          )}
        </>
      )}
    </div>
  );
}

/** 並び替えのあと、レイアウトが落ち着いたら当たり判定用の矩形を測り直す。 */
function Remeasure({ ids, stamp }: { ids: string[]; stamp: number }) {
  const { measureDroppableContainers } = useDndContext();
  useEffect(() => {
    if (stamp === 0) return;
    const t = window.setTimeout(() => measureDroppableContainers(ids), REMEASURE_MS);
    return () => window.clearTimeout(t);
  }, [stamp, ids, measureDroppableContainers]);
  return null;
}

export interface WidgetGridProps {
  /** 表示するウィジェットだけ、並び順どおり。 */
  items: LayoutItem[];
  getDef: (id: string) => WidgetDef | undefined;
  editing: boolean;
  renderWidget: (id: string, size: WidgetSize) => React.ReactNode;
  onReorder: (activeId: string, overId: string) => void;
  onRemove: (id: string) => void;
  onCycleSize: (id: string) => void;
  /** 末尾の「＋ ウィジェットを追加」タイル。 */
  onAdd: () => void;
  /** 編集中の Esc（ドラッグ中・ダイアログ表示中は呼ばない）。 */
  onEscape?: () => void;
  classNames?: WidgetGridClassNames;
  emptyContent?: React.ReactNode;
}

export function WidgetGrid({
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
  emptyContent,
}: WidgetGridProps) {
  const classes = { ...DEFAULT_CLASSES, ...classNames } as Required<WidgetGridClassNames>;
  const busyRef = useRef(false);
  const blockedUntilRef = useRef(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSize, setActiveSize] = useState({ width: 320, height: 160 });
  const [stamp, setStamp] = useState(0);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    if (!editing || !onEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || busyRef.current) return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
      onEscape();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [editing, onEscape]);

  const onDragStart = (e: DragStartEvent) => {
    busyRef.current = true;
    setActiveId(String(e.active.id));
    const r = e.active.rect.current.initial;
    if (r) setActiveSize({ width: r.width, height: r.height });
    blockedUntilRef.current = 0;
  };
  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    // 並べ替え直後は矩形が古いので、測り直すまで次の入れ替えをしない（行ったり来たり防止）
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
  const activeDef = activeId ? getDef(activeId) : undefined;

  if (items.length === 0 && !editing) return <>{emptyContent}</>;

  return (
    <DndContext
      id="dashboard-kit-dnd"
      sensors={sensors}
      collisionDetection={closestCorners}
      autoScroll
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={finish}
      onDragCancel={finish}
    >
      <div className={GRID_CLASS}>
        {items.map((item) => {
          const def = getDef(item.id);
          if (!def) return null;
          return (
            <Tile
              key={item.id}
              item={item}
              def={def}
              editing={editing}
              classes={classes}
              node={renderWidget(item.id, item.size)}
              onRemove={onRemove}
              onCycleSize={onCycleSize}
            />
          );
        })}
        {editing && (
          <button type="button" onClick={onAdd} className={`grid place-items-center text-[15px] min-[821px]:col-span-4 ${classes.addTile}`}>
            ＋ ウィジェットを追加
          </button>
        )}
      </div>
      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.34, 1.4, 0.64, 1)' }}>
        {activeId && activeDef ? (
          <div
            className={`cursor-grabbing px-4 pt-3 shadow-[0_24px_48px_rgba(0,0,0,0.28)] ${classes.ghost}`}
            style={{ width: activeSize.width, height: Math.min(activeSize.height, 220) }}
          >
            <p className="text-[13px] font-semibold">{activeDef.title}</p>
            <div className="mt-3 space-y-2 opacity-30">
              <div className="h-3 w-3/4 rounded bg-current" />
              <div className="h-3 w-1/2 rounded bg-current" />
              <div className="h-3 w-2/3 rounded bg-current" />
            </div>
          </div>
        ) : null}
      </DragOverlay>
      <Remeasure ids={ids} stamp={stamp} />
    </DndContext>
  );
}
