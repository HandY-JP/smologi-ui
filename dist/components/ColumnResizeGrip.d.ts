export interface ColumnResizeGripProps {
    /** いまの幅(px)。null（伸縮列）のときはドラッグ開始時に <th> の実寸を測る。 */
    width: number | null;
    minWidth?: number;
    onResize: (px: number) => void;
    /** ダブルクリックで呼ぶ（その列を既定へ）。 */
    onReset: () => void;
    /** 列名（読み上げ用）。例: 「商品名」 */
    label: string;
}
export declare function ColumnResizeGrip({ width, minWidth, onResize, onReset, label }: ColumnResizeGripProps): import("react").JSX.Element;
export default ColumnResizeGrip;
//# sourceMappingURL=ColumnResizeGrip.d.ts.map