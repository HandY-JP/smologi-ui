import type { ReactNode } from 'react';
import { type ModalLayer } from './Modal';
export type ConfirmTone = 'danger' | 'primary';
export declare function ConfirmDialog({ open, title, lines, confirmLabel, cancelLabel, tone, busy, layer, closeOnBackdrop, hideCancel, overlayClassName, panelClassName, children, confirmDisabled, onConfirm, onClose, }: {
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
    /** true でキャンセルを出さず、確定ボタン1つのお知らせにする（useNotice 用）。Escape・背景クリックは onClose。 */
    hideCancel?: boolean;
    overlayClassName?: string;
    panelClassName?: string;
    /** 本文の下に置くもの（入力欄など。usePrompt が使う）。あるときは入力欄側が初期フォーカスを持つ（data-autofocus を付けること）。 */
    children?: ReactNode;
    /** 実行ボタンだけを押せなくする（入力が必須で空のとき）。 */
    confirmDisabled?: boolean;
    onConfirm: () => void;
    onClose: () => void;
}): import("react").JSX.Element;
//# sourceMappingURL=ConfirmDialog.d.ts.map