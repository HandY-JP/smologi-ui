import type { LayoutItem, WidgetDef, WidgetSize } from './types';
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
export declare function WidgetGrid({ items, getDef, editing, renderWidget, onReorder, onRemove, onCycleSize, onAdd, onEscape, classNames, emptyContent, }: WidgetGridProps): import("react").JSX.Element;
//# sourceMappingURL=WidgetGrid.d.ts.map