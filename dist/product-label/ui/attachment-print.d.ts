export type PrintableAttachmentKind = 'pdf' | 'image';
export type PrintAttachmentFailureReason = 
/** 取得に失敗（通信・認証・CORS・HTTPエラー） */
'fetch'
/** PDF・画像以外（印刷できる形式ではない） */
 | 'unsupported'
/** 隠し iframe の読込・デコードが時間内に終わらなかった */
 | 'load-timeout'
/** iframe の window に print() を呼べなかった（ブラウザ制約など） */
 | 'print-blocked';
export type PrintAttachmentResult = {
    ok: true;
    kind: PrintableAttachmentKind;
} | {
    ok: false;
    reason: PrintAttachmentFailureReason;
};
/**
 * 印刷できる種類か判定する。Content-Type を優先し、octet-stream・空のときだけ拡張子で補う
 * （contentType 未設定の Blob は octet-stream で返ってくることがあるため）。
 */
export declare function detectPrintableKind(input: {
    contentType?: string | null;
    fileName?: string | null;
}): PrintableAttachmentKind | null;
/**
 * Blob に付ける MIME。octet-stream のままだと Chrome は iframe で表示せずダウンロード扱いにし、
 * 空の iframe を印刷することになるため、種類から確定させる。
 */
export declare function printableMimeType(kind: PrintableAttachmentKind, contentType: string | null | undefined, fileName: string | null | undefined): string;
/** 失敗理由ごとのトースト文言。どれも「画面は印刷していない」ことと次の手を伝える。 */
export declare function printFailureMessage(reason: PrintAttachmentFailureReason, openedInNewTab: boolean): string;
/** Safari（Chrome / Edge / Firefox / Opera 系は含めない）かをユーザーエージェントで判定する。 */
export declare function isSafariUserAgent(ua: string): boolean;
/**
 * 隠し iframe からの PDF 印刷を試さず、最初から新しいタブで開くべきか。
 * Safari は iframe 内 PDF の print() が不安定、pdfViewerEnabled が false / 未提供のブラウザは
 * 内蔵 PDF ビューアが無い（または不明）で load が来ないため。商品ラベル印刷の経路で使う。
 */
export declare function shouldOpenPdfInNewTab(env: {
    userAgent?: string;
    pdfViewerEnabled?: boolean | undefined;
}): boolean;
/** ブラウザ環境から shouldOpenPdfInNewTab を判定する（SSR では false）。 */
export declare function browserPrefersPdfTab(): boolean;
/** PDF の load 待ち上限（ページ数が多いほど延ばす）。12秒＋ページ数×0.1秒、上限60秒。 */
export declare function pdfLoadTimeoutMs(pageCount?: number): number;
/** PDF ビューアの描画猶予（ページ数が多いほど延ばす）。600ms＋ページ数×10ms、上限5秒。 */
export declare function pdfSettleMsFor(pageCount?: number): number;
/** 画像1枚を用紙いっぱい（縦横比維持）に印刷するためのラッパー HTML（iframe srcdoc 用）。 */
export declare function buildImagePrintHtml(imageUrl: string, title: string): string;
/**
 * 添付を印刷する。source は同一オリジンの配信 API（/api/logistics/attachments/file?url=…）
 * または旧公開 Blob の URL、あるいは結合済み PDF などの Blob。
 *
 * 成功時も失敗時も window.print()（＝画面の印刷）は呼ばない。
 */
export declare function printAttachment(source: string | Blob, options?: {
    fileName?: string;
    contentType?: string; /** PDF のページ数（待ち時間を延ばすため） */
    pageCount?: number;
}): Promise<PrintAttachmentResult>;
//# sourceMappingURL=attachment-print.d.ts.map