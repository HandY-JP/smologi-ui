import { type ReactNode } from 'react';
import type { ModalLayer } from './Modal';
export type ConfirmOptions = {
    /** 見出し。質問の形で短く（例: 「この注文を削除しますか？」）。 */
    title: string;
    /** 補足。改行で段落を分ける。 */
    description?: string;
    /** 実行ボタンの文言。「はい」ではなく具体的な動詞（「削除する」など）にする。 */
    confirmLabel: string;
    /** 既定は「あとで」。 */
    cancelLabel?: string;
    /** 元に戻せない操作は 'danger'。既定は 'default'。 */
    tone?: 'danger' | 'default';
    /** ドロワーより手前に出すか。既定は 'over'（ドロワー・モーダルの上）。 */
    layer?: ModalLayer;
    /** ダイアログ本体に足すクラス。Provider の panelClassName より優先（置き換え）。 */
    panelClassName?: string;
};
export type NoticeOptions = {
    title: string;
    description?: string;
    /** 既定は「OK」。 */
    closeLabel?: string;
    /** 失敗の案内などは 'danger'。既定は 'default'。 */
    tone?: 'danger' | 'default';
    layer?: ModalLayer;
    panelClassName?: string;
};
export type PromptOptions = {
    title: string;
    description?: string;
    /** 入力欄の上のラベル。省略時はラベルなし（title が aria-label を兼ねる）。 */
    label?: string;
    defaultValue?: string;
    placeholder?: string;
    /** true で複数行（textarea）。Enter は改行、Ctrl/⌘+Enter で確定。既定は1行（Enter で確定）。 */
    multiline?: boolean;
    confirmLabel: string;
    /** 既定は「あとで」。 */
    cancelLabel?: string;
    /** true の間は、空白だけの入力では実行ボタンを押せない。 */
    required?: boolean;
    layer?: ModalLayer;
    panelClassName?: string;
};
export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;
export type NoticeFn = (options: NoticeOptions) => Promise<void>;
/** 入力された文字列（加工しない）。キャンセル・Escape・背景クリックは null。 */
export type PromptFn = (options: PromptOptions) => Promise<string | null>;
export declare const DEFAULT_CANCEL_LABEL = "\u3042\u3068\u3067";
export declare const DEFAULT_NOTICE_LABEL = "OK";
/** description の改行ごとに1段落にする（空行は捨てる）。 */
export declare function descriptionToLines(description?: string): string[];
export declare function ConfirmProvider({ children, panelClassName }: {
    children: ReactNode;
    /** 全ダイアログに足すクラス（アプリ独自テーマの色合わせ用。例: Seller の rakuten-theme）。呼び出しごとの panelClassName が優先。 */
    panelClassName?: string;
}): import("react").JSX.Element;
/** `await confirm({...})` で、実行なら true、やめる（キャンセル・Escape・背景クリック）なら false。 */
export declare function useConfirm(): ConfirmFn;
/** ボタン1つの案内。閉じられたら解決する。読んでから先へ進んでほしい内容だけに使う。 */
export declare function useNotice(): NoticeFn;
/** `await prompt({...})` で、入力された文字列（加工なし）。やめる（キャンセル・Escape・背景クリック）なら null。window.prompt の置き換え。 */
export declare function usePrompt(): PromptFn;
//# sourceMappingURL=ConfirmProvider.d.ts.map