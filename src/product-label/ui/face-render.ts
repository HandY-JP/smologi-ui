// 見本用 PDF（印刷と同じ描画でサーバーが作る）を pdfjs で画像にする。印刷と同じ PDF を描くので、字形・幅が印刷と同じになる。
// pdfjs は重く、worker の置き場所はバンドラ次第なので、読み込みはアプリが渡す（loadPdfjs）。必要になったときだけ読む。
import type { PreviewTarget } from '../dialog-model';
import type { ProductLabelPrintSettings } from '../settings';

/** pdfjs-dist のうち使う部分だけの形（アプリの pdfjs-dist をそのまま渡せる）。 */
export interface PdfjsPageLike {
  getViewport(opts: { scale: number }): { width: number; height: number };
  render(opts: { canvas: HTMLCanvasElement; canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }): { promise: Promise<unknown> };
  cleanup(): void;
}
export interface PdfjsDocumentLike {
  numPages: number;
  getPage(n: number): Promise<PdfjsPageLike>;
}
export interface PdfjsModuleLike {
  getDocument(src: { data: Uint8Array }): { promise: Promise<PdfjsDocumentLike>; destroy(): unknown };
}

export type FaceSettings = Pick<ProductLabelPrintSettings, 'sheet' | 'image' | 'extra' | 'expirySticker'>;

/** 見本の取り方（アプリが用意する）。 */
export interface FaceSource {
  /** 見本 PDF を取る。失敗は例外（中断は AbortError）。targets の中身の並びで品目ごとに 1 ページ（dialog-model.faceSlots）。 */
  fetchFacesPdf(req: { targets: PreviewTarget[]; settings: FaceSettings; signal: AbortSignal }): Promise<ArrayBuffer>;
  /** pdfjs-dist を読み込む（worker の設定込み）。 */
  loadPdfjs(): Promise<PdfjsModuleLike>;
}

/**
 * PDF の各ページを画像（data URL）にして、できた順に onPage で渡す。幅は CSS px 想定の表示幅 × 端末の解像度。
 * signal が中断されたら途中で止める。
 */
export async function renderPdfPages(
  data: ArrayBuffer,
  displayWidth: number,
  signal: AbortSignal,
  onPage: (page: number, url: string) => void,
  loadPdfjs: () => Promise<PdfjsModuleLike>,
): Promise<number> {
  const pdfjs = await loadPdfjs();
  const dpr = typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, 3);
  const task = pdfjs.getDocument({ data: new Uint8Array(data) });
  const doc = await task.promise;
  try {
    for (let i = 1; i <= doc.numPages; i += 1) {
      if (signal.aborted) break;
      const page = await doc.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: (displayWidth * dpr) / base.width });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('canvas unavailable');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
      page.cleanup();
      if (signal.aborted) break;
      onPage(i - 1, canvas.toDataURL('image/png'));
    }
    return doc.numPages;
  } finally {
    void task.destroy();
  }
}
