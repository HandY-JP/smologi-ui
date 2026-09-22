import { type ReactNode, type RefObject } from 'react';
export type ModalLayer = 'base' | 'over';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
/**
 * 外側クリック（mousedown）と Escape で閉じる共通フック。
 * ポップオーバー・ドロップダウンなど、モーダルシェルを使わない要素向け。
 * ref には「内側」とみなす要素を渡す（トリガーボタンも内側にしたい場合は ignore に渡す）。
 */
export declare function useDismiss(ref: RefObject<HTMLElement | null>, onDismiss: () => void, { enabled, ignore }?: {
    enabled?: boolean;
    ignore?: RefObject<HTMLElement | null>;
}): void;
export interface ModalProps {
    open: boolean;
    onClose: () => void;
    /** ヘッダーの見出し。省略するとヘッダー自体を出さない（確認ダイアログなど中身で見出しを作る場合）。 */
    title?: ReactNode;
    /** 見出しの下に添える小さな説明（商品名・仕入先名など）。 */
    subtitle?: ReactNode;
    /**
     * ヘッダーの右（× の手前）へ並べる操作。
     * 作業モーダルで「この作業の対象」を選ばせる小さなセレクタ（入荷作成のお客様など）を、
     * 本文の先頭ではなくヘッダーに置きたいときに使う。title がある場合だけ出る。
     */
    headerRight?: ReactNode;
    /** title を出さないときのアクセシブル名。 */
    ariaLabel?: string;
    /** 重ね順。既定は base（z-[70]）。ドロワーの上に出すものだけ over（z-[90]）。 */
    layer?: ModalLayer;
    size?: ModalSize;
    /** Escape と背景クリックで閉じられるか。フォーム系は false にして誤操作の取りこぼしを防ぐ。 */
    dismissable?: boolean;
    /**
     * 背景クリックで閉じるか。既定は dismissable と同じ。
     * 入力途中の誤爆だけを防ぎたい（Escape と × は残す）フォームモーダル向けに false を渡す。
     */
    closeOnBackdrop?: boolean;
    /**
     * パネルの高さ上限。既定は max-h-[85vh]。
     * 縦の短いノートPCで本文を目一杯使いたいモーダルだけ dvh 指定に差し替える。
     */
    panelMaxHeightClassName?: string;
    /** ヘッダーの × を出すか。既定は dismissable と同じ。 */
    showCloseButton?: boolean;
    role?: 'dialog' | 'alertdialog';
    /** 本文の余白などを差し替えたいとき。既定は px-5 py-4。 */
    bodyClassName?: string;
    overlayClassName?: string;
    panelClassName?: string;
    /** 下部に固定するボタン列。渡すと区切り線付きのフッターになる。 */
    footer?: ReactNode;
    /** 渡すとパネルが <form> になる（Enter 送信を効かせたいフォームモーダル向け）。 */
    onSubmit?: (event: React.FormEvent) => void;
    children?: ReactNode;
}
export declare function Modal({ open, onClose, title, subtitle, headerRight, ariaLabel, layer, size, dismissable, closeOnBackdrop, panelMaxHeightClassName, showCloseButton, role, bodyClassName, overlayClassName, panelClassName, footer, onSubmit, children, }: ModalProps): import("react").JSX.Element | null;
//# sourceMappingURL=Modal.d.ts.map