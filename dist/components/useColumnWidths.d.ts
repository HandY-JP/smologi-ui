import { type ColumnWidthSpec } from '../lib/column-widths';
export interface UseColumnWidthsResult {
    /** 実際に使う幅(px)。null＝伸縮列（固定幅なし）。 */
    widths: Record<string, number | null>;
    widthOf: (key: string) => number | null;
    setWidth: (key: string, px: number) => void;
    /** その列だけ既定へ戻す。 */
    resetColumn: (key: string) => void;
    /** 全列を既定へ戻す。 */
    resetAll: () => void;
    /** 既定と違う幅が 1 列でもあるか。 */
    isCustomized: boolean;
}
/**
 * 列幅の状態＋端末ごとの保存（localStorage）。
 * - 保存するのは既定から変えた列だけ。保存時の通知（トースト等）は出さない。
 * - SSR 安全: 描画中は window に触らず、マウント後の effect で読み込む（初回は既定幅）。
 * - localStorage の読み書きはすべて try/catch（プライベートモード等で失敗しても動く）。
 */
export declare function useColumnWidths(storageKey: string, specs: readonly ColumnWidthSpec[]): UseColumnWidthsResult;
//# sourceMappingURL=useColumnWidths.d.ts.map