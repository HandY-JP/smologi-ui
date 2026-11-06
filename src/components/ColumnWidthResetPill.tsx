'use client';
// 列幅を既定から変えている間だけ画面下中央に出すガラスのピル（「元に戻す」で全列リセット）。
// 一括操作ピル（BulkActionPill）と同じ置き場（.sb-bulk-layer）に出すので、重なる画面では
// `suppress` を true にして隠す。保存の通知ではない（保存は黙って行う）。

export interface ColumnWidthResetPillProps {
  /** useColumnWidths().isCustomized。 */
  customized: boolean;
  onReset: () => void;
  /** 一括操作ピルが出ている間などに true で隠す。 */
  suppress?: boolean;
  text?: string;
  buttonLabel?: string;
}

export function ColumnWidthResetPill({
  customized, onReset, suppress = false, text = '列幅を変えています', buttonLabel = '元に戻す',
}: ColumnWidthResetPillProps) {
  if (!customized || suppress) return null;
  return (
    <div data-bottom-bar className="sb-bulk-layer">
      <div role="group" aria-label="列幅" className="sb-glass-chip sb-colw-pill">
        <span className="sb-colw-pill-text">{text}</span>
        <button type="button" className="sb-colw-pill-btn" onClick={onReset}>{buttonLabel}</button>
      </div>
    </div>
  );
}

export default ColumnWidthResetPill;
