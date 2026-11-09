import { browserPrefersPdfTab, printAttachment, printFailureMessage } from "./attachment-print.js";
const browserPdfPrinter = {
  prefersPdfTab: browserPrefersPdfTab,
  print: async (blob, { pageCount }) => {
    const printed = await printAttachment(blob, { contentType: "application/pdf", fileName: "product-labels.pdf", pageCount });
    return printed.ok ? { ok: true } : { ok: false, message: (openedInNewTab) => printFailureMessage(printed.reason, openedInNewTab) };
  }
};
export {
  browserPdfPrinter
};
//# sourceMappingURL=pdf-printer.js.map