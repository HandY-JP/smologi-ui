import { PDFDocument, PDFName } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { applyLabelPrintPreferences } from '../../src/product-label/pdf/print-prefs';

describe('applyLabelPrintPreferences', () => {
  it('カタログに PrintScaling None・Simplex・PickTrayByPDFSize が入る', async () => {
    const src = await PDFDocument.create();
    src.addPage([100, 100]);
    src.addPage([100, 100]);
    const out = await applyLabelPrintPreferences(await src.save());
    const doc = await PDFDocument.load(out);
    expect(doc.getPageCount()).toBe(2);
    const vp = doc.catalog.lookup(PDFName.of('ViewerPreferences'));
    expect(String(vp)).toContain('/PrintScaling /None');
    expect(String(vp)).toContain('/Duplex /Simplex');
    expect(String(vp)).toContain('/PickTrayByPDFSize true');
  });
});
