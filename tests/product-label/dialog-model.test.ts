import { describe, expect, it } from 'vitest';
import { asisCardInfo, commonSourceSheet, originalPdfName, printButtonLabel, sheetPillName, cellLabels, diagramPage, faceSlots, formatCardExpiry, labelCardRowSub, formatCardTotal, labelCardSummary, canPrintWithLabelDialog, targetLabelCount, totalCount, type PreviewTarget } from '../../src/product-label/dialog-model';
import { getSheet, type SheetDef } from '../../src/product-label/sheets';
import { cellLabelBox, hasExtraOmitted, nameMeasurer } from '../../src/product-label/dialog-model';
import { toPreviewItem, type LabelItem } from '../../src/product-label/label-doc';
import { computeLabelBox, nameRows } from '../../src/product-label/label-layout';
import { extraTexts, type LabelExtraKey } from '../../src/product-label/text';
import { loadTextMeasurer, measureTextWidth, textMeasurer } from './fonts';

const previewItem = (item: LabelItem) => toPreviewItem(item, textMeasurer.measureEm);

const gen: PreviewTarget = {
  shipmentId: 's1', attachmentUrl: 'u1', fileName: 'a.pdf', orderNumber: null, mode: 'generate', hasItems: true,
  labelCount: 5,
  items: [
    { productName: 'A', fnSku: 'X1', sellerSku: null, quantity: 3, hasImage: false, expiration: '2027-08-31', conditionLabel: null, fnSkuEm: 5, conditionEm: 0, skuEm: 0 },
    { productName: 'B', fnSku: 'X2', sellerSku: null, quantity: 2, hasImage: false, expiration: null, conditionLabel: null, fnSkuEm: 5, conditionEm: 0, skuEm: 0 },
  ],
};
const manual: PreviewTarget = {
  shipmentId: 's2', attachmentUrl: 'u2', fileName: 'b.pdf', orderNumber: null, mode: 'asis', hasItems: false,
  labelCount: null, items: [],
};
const o = { expirySticker: false };

describe('dialog-model', () => {
  it('期限シールは期限のある商品の枚数だけ増える', () => {
    expect(targetLabelCount(gen, o)).toBe(5);
    expect(targetLabelCount(gen, { ...o, expirySticker: true })).toBe(8);
  });
  it('生成できない対象（そのまま印刷）は枚数不明。1 件でもあれば合計も不明', () => {
    expect(targetLabelCount(manual, o)).toBeNull();
    expect(totalCount([gen, manual], o)).toBeNull();
    expect(totalCount([gen], o)).toBe(5);
  });
  it('期限シールは商品のラベルの直後に並ぶ', () => {
    const l = cellLabels([gen], { ...o, expirySticker: true }, 100);
    expect(l.map((x) => x.kind)).toEqual(['label', 'label', 'label', 'expiry', 'expiry', 'expiry', 'label', 'label']);
  });
  it('シート図: 開始位置より前は使用済み、枚数ぶんが今回印刷、残りは余り', () => {
    const def = getSheet('A4_21')!;
    const labels = cellLabels([gen], o, 100);
    const p0 = diagramPage(def, 'row', 20, labels, 5, 0);
    expect(p0.filter((c) => c.state === 'used')).toHaveLength(19);
    expect(p0.filter((c) => c.state === 'print').map((c) => c.no)).toEqual([20, 21]);
    const p1 = diagramPage(def, 'row', 20, labels, 5, 1);
    expect(p1.filter((c) => c.state === 'print').map((c) => c.no)).toEqual([1, 2, 3]);
  });
  it('縦の番号は列ごとに下へ進む', () => {
    const def = getSheet('A4_21')!; // 3列×7行
    const cells = diagramPage(def, 'column', 1, [], 0, 0);
    expect(cells.find((c) => c.row === 1 && c.col === 0)!.no).toBe(2);
    expect(cells.find((c) => c.row === 0 && c.col === 1)!.no).toBe(8);
  });
});

