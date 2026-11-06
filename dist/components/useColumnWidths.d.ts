import { type ColumnWidthSpec } from '../lib/column-widths';
export interface UseColumnWidthsResult {
    /** 実際に使う幅(px)。null＝伸縮列（固定幅なし）。 */
    widths: Record<string, number | null>;
    widthOf: (key: string) => number | null;
    setWidth: (key: string, px: number) => void;
    /** 複数列の幅をまとめて設定（各列の最小幅へ丸め、setWidth と同じく保存）。auto レイアウトの表を最初のドラッグで固定化するときに使う。 */
    seedWidths: (widths: Record<string, number>) => void;
    /** その列だけ既定へ戻す。 */
    resetColumn: (key: string) => void;
    /** 全列を既定へ戻す。 */
    resetAll: () => void;
    /** 既定と違う幅が 1 列でもあるか。 */
    isCustomized: boolean;
}
/**
 * 表の最初の見出し行（thead の最初の tr）から、`th[attr]` の実寸(px, 四捨五入)を { 列キー: 幅 } で返す。
 * auto レイアウトの表を「最初のドラッグで固定化」するときの `seedWidths` の入力に使う。table が null なら {}。
 */
export declare function measureColumnWidths(table: HTMLTableElement | null, attr?: string): Record<string, number>;
/**
 * 列幅の状態＋端末ごとの保存（localStorage）。
 * - 保存するのは既定から変えた列だけ。保存時の通知（トースト等）は出さない。
 * - SSR 安全: 描画中は window に触らず、マウント後の effect で読み込む（初回は既定幅）。
 * - localStorage の読み書きはすべて try/catch（プライベートモード等で失敗しても動く）。
 */
export declare function useColumnWidths(storageKey: string, specs: readonly ColumnWidthSpec[]): UseColumnWidthsResult;
//# sourceMappingURL=useColumnWidths.d.ts.map