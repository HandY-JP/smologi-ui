// 印刷画面の printer の標準実装（ブラウザの隠し iframe から PDF を印刷する。attachment-print.ts）。
// Safari・内蔵 PDF ビューアが無いブラウザは最初から新しいタブで開く（browserPrefersPdfTab）。
import { browserPrefersPdfTab, printAttachment, printFailureMessage } from './attachment-print';
import type { ProductLabelDialogAdapter } from './ProductLabelPrintDialog';

export const browserPdfPrinter: ProductLabelDialogAdapter['printer'] = {
  prefersPdfTab: browserPrefersPdfTab,
  print: async (blob, { pageCount }) => {
    const printed = await printAttachment(blob, { contentType: 'application/pdf', fileName: 'product-labels.pdf', pageCount });
    return printed.ok ? { ok: true } : { ok: false, message: (openedInNewTab) => printFailureMessage(printed.reason, openedInNewTab) };
  },
};
