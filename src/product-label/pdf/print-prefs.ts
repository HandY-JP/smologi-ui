// 生成した商品ラベル PDF に「印刷の初期設定」を埋め込む。
// 倍率なし（PrintScaling=None）にして、ブラウザの印刷画面が「用紙に合わせる」で縮小して
// ラベルの位置・大きさがずれるのを防ぐ。両面なし・用紙は PDF の寸法で選ぶ（ロール紙の寸法対応）。
import { Duplex, PDFDocument, PrintScaling } from 'pdf-lib';

export async function applyLabelPrintPreferences(pdf: Uint8Array | Buffer): Promise<Buffer> {
  const doc = await PDFDocument.load(pdf, { updateMetadata: false });
  const prefs = doc.catalog.getOrCreateViewerPreferences();
  prefs.setPrintScaling(PrintScaling.None);
  prefs.setDuplex(Duplex.Simplex);
  prefs.setPickTrayByPDFSize(true);
  return Buffer.from(await doc.save());
}
