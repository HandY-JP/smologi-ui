import { type ModalLayer } from './Modal';
export type ConfirmTone = 'danger' | 'primary';
export declare function ConfirmDialog({ open, title, lines, confirmLabel, cancelLabel, tone, busy, layer, closeOnBackdrop, overlayClassName, panelClassName, onConfirm, onClose, }: {
    open: boolean;
    title: string;
    /** 本文。1行1段落で出す */
    lines?: string[];
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: ConfirmTone;
    busy?: boolean;
    /** ドロワー・パネルの上に重ねるときは 'over'。 */
    layer?: ModalLayer;
    /**
     * 背景クリックで閉じるか。省略時は Modal の既定（busy でなければ閉じる）。
     * 削除などの破壊的確認で誤爆を避けたいときは false を渡す（Escape とキャンセルは残る）。
     */
    closeOnBackdrop?: boolean;
    overlayClassName?: string;
    panelClassName?: string;
    onConfirm: () => void;
    onClose: () => void;
}): import("react").JSX.Element;
//# sourceMappingURL=ConfirmDialog.d.ts.map