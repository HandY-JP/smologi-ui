'use client';
// 列見出しの右端に置く、列幅をドラッグで変えるつまみ。`position: relative` の <th> の中に置く。
// 見た目は styles/components.css の .sb-col-grip（ホバーで細線、つまみにホバー／ドラッグ中はアクセント色の 2px 線）。
// 並び替えのクリックを起こさないよう pointerdown / click / dblclick は伝播を止める。
// ダブルクリックでその列だけ既定へ戻す。タッチ端末（pointer: coarse）では CSS で隠す。
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { clampColumnWidth, COLUMN_WIDTH_DEFAULT_MIN } from '../lib/column-widths';

const KEY_STEP_PX = 16;
const BODY_CLASS = 'sb-col-resizing';

export interface ColumnResizeGripProps {
  /** いまの幅(px)。null（伸縮列）のときはドラッグ開始時に <th> の実寸を測る。 */
  width: number | null;
  minWidth?: number;
  onResize: (px: number) => void;
  /** ダブルクリックで呼ぶ（その列を既定へ）。 */
  onReset: () => void;
  /** 列名（読み上げ用）。例: 「商品名」 */
  label: string;
  /** ドラッグ（キーボード操作を含む）の開始時、自分の <th> 幅を測る前に同期で呼ぶ。auto レイアウトの表を seedWidths で固定化する用。 */
  onDragStart?: () => void;
}

export function ColumnResizeGrip({ width, minWidth = COLUMN_WIDTH_DEFAULT_MIN, onResize, onReset, label, onDragStart }: ColumnResizeGripProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const drag = useRef<{ startX: number; startW: number } | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; w: number } | null>(null);

  const stop = useCallback(() => {
    drag.current = null;
    setTip(null);
    document.body.classList.remove(BODY_CLASS);
  }, []);
  useEffect(() => () => document.body.classList.remove(BODY_CLASS), []);

  // onDragStart があるとき（auto レイアウトの表）は、既定幅ではなく <th> の実寸を起点にする。
  const measure = () => {
    const actual = ref.current?.parentElement?.getBoundingClientRect().width;
    return (onDragStart ? actual ?? width : width ?? actual) ?? minWidth;
  };

  const onPointerDown = (e: PointerEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    onDragStart?.();
    drag.current = { startX: e.clientX, startW: measure() };
    document.body.classList.add(BODY_CLASS);
    setTip({ x: e.clientX, y: e.clientY, w: Math.round(drag.current.startW) });
  };
  const onPointerMove = (e: PointerEvent<HTMLSpanElement>) => {
    const d = drag.current;
    if (!d) return;
    const next = clampColumnWidth(d.startW + (e.clientX - d.startX), minWidth);
    onResize(next);
    setTip({ x: e.clientX, y: e.clientY, w: next });
  };
  const onPointerUp = (e: PointerEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    stop();
  };
  const onKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    e.stopPropagation();
    onDragStart?.();
    onResize(clampColumnWidth(measure() + (e.key === 'ArrowRight' ? KEY_STEP_PX : -KEY_STEP_PX), minWidth));
  };
  const swallow = (e: { stopPropagation: () => void }) => e.stopPropagation();

  return (
    <>
      <span
        ref={ref}
        className="sb-col-grip"
        data-dragging={tip ? 'true' : undefined}
        role="separator"
        aria-orientation="vertical"
        aria-label={`${label}の列幅（ドラッグで変更、ダブルクリックで元に戻す）`}
        aria-valuenow={width ?? undefined}
        aria-valuemin={minWidth}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={stop}
        onClick={swallow}
        onDoubleClick={(e) => { e.stopPropagation(); onReset(); }}
        onKeyDown={onKeyDown}
      />
      {tip && typeof document !== 'undefined' && createPortal(
        <div className="sb-col-grip-tip" style={{ left: tip.x + 14, top: tip.y + 18 }} role="status">{tip.w}px</div>,
        document.body,
      )}
    </>
  );
}

export default ColumnResizeGrip;