describe('シート図の判定が印刷側と一致する', () => {
  const base: LabelItem = {
    sellerSku: 'SKU-1', asin: 'B0', fnSku: 'X000ABCDEF', productName: 'とても長い商品名のサンプルです 型番 ABC-12345 サイズ M',
    quantity: 1, condition: 'used_very_good', conditionLabel: '中古-非常に良い', imageUrl: 'https://example.com/a.jpg', expiration: null,
    unitsPerSet: 3, expiryManaged: true, prepInstructions: ['袋入れ', 'テープ止め'],
  };
  it('preview の品目に実測の幅が付く', async () => {
    await loadTextMeasurer();
    const p = previewItem(base);
    expect(p.conditionLabel).toBe('中古-非常に良い');
    expect(p.fnSkuEm).toBeCloseTo(measureTextWidth(base.fnSku, 1, false), 8);
    expect(p.conditionEm).toBeGreaterThan(0);
    expect(p.hasImage).toBe(true);
    expect(previewItem({ ...base, conditionLabel: null }).conditionEm).toBe(0);
  });
  it('用紙・画像・SKU を変えても、コンディション行と商品名が印刷と一致する', async () => {
    await loadTextMeasurer();
    const item = previewItem(base);
    const label = cellLabels([{ ...gen, items: [item] }], o, 1)[0];
    for (const id of ['A4_21', 'A4_40_52x29', 'A4_44_48x25', 'A4_24']) {
      const sheet = getSheet(id)!;
      for (const image of [true, false]) {
        for (const extra of [['sku', 'needsExpiry', 'setUnits'], ['sku'], []] as LabelExtraKey[][]) {
          const mine = cellLabelBox(label, sheet, { image, extra });
          const print = computeLabelBox({
            widthMm: sheet.labelW, heightMm: sheet.labelH, fnSku: base.fnSku, withImage: image,
            condition: base.conditionLabel, measure: measureTextWidth, sheetId: id, extras: extraTexts(base, extra),
          });
          expect(mine.conditionOwnLine).toBe(print.conditionOwnLine);
          expect(mine.nameLines).toBe(print.nameLines);
          expect(mine.fontSize).toBeCloseTo(print.fontSize, 8);
          expect(mine.text.w).toBeCloseTo(print.text.w, 8);
          expect(mine.extras).toEqual(print.extras);
          expect(mine.extrasOmitted).toBe(print.extrasOmitted);
        }
      }
    }
  });
  it('商品名の行は、プレビュー（API の文字幅表）と印刷（フォント実測）で同じ文字列になる', async () => {
    await loadTextMeasurer();
    const names = [
      base.productName,
      'シャープ プラズマクラスター 加湿空気清浄機 KC-R50-W ホワイト系 / 2024年モデル 適用床面積 23畳 (空気清浄) Ver.2',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      'Anker PowerCore 10000 モバイルバッテリー 大容量 コンパクト　全角スペース入り（黒）【送料無料】',
      '短い名前',
    ];
    for (const name of names) {
      const item = previewItem({ ...base, productName: name });
      const label = cellLabels([{ ...gen, items: [item] }], o, 1)[0];
      for (const id of ['A4_21', 'A4_40_52x29', 'A4_44_48x25', 'A4_24']) {
        const sheet = getSheet(id)!;
        for (const image of [true, false]) {
          for (const extra of [['sku', 'needsExpiry', 'setUnits'], ['sku'], []] as LabelExtraKey[][]) {
            const mine = cellLabelBox(label, sheet, { image, extra });
            const print = computeLabelBox({
              widthMm: sheet.labelW, heightMm: sheet.labelH, fnSku: base.fnSku, withImage: image,
              condition: base.conditionLabel, measure: measureTextWidth, sheetId: id, extras: extraTexts(base, extra),
            });
            const printRows = nameRows(name, print.text.w, (t) => measureTextWidth(t, print.nameFontSize, false), print.nameLines);
            const previewRows = nameRows(name, mine.text.w, nameMeasurer(label.nameCharEm, mine.nameFontSize), mine.nameLines);
            expect(previewRows).toEqual(printRows);
            expect(previewRows.length).toBeGreaterThan(0);
            expect(previewRows.length).toBeLessThanOrEqual(mine.nameLines);
          }
        }
      }
    }
  });
  it('追加項目が入らない用紙の品目があれば hasExtraOmitted が true（選ばなければ false）', async () => {
    await loadTextMeasurer();
    const item = previewItem(base);
    const t = { ...gen, items: [item] };
    for (const id of ['A4_21', 'A4_40_52x29', 'A4_44_48x25']) {
      const sheet = getSheet(id)!;
      const extra: LabelExtraKey[] = ['sku', 'needsExpiry', 'setUnits'];
      const omitted = cellLabelBox(cellLabels([t], o, 1)[0], sheet, { image: true, extra }).extrasOmitted > 0;
      expect(hasExtraOmitted([t], sheet, { image: true, extra })).toBe(omitted);
      expect(hasExtraOmitted([t], sheet, { image: true, extra: [] })).toBe(false);
    }
  });
  it('古いデータ（点数・期限管理なし）は選べても何も出ず、エラーにならない', async () => {
    await loadTextMeasurer();
    const item = previewItem({ ...base, unitsPerSet: null, expiryManaged: null, sellerSku: '' });
    const label = cellLabels([{ ...gen, items: [item] }], o, 1)[0];
    const b = cellLabelBox(label, getSheet('A4_21')!, { image: false, extra: ['sku', 'needsExpiry', 'setUnits'] });
    expect(b.extras).toEqual([]);
    expect(b.extrasOmitted).toBe(0);
  });
  it('要期限は期限管理の商品だけ、◯点入はセット商品（2点以上）だけ出る', async () => {
    await loadTextMeasurer();
    const sheet = getSheet('A4_21')!;
    const texts = (over: Partial<LabelItem>) => {
      const label = cellLabels([{ ...gen, items: [previewItem({ ...base, sellerSku: '', ...over })] }], o, 1)[0];
      return cellLabelBox(label, sheet, { image: false, extra: ['needsExpiry', 'setUnits'] }).extras.map((e) => e.text);
    };
    expect(texts({ expiryManaged: true, unitsPerSet: 3 })).toEqual(['要期限', '3点入']);
    expect(texts({ expiryManaged: false, unitsPerSet: 1 })).toEqual([]);
    expect(texts({ expiryManaged: true, unitsPerSet: null })).toEqual(['要期限']);
  });
  it('preview の品目に梱包要件・点数・期限管理が付く', () => {
    const p = previewItem(base);
    expect(p.prepInstructions).toEqual(['袋入れ', 'テープ止め']);
    expect(p.unitsPerSet).toBe(3);
    expect(p.expiryManaged).toBe(true);
    expect(Object.keys(p.extraEm ?? {}).sort()).toEqual(['3点入', '要期限']);
  });
});

