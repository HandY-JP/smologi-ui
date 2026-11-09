import { type ComponentType } from 'react';
import { type LabelModalProps } from './default-modal';
import type { FaceSource } from './face-render';
import { useDismiss as defaultUseDismiss } from '../../components/Modal';
import { type PreviewTarget } from '../dialog-model';
import { type ProductLabelPrintSettings } from '../settings';
/** 開いた時点で分かっている設定と対象の中身。 */
export interface LabelContext {
    settings: ProductLabelPrintSettings;
    preview: PreviewTarget[];
}
/** 隠し iframe からの印刷を試した結果。失敗したときは、新しいタブで開いたかどうかで案内文を変える。 */
export type LabelPrintOutcome = {
    ok: true;
} | {
    ok: false;
    message: (openedInNewTab: boolean) => string;
};
/** アプリが用意するもの。同じ対象には同じ adapter（identity）を渡す（変わると取り直す）。 */
export interface ProductLabelDialogAdapter {
    /** 取得済みの設定と中身があれば同期で返す（あれば取り直さずにすぐ開く）。 */
    peekContext?: () => LabelContext | null;
    /** 既定の設定と、対象の中身を取る。失敗は例外（メッセージは利用者向けの日本語）。 */
    loadContext: () => Promise<LabelContext>;
    /** PDF を作る（start は 1 始まり。ロール紙は 1）。失敗は例外（メッセージは利用者向けの日本語）。 */
    createPdf: (input: {
        settings: ProductLabelPrintSettings;
        start: number;
    }) => Promise<Blob>;
    /** 今の設定を既定として保存する。失敗は例外（メッセージは利用者向けの日本語）。 */
    saveDefault: (settings: ProductLabelPrintSettings) => Promise<void>;
    /** 見本（印刷と同じ PDF を画像にしたもの）の取り方。 */
    faces: FaceSource;
    /** PDF の印刷。 */
    printer: {
        /** 隠し iframe で印刷せず、最初から新しいタブで開くべきブラウザか。 */
        prefersPdfTab: () => boolean;
        print: (blob: Blob, opts: {
            pageCount?: number;
        }) => Promise<LabelPrintOutcome>;
    };
}
/** 画面の文言のうち、アプリごとに言い方が変わるもの。 */
export interface ProductLabelDialogCopy {
    /** 開いたあとに作り直せない対象が見つかったときの案内（印刷は止める）。 */
    ungeneratable?: string;
}
/** モーダルの差し替え（アプリが自前の Modal を使っているとき）。既定は共通パッケージの Modal。 */
export interface ProductLabelDialogModal {
    Modal: ComponentType<LabelModalProps>;
    useDismiss: typeof defaultUseDismiss;
}
export declare function ProductLabelPrintDialog({ adapter, initialSheet, onClose, modal, copy, }: {
    adapter: ProductLabelDialogAdapter;
    /** この印刷だけに選んだ用紙。あれば保存済みの既定の代わりに最初に選ぶ（既定は保存しない）。 */
    initialSheet?: string;
    onClose: () => void;
    modal?: ProductLabelDialogModal;
    copy?: ProductLabelDialogCopy;
}): import("react").JSX.Element;
//# sourceMappingURL=ProductLabelPrintDialog.d.ts.map