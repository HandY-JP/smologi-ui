import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import type { LabelItem } from '../../src/product-label/label-doc';
import { DEFAULT_PRODUCT_LABEL_SETTINGS } from '../../src/product-label/settings';
import { buildFacesPdf, buildProductLabelPdf, MAX_TOTAL_LABELS, type BuildOptions, type LabelGroup } from '../../src/product-label/pdf/build';
import { LabelPrintError } from '../../src/product-label/errors';
import { TEST_FONTS } from './fonts';

const OUT_DIR = process.env.LABEL_PNG_DIR;

function item(over: Partial<LabelItem> = {}): LabelItem {
  return {
    sellerSku: 'SKU-001', asin: 'B000000001', fnSku: 'X001ABCDE1', productName: 'テスト商品 とても長い名前のサンプル 500ml 12本入りケース',
    quantity: 3, condition: 'new_new', conditionLabel: '新品', imageUrl: null, expiration: null, unitsPerSet: null, expiryManaged: null, prepInstructions: [], ...over,
  };
}


const base: BuildOptions = { ...DEFAULT_PRODUCT_LABEL_SETTINGS, start: 1 };
const fonts = TEST_FONTS;

describe('PDF の組み立て', () => {
  it('自前生成: 開始位置と枚数どおりのページ数、期限シールは商品ラベルの直後に同数', async () => {
    const doc: LabelGroup = { items: [item({ quantity: 2, expiration: '2027-08-31' }), item({ fnSku: 'X002', quantity: 1 })] };
    const bytes = await buildProductLabelPdf({
      fonts,
      groups: [doc],
      options: { ...base, start: 39, expirySticker: true },
    });
    const out = await PDFDocument.load(bytes);
    // 2 + 2(期限) + 1 = 5 枚、39 番から → 39,40 | 1,2,3 → 2 ページ
    expect(out.getPageCount()).toBe(2);
    if (OUT_DIR) fs.writeFileSync(path.join(OUT_DIR, 'generate.pdf'), bytes);
  }, 30_000);

  it('自前生成: 画像オン・SKU 追加・非新品でも描ける。画像が取れなくても落ちない', async () => {
    const doc: LabelGroup = {
      items: [
        item({ imageUrl: 'https://img.example.com/a.jpg', conditionLabel: '中古 - ほぼ新品', condition: 'used_like_new' }),
        item({ fnSku: 'X009', quantity: 1, productName: 'English product name with a very long title that must be cut' }),
      ],
    };
    const jpeg = await (await import('sharp')).default({ create: { width: 80, height: 80, channels: 3, background: '#cc3333' } }).jpeg().toBuffer();
    const bytes = await buildProductLabelPdf({
      fonts,
      groups: [doc],
      options: { ...base, image: true, extra: ['sku', 'needsExpiry', 'setUnits'], sheet: 'A4_21', order: 'column' },
      fetchImage: async (url) => (url ? jpeg : null),
    });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
    if (OUT_DIR) fs.writeFileSync(path.join(OUT_DIR, 'generate-21.pdf'), bytes);
    const noImage = await buildProductLabelPdf({
      fonts,
      groups: [doc],
      options: { ...base, image: true },
      fetchImage: async () => null,
    });
    expect((await PDFDocument.load(noImage)).getPageCount()).toBe(1);
  }, 30_000);

  it('ロール紙: 1 ラベル 1 ページ・ページ寸法はラベルの大きさ', async () => {
    const doc: LabelGroup = { items: [item({ quantity: 3, expiration: '2027-01-02' })] };
    const bytes = await buildProductLabelPdf({
      fonts,
      groups: [doc],
      options: { ...base, sheet: 'ROLL_50x30', expirySticker: true },
    });
    const out = await PDFDocument.load(bytes);
    expect(out.getPageCount()).toBe(6);
    expect(out.getPage(0).getSize().width).toBeCloseTo(50 * 2.8346, 1);
    if (OUT_DIR) fs.writeFileSync(path.join(OUT_DIR, 'roll.pdf'), bytes);
  }, 30_000);

  it('複数の出荷は 1 本に詰め、開始位置は最初の 1 枚だけに効く', async () => {
    const d1: LabelGroup = { items: [item({ quantity: 2 })] };
    const d2: LabelGroup = { items: [item({ fnSku: 'X777', quantity: 2 })] };
    const bytes = await buildProductLabelPdf({
      fonts,
      groups: [d1, d2],
      options: { ...base, start: 40 },
    });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(2);
  }, 30_000);
});


describe('上限と見本', () => {
  it('ラベルが無い・多すぎるときは 400 のエラー', async () => {
    const none = await buildProductLabelPdf({ fonts, groups: [{ items: [] }], options: base }).catch((e) => e);
    expect(none).toBeInstanceOf(LabelPrintError);
    const many = await buildProductLabelPdf({ fonts, groups: [{ items: [item({ quantity: MAX_TOTAL_LABELS + 1 })] }], options: base }).catch((e) => e);
    expect(many).toBeInstanceOf(LabelPrintError);
    expect((many as LabelPrintError).status).toBe(400);
  });

  it('見本 PDF は品目ごとに 1 ページ（期限シールを出す設定で期限があれば直後に 1 ページ）。ページの寸法はラベルの寸法', async () => {
    const groups: LabelGroup[] = [{ items: [item({ expiration: '2027-08-31' }), item({ fnSku: 'X002' })] }];
    const bytes = await buildFacesPdf({ fonts, groups, options: { sheet: 'A4_40_52x29', image: false, extra: [], expirySticker: true } });
    const out = await PDFDocument.load(bytes);
    expect(out.getPageCount()).toBe(3);
    expect(out.getPage(0).getSize().width).toBeCloseTo(52.5 * 2.8346, 1);
    await expect(buildFacesPdf({ fonts, groups: [], options: { sheet: 'A4_40_52x29', image: false, extra: [], expirySticker: false } })).rejects.toThrow(LabelPrintError);
  }, 30_000);
});
