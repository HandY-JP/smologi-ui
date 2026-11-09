import type { PreviewTarget } from '../dialog-model';
import type { ProductLabelPrintSettings } from '../settings';
/** pdfjs-dist のうち使う部分だけの形（アプリの pdfjs-dist をそのまま渡せる）。 */
export interface PdfjsPageLike {
    getViewport(opts: {
        scale: number;
    }): {
        width: number;
        height: number;
    };
    render(opts: {
        canvas: HTMLCanvasElement;
        canvasContext: CanvasRenderingContext2D;
        viewport: {
            width: number;
            height: number;
        };
    }): {
        promise: Promise<unknown>;
    };
    cleanup(): void;
}
export interface PdfjsDocumentLike {
    numPages: number;
    getPage(n: number): Promise<PdfjsPageLike>;
}
export interface PdfjsModuleLike {
    getDocument(src: {
        data: Uint8Array;
    }): {
        promise: Promise<PdfjsDocumentLike>;
        destroy(): unknown;
    };
}
export type FaceSettings = Pick<ProductLabelPrintSettings, 'sheet' | 'image' | 'extra' | 'expirySticker'>;
/** 見本の取り方（アプリが用意する）。 */
export interface FaceSource {
    /** 見本 PDF を取る。失敗は例外（中断は AbortError）。targets の中身の並びで品目ごとに 1 ページ（dialog-model.faceSlots）。 */
    fetchFacesPdf(req: {
        targets: PreviewTarget[];
        settings: FaceSettings;
        signal: AbortSignal;
    }): Promise<ArrayBuffer>;
    /** pdfjs-dist を読み込む（worker の設定込み）。 */
    loadPdfjs(): Promise<PdfjsModuleLike>;
}
/**
 * PDF の各ページを画像（data URL）にして、できた順に onPage で渡す。幅は CSS px 想定の表示幅 × 端末の解像度。
 * signal が中断されたら途中で止める。
 */
export declare function renderPdfPages(data: ArrayBuffer, displayWidth: number, signal: AbortSignal, onPage: (page: number, url: string) => void, loadPdfjs: () => Promise<PdfjsModuleLike>): Promise<number>;
//# sourceMappingURL=face-render.d.ts.map