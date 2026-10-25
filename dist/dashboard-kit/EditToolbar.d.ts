export interface EditToolbarProps {
    editing: boolean;
    onEdit: () => void;
    onAdd: () => void;
    onCancel: () => void;
    onDone: () => void;
    /** 通常のピル（編集・＋・やめる）。 */
    pillClassName: string;
    /** 主ボタン（完了）。 */
    primaryClassName: string;
}
export declare function EditToolbar({ editing, onEdit, onAdd, onCancel, onDone, pillClassName, primaryClassName }: EditToolbarProps): import("react").JSX.Element;
//# sourceMappingURL=EditToolbar.d.ts.map