describe('labelCardSummary（出荷詳細の商品ラベル欄）', () => {
  const sheet40 = getSheet('A4_40_52x29')!;
  it('品目ごとの行・合計・用紙の枚数・見本を出す', () => {
    const s = labelCardSummary([gen], { expirySticker: false }, sheet40);
    expect(s.rows.map((r) => r.quantity)).toEqual([3, 2]);
    expect(s.total).toBe(5);
    expect(s.faces).toBe(40);
    expect(s.pages).toBe(1);
    expect(s.rows[0].label).toMatchObject({ kind: 'label', fnSku: 'X1', name: 'A' });
    expect(s.rows[0].fnSku).toBe('X1');
  });
  it('期限シールを付ける設定なら期限ありの枚数が増える', () => {
    expect(labelCardSummary([gen], { expirySticker: true }, sheet40).total).toBe(8);
  });
  it('41枚なら用紙は2枚', () => {
    const big = { ...gen, labelCount: 41 };
    expect(labelCardSummary([big], { expirySticker: false }, sheet40).pages).toBe(2);
  });
  it('生成できない対象（そのまま印刷）は行も見本も出さず、枚数は不明', () => {
    const s = labelCardSummary([manual], { expirySticker: true }, sheet40);
    expect(s.first).toBeNull();
    expect(s.total).toBeNull();
    expect(s.rows).toEqual([]);
  });
});

