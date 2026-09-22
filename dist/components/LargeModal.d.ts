import type { ReactNode } from 'react';
import { type ModalLayer } from './Modal';
export declare function LargeModal({ open, onClose, title, subtitle, headerRight, layer, dismissable, closeOnBackdrop, footer, bodyClassName, children, }: {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    subtitle?: ReactNode;
    /** ヘッダー右（× の手前）に並べる操作。入荷作成のお客様セレクタなど。 */
    headerRight?: ReactNode;
    layer?: ModalLayer;
    /** フォーム系の作業モーダルなので、既定では Escape/× のみ閉じられる（背景クリックでは閉じない）。 */
    dismissable?: boolean;
    closeOnBackdrop?: boolean;
    footer?: ReactNode;
    bodyClassName?: string;
    children: ReactNode;
}): import("react").JSX.Element | null;
//# sourceMappingURL=LargeModal.d.ts.map