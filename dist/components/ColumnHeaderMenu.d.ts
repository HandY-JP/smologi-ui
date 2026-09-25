import { type ReactNode } from 'react';
import { type ColumnFilterSpec, type ColumnHeaderMoveSpec, type ColumnHeaderPreset, type ColumnHeaderSortSpec, type ColumnHeaderVariantSpec } from '../lib/column-header';
export interface ColumnHeaderCellProps {
    /** 見出しの文字（Pro バッジなどを足すときは labelExtra を使う）。 */
    label: ReactNode;
    /** 読み上げ・ツールチップに使う素のテキスト。 */
    labelText: string;
    /** 文字のすぐ右に差し込む要素（Pro バッジなど）。 */
    labelExtra?: ReactNode;
    sort?: ColumnHeaderSortSpec;
    /**
     * 並び替えできない列の理由（例: 「画面で計算する値のため並び替えできません」）。
     * sort を渡さない列でこれを渡すと、メニューに押せない「並び替え」と理由を出す。
     */
    sortUnavailableReason?: string;
    presets?: readonly ColumnHeaderPreset[];
    variant?: ColumnHeaderVariantSpec;
    /** 列ごとの絞り込み。1 列に複数置ける（それぞれ label を付ける）。 */
    filters?: readonly ColumnFilterSpec[];
    /** 列を左へ / 右へ。 */
    move?: ColumnHeaderMoveSpec;
    /** 「この列を隠す」。隠せない列（商品名・コードなど固定列）では渡さない。 */
    onHide?: () => void;
    /** 「表示設定…」（列の ON/OFF・並び順の一括編集）。 */
    onOpenDisplaySettings?: () => void;
    align?: 'left' | 'center' | 'right';
    /** 見出しセルのツールチップ（列の説明）。 */
    title?: string;
}
export declare function ColumnHeaderCell({ label, labelText, labelExtra, sort, sortUnavailableReason, presets, variant, filters, move, onHide, onOpenDisplaySettings, align, title, }: ColumnHeaderCellProps): import("react").JSX.Element;
//# sourceMappingURL=ColumnHeaderMenu.d.ts.map