describe('商品ラベル欄の表示文', () => {
  it('行の補足は FNSKU・コンディション・期限（新品と期限なしは書かない）', () => {
    expect(labelCardRowSub({ fnSku: 'X00ABC', conditionLabel: '中古-非常に良い', expiration: '2027-06-30' })).toBe('FNSKU X00ABC・中古-非常に良い・期限 2027/06/30');
    expect(labelCardRowSub({ fnSku: 'X00ABC', conditionLabel: '新品', expiration: null })).toBe('FNSKU X00ABC');
    expect(labelCardRowSub({ fnSku: 'X00ABC', conditionLabel: null, expiration: '2027-06-30' })).toBe('FNSKU X00ABC・期限 2027/06/30');
    // 梱包要件は ' / ' でつなぐ。無ければ何も足さない（古いデータでも壊れない）
    expect(labelCardRowSub({ fnSku: 'X00ABC', conditionLabel: '新品', expiration: null, prepInstructions: ['袋入れ', 'テープ止め'] })).toBe('FNSKU X00ABC・梱包 袋入れ / テープ止め');
    expect(labelCardRowSub({ fnSku: 'X00ABC', conditionLabel: '新品', expiration: null, prepInstructions: [] })).toBe('FNSKU X00ABC');
    expect(labelCardRowSub({ fnSku: 'X00ABC', conditionLabel: '新品', expiration: null })).toBe('FNSKU X00ABC');
  });
  it('合計は「36枚（40面の用紙で約1枚）」の形', () => {
    expect(formatCardTotal({ total: 36, faces: 40, pages: 1 })).toBe('36枚（40面の用紙で約1枚）');
    expect(formatCardTotal({ total: 1234, faces: 40, pages: 31 })).toBe('1,234枚（40面の用紙で約31枚）');
  });
  it('ロール紙は枚数だけ、不明なら注記', () => {
    expect(formatCardTotal({ total: 12, faces: 1, pages: null })).toBe('12枚');
    expect(formatCardTotal({ total: null, faces: 40, pages: null })).toContain('印刷画面');
  });
  it('期限は 2026/12/31 の形', () => {
    expect(formatCardExpiry('2026-12-31')).toBe('2026/12/31');
  });
});

describe('faceSlots（見本 PDF のページと品目の対応。サーバーの buildFacesPdf と同じ順）', () => {
  const item = (fnSku: string, expiration: string | null) => ({
    productName: fnSku, fnSku, sellerSku: null, quantity: 3, hasImage: false, expiration, conditionLabel: '新品', fnSkuEm: 1, conditionEm: 1, skuEm: 0,
  });
  const gen = (items: ReturnType<typeof item>[]): PreviewTarget => ({
    shipmentId: 's', attachmentUrl: 'u', fileName: 'f', orderNumber: null, mode: 'generate', hasItems: true, labelCount: null, items,
  });
  const asis: PreviewTarget = { ...gen([]), mode: 'asis' };

  it('品目ごとに 1 ページ（枚数ではない）。生成できない対象は飛ばす', () => {
    const slots = faceSlots([asis, gen([item('A', null), item('B', null)])], { expirySticker: false });
    expect(slots.map((s) => [s.ref.targetIndex, s.ref.itemIndex, s.kind, s.page])).toEqual([[1, 0, 'label', 0], [1, 1, 'label', 1]]);
  });

  it('期限シールは期限のある品目の商品ラベルの直後に 1 ページ', () => {
    const slots = faceSlots([gen([item('A', '2027-06-30'), item('B', null)])], { expirySticker: true });
    expect(slots.map((s) => `${s.ref.itemIndex}${s.kind}`)).toEqual(['0label', '0expiry', '1label']);
    expect(slots.map((s) => s.page)).toEqual([0, 1, 2]);
  });
});

