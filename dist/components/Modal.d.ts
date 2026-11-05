import { type ReactNode, type RefObject } from 'react';
export type ModalLayer = 'base' | 'over';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
/**
 * 外側クリック（mousedown）と Escape で閉じる共通フック。
 * ポップオーバー・ドロップダウンなど、モーダルシェルを使わない要素向け。
 * ref には「内側」とみなす要素を渡す（トリガーボタンも内側にしたい場合は ignore に渡す）。
 *
 * - Escape はモーダルと同じスタックに積む＝モーダルの中のポップオーバーで Escape を押すと
 *   ポップオーバーだけが閉じる（下のモーダルまで一緒に閉じない）。
 * - mousedown は capture フェーズで拾う。モーダルのパネルは onMouseDown で伝播を止めている
 *   （背景クリック判定のため）ので、bubble で待つと中身の操作を取りこぼす環境がある。
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
    /** タイトルのすぐ右（同じ行）に並べる補足（枚数の要約など）。title がある場合だけ出る。 */
    headerAside?: ReactNode;
    /** title を出さないときのアクセシブル名。 */
    ariaLabel?: string;
    /** 重ね順。既定は base（z-[70]）。ドロワーの上に出すものだけ over（z-[90]）。 */
    layer?: ModalLayer;
    size?: ModalSize;
    /** Escape と背景クリックで閉じられるか。フォーム系は false にして誤操作の取りこぼしを防ぐ。 */
    dismissable?: boolean;
    /**
     * 背景クリックで閉じるか。既定は true（2026-09-23 ユーザー決定:
     * 「ポップアップの外を押したら閉じる」を共通部品の既定にする）。
     * dismissable が false のときは、この値に関わらず閉じない。
     * 入力途中の誤爆だけを防ぎたい（Escape と × は残す）フォームモーダル向けに false を渡す。
     */
    closeOnBackdrop?: boolean;
    /**
     * 入力途中かどうか。true のときは背景クリック・Escape で即座には閉じず、
     * フッター上に「入力内容が失われます。閉じますか」の確認バーを出す
     * （ConfirmDialog の入れ子は使わない）。既定 false＝従来どおり即閉じる。
     * 下書きが自動保存されるフォーム（localStorage 等）では渡さないこと。
     */
    dirty?: boolean;
    /**
     * ヘッダーを薄く（最小 44px・上下余白を詰める）する。既定 false＝従来の余白（py-4）。
     * 本文の表示領域を広げたい作業モーダル向け（スモロジ本体の既定の見た目）。
     */
    compactHeader?: boolean;
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
export declare function Modal({ open, onClose, title, subtitle, headerRight, headerAside, ariaLabel, layer, size, dismissable, closeOnBackdrop, dirty, compactHeader, panelMaxHeightClassName, showCloseButton, role, bodyClassName, overlayClassName, panelClassName, footer, onSubmit, children, }: ModalProps): import("react").JSX.Element | null;
//# sourceMappingURL=Modal.d.ts.map