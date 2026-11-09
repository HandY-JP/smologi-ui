import { Duplex, PDFDocument, PrintScaling } from "pdf-lib";
async function applyLabelPrintPreferences(pdf) {
  const doc = await PDFDocument.load(pdf, { updateMetadata: false });
  const prefs = doc.catalog.getOrCreateViewerPreferences();
  prefs.setPrintScaling(PrintScaling.None);
  prefs.setDuplex(Duplex.Simplex);
  prefs.setPickTrayByPDFSize(true);
  return Buffer.from(await doc.save());
}
export {
  applyLabelPrintPreferences
};
//# sourceMappingURL=print-prefs.js.map