describe('canPrintWithLabelDialog（まとめて印刷・出荷詳細の分岐）', () => {
  const gen = { mode: 'generate' as const, hasItems: true };
  it('全部 generate のときだけ専用ダイアログ', () => {
    expect(canPrintWithLabelDialog([gen, gen])).toBe(true);
  });
  it('1 件でも asis なら従来の印刷', () => {
    expect(canPrintWithLabelDialog([gen, { mode: 'asis', hasItems: true }])).toBe(false);
  });
  it('品目なし・空なら従来の印刷', () => {
    expect(canPrintWithLabelDialog([{ mode: 'generate', hasItems: false }])).toBe(false);
    expect(canPrintWithLabelDialog([])).toBe(false);
  });
});

describe('用紙を変えて作り直す表示', () => {
  const a40 = getSheet('A4_40_52x29')!;
  const roll = getSheet('ROLL_50x30')!;
  const a21 = getSheet('A4_21')!;
  const gen = (sourceSheet: string | null) => ({ mode: 'generate' as const, hasItems: true, sourceSheet });
  const asis = (sourceSheet: string | null, reason: string | null = null) => ({ mode: 'asis' as const, hasItems: true, sourceSheet, asisReason: reason });

  it('印刷ボタンは面数つき、ロール紙は「ロール紙で印刷」', () => {
    expect(printButtonLabel(a40)).toBe('40面で印刷');
    expect(printButtonLabel(a21)).toBe('21面で印刷');
    expect(printButtonLabel(roll)).toBe('ロール紙で印刷');
  });
  it('用紙のピルは寸法つきの名前', () => {
    expect(sheetPillName(a40)).toBe('40面（52.5×29mm）');
  });
  it('合計は選んだ用紙の面数で数え直す（36枚は24面で2枚・40面で1枚）', () => {
    const t: PreviewTarget[] = [{ shipmentId: 's', attachmentUrl: 'u', fileName: 'f', orderNumber: null, mode: 'generate', hasItems: true, labelCount: 36, items: [] }];
    const on = (sheet: SheetDef) => formatCardTotal(labelCardSummary(t, { expirySticker: false }, sheet));
    expect(on(a40)).toBe('36枚（40面の用紙で約1枚）');
    expect(on(getSheet('A4_24')!)).toBe('36枚（24面の用紙で約2枚）');
    expect(on(roll)).toBe('36枚');
  });
  it('元 PDF の用紙は、全対象で同じと分かるときだけ', () => {
    expect(commonSourceSheet([gen('A4_24'), gen('A4_24')])).toBe('A4_24');
    expect(commonSourceSheet([gen('A4_24'), gen('A4_21')])).toBeNull();
    expect(commonSourceSheet([gen('A4_24'), gen(null)])).toBeNull();
    expect(commonSourceSheet([gen('???')])).toBeNull();
    expect(commonSourceSheet([])).toBeNull();
  });
  it('元の PDF の表示名は面数があれば添える', () => {
    expect(originalPdfName('A4_24')).toBe('元のPDF（Amazon・24面）');
    expect(originalPdfName(null)).toBe('元のPDF（Amazon）');
    expect(originalPdfName('unknown')).toBe('元のPDF（Amazon）');
  });
  it('作り直せない出荷: 帯・ボタンは面数つき、理由は対象のもの', () => {
    const info = asisCardInfo([asis('A4_24', '1品だけ FNSKU が入っていないため作り直せません')]);
    expect(info.bandText).toBe('24面（届いたPDFのまま）');
    expect(info.buttonLabel).toBe('24面のまま印刷');
    expect(info.reason).toBe('1品だけ FNSKU が入っていないため作り直せません');
    expect(info.sourceFaces).toBe('24面');
  });
  it('面数が分からなければ面数を書かない（推測しない）', () => {
    const info = asisCardInfo([asis(null, '理由')]);
    expect(info.bandText).toBe('届いたPDFのまま');
    expect(info.buttonLabel).toBe('そのまま印刷');
    expect(info.sourceFaces).toBeNull();
  });
  it('理由が無いときも文言が空にならない', () => {
    expect(asisCardInfo([asis('A4_21', null)]).reason).not.toBe('');
  });
});
