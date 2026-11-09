import { beforeAll, describe, expect, it } from 'vitest';
import { code128Bars } from '../../src/product-label/code128';
import { computeExpiryBox, computeLabelBox, CONDITION_GAP_EM, DEFAULT_LAYOUT_TUNING, DOT_300_PT, DOT_600_PT, layoutTuningFor, MIN_MODULE_PT, MM, REF_LABEL_HEIGHT_PT, SHEET_LAYOUT_OVERRIDES, nameRows, sheetCapabilities } from '../../src/product-label/label-layout';
import { cellRect, getSheet, SHEETS } from '../../src/product-label/sheets';
import { loadTextMeasurer, measureTextWidth } from './fonts';

beforeAll(async () => {
  await loadTextMeasurer();
});

const ALL_CONDITIONS = ['新品', '中古-可', '中古-良い', '中古-ほぼ新品', '中古-非常に良い', 'コレクター-非常に良い'];

/** FNSKU（通常）＋最小の隙間＋コンディション（通常）の必要幅（label-layout.ts の判定と同じ計算）。 */
function joinedWidth(fnSku: string, condition: string, fnSize: number, condSize: number) {
  return measureTextWidth(fnSku, fnSize, false) + condSize * CONDITION_GAP_EM + measureTextWidth(condition, condSize, false);
}

/** 用紙ごとの上書きを使わない（既定値）配置。 */
function box(sheetId: string, withImage: boolean, condition: string | null, withExtra = false) {
  const sheet = getSheet(sheetId)!;
  return computeLabelBox({ widthMm: sheet.labelW, heightMm: sheet.labelH, fnSku: 'X001ABCDE1', withImage, condition, measure: measureTextWidth, extras: withExtra ? ['SKU-ABC-001'] : [] });
}

/** 用紙ごとの上書き（グループ①②③）を使った配置。 */
function boxFor(sheetId: string, withImage: boolean, condition: string | null, extras: string[] = []) {
  const sheet = getSheet(sheetId)!;
  return computeLabelBox({ sheetId, widthMm: sheet.labelW, heightMm: sheet.labelH, fnSku: 'X001ABCDE1', withImage, condition, measure: measureTextWidth, extras });
}

describe('文字サイズは用紙の高さに比例（40面: FNSKU 9pt・コンディション 9pt・商品名 9pt・SKU 9pt）', () => {
  it('40面は基準高さ 84.17pt に対する比率で 9 / 9 / 9 / 9pt（実寸 29.46mm なので約 0.99 倍）', () => {
    const b = box('A4_40_52x29', false, '新品');
    const k = b.height / REF_LABEL_HEIGHT_PT;
    expect(b.fontSize).toBeCloseTo(9 * k, 5);
    expect(b.conditionFontSize).toBeCloseTo(9 * k, 5);
    expect(b.nameFontSize).toBeCloseTo(9 * k, 5);
    expect(b.extraFontSize).toBeCloseTo(9 * k, 5);
    expect(b.fontSize).toBeCloseTo(9, 0);
    expect(b.nameLines).toBe(2);
  });
  it('他の用紙も同じ比率で拡大縮小（21面・ロール紙）', () => {
    for (const id of ['A4_21', 'ROLL_50x30']) {
      const b = box(id, false, '新品');
      const k = b.height / REF_LABEL_HEIGHT_PT;
      expect(b.fontSize / k).toBeCloseTo(9, 5);
      expect(b.conditionFontSize / k).toBeCloseTo(9, 5);
      expect(b.nameFontSize / k).toBeCloseTo(9, 5);
    }
    expect(box('A4_21', false, '新品').fontSize).toBeGreaterThan(box('A4_40_52x29', false, '新品').fontSize);
  });
});

describe('コンディションの置き場所（実測。FNSKU 通常＋隙間 0.3em＋コンディション通常）', () => {
  it('40面・画像なしは 中古-非常に良い まで全コンディションが同じ行', () => {
    for (const c of ALL_CONDITIONS.slice(0, 5)) {
      const b = box('A4_40_52x29', false, c);
      expect(b.conditionOwnLine, c).toBe(false);
      expect(joinedWidth('X001ABCDE1', c, b.fontSize, b.conditionFontSize), c).toBeLessThanOrEqual(b.text.w);
    }
  });
  it('40面・画像あり は入らなければ次の行（縮小・省略しない）', () => {
    const b = box('A4_40_52x29', true, '中古-非常に良い');
    const need = joinedWidth('X001ABCDE1', '中古-非常に良い', b.fontSize, b.conditionFontSize);
    expect(b.conditionOwnLine).toBe(need > b.text.w);
    expect(b.conditionOwnLine).toBe(true);
    expect(box('A4_40_52x29', true, '新品').conditionOwnLine).toBe(false);
  });
  it('40面・画像なし・コレクター-非常に良い（157pt > 行幅 137pt）は次の行', () => {
    expect(box('A4_40_52x29', false, 'コレクター-非常に良い').conditionOwnLine).toBe(true);
  });
  it('21面・画像なしは 中古-非常に良い まで同じ行（FNSKU 通常 9pt）', () => {
    for (const c of ALL_CONDITIONS.slice(0, 5)) expect(box('A4_21', false, c).conditionOwnLine, c).toBe(false);
  });
  it('条件なしは同じ行扱い', () => {
    expect(box('A4_40_52x29', true, null).conditionOwnLine).toBe(false);
  });
  it('同じ行かの判定は「FNSKU＋隙間＋コンディション ≤ 行幅」と一致（文字は縮めない）', () => {
    for (const id of ['A4_40_52x29', 'A4_21']) {
      for (const img of [false, true]) {
        for (const c of ALL_CONDITIONS) {
          const b = box(id, img, c);
          const need = joinedWidth('X001ABCDE1', c, b.fontSize, b.conditionFontSize);
          expect(b.conditionOwnLine, `${id} ${img} ${c}`).toBe(need > b.text.w);
        }
      }
    }
  });
});

describe('文字領域の左右の余白', () => {
  it('どの用紙も幅の 6%（四隅の余白以上）で左右対称、バーコードの左右端（7.8%）より内側', () => {
    for (const sheet of SHEETS) {
      const b = box(sheet.id, false, '新品');
      expect(b.text.x / b.width, sheet.id).toBeCloseTo(Math.max(b.pad / b.width, DEFAULT_LAYOUT_TUNING.textSideMarginRatio), 5);
      expect(b.text.x, sheet.id).toBeGreaterThanOrEqual(b.pad - 1e-9);
      expect(b.width - (b.text.x + b.text.w), sheet.id).toBeCloseTo(b.text.x, 5);
    }
  });
  it('40面・画像なしで 中古-非常に良い が同じ行に収まる限界に近い（余白をこれ以上広げると収まらない）', () => {
    const b = box('A4_40_52x29', false, '中古-非常に良い');
    const need = joinedWidth('X001ABCDE1', '中古-非常に良い', b.fontSize, b.conditionFontSize);
    expect(need).toBeLessThanOrEqual(b.text.w);
    expect(need).toBeGreaterThan(b.text.w - 10); // FNSKU を通常ウェイトにしたぶん余裕ができた
  });
});

describe('商品名の行数', () => {
  it('コンディションが次の行で高さが足りないときは 1 行（本文の高さに収まる）', () => {
    const b = box('A4_40_52x29', false, 'コレクター-非常に良い');
    expect(b.conditionOwnLine).toBe(true);
    expect(b.nameLines).toBe(1);
    expect((b.fontSize + b.conditionFontSize + b.nameFontSize * b.nameLines) * 1.2).toBeLessThanOrEqual(b.text.h);
  });
  it('追加項目（出品者SKU）なしは最大 2 行', () => {
    expect(box('A4_40_52x29', false, '新品').nameLines).toBe(2);
    expect(box('A4_21', false, '新品').nameLines).toBe(2);
  });
  it('出品者SKUありは用紙によらず 1 行（文字サイズは同じ）', () => {
    for (const id of ['A4_40_52x29', 'A4_21', 'ROLL_50x30']) {
      const off = box(id, false, '新品', false);
      const on = box(id, false, '新品', true);
      expect(on.nameLines, id).toBe(1);
      expect(on.nameFontSize, id).toBe(off.nameFontSize);
      expect(on.extraFontSize, id).toBe(off.extraFontSize);
    }
  });
  it('40面・SKU ありで文字が本文の高さに収まる', () => {
    const b = box('A4_40_52x29', false, '中古-非常に良い', true);
    const h = (b.fontSize + b.nameFontSize * b.nameLines + b.extraFontSize) * 1.2;
    expect(h).toBeLessThanOrEqual(b.text.h);
  });
});

describe('バーコードの位置と大きさは固定', () => {
  it('画像・出品者SKU・コンディション別行の有無によらず、x・y・w・h が同じ', () => {
    for (const id of ['A4_40_52x29', 'A4_21']) {
      const s = getSheet(id)!;
      const results = [];
      for (const withImage of [false, true]) {
        for (const withExtra of [false, true]) {
          for (const condition of [null, '新品', '中古-非常に良い']) {
            const b = computeLabelBox({ widthMm: s.labelW, heightMm: s.labelH, fnSku: 'X001ABCDE1', withImage, condition, measure: measureTextWidth, extras: withExtra ? ['SKU-ABC-001'] : [] });
            results.push(b.barcode);
          }
        }
      }
      for (const r of results) expect(r).toEqual(results[0]);
    }
  });
});

describe('バーコードは Amazon 純正の比率', () => {
  it('どの用紙も 幅78.8%・高さ35.6%・上余白は四隅と同じ、左右の余白は7.8%以上、四隅の余白は約2mm', () => {
    for (const sheet of SHEETS) {
      const b = box(sheet.id, true, '新品');
      const bc = b.barcode;
      expect(bc.w / b.width, sheet.id).toBeCloseTo(DEFAULT_LAYOUT_TUNING.barcodeWidthRatio, 5);
      expect(bc.y, sheet.id).toBeCloseTo(b.pad, 5);
      expect(bc.h / b.height, sheet.id).toBeCloseTo(DEFAULT_LAYOUT_TUNING.barcodeHeightRatio, 5);
      expect(bc.x / b.width, sheet.id).toBeGreaterThanOrEqual(DEFAULT_LAYOUT_TUNING.barcodeMinSideRatio);
      expect((b.width - bc.x - bc.w) / b.width, sheet.id).toBeGreaterThanOrEqual(DEFAULT_LAYOUT_TUNING.barcodeMinSideRatio);
      expect(bc.offsetModules).toBe(0);
      expect(b.pad, sheet.id).toBeGreaterThanOrEqual(Math.min(2 * MM, Math.min(b.width, b.height) * 0.1) - 1e-9);
      // 文字はバーの下に収まり、下端の余白も確保される
      expect(b.body.y, sheet.id).toBeGreaterThanOrEqual(bc.y + bc.h);
      expect(b.body.y + b.body.h, sheet.id).toBeLessThanOrEqual(b.height - b.pad + 1e-9);
    }
  });
  it('全用紙・FNSKU 10 文字で 1 モジュールが 0.25mm 以上（読み取り可能）', () => {
    const { totalModules } = code128Bars('X001ABCDE1');
    for (const sheet of SHEETS) {
      const b = box(sheet.id, false, null);
      expect(b.barcode.moduleW * totalModules).toBeCloseTo(b.barcode.w, 5);
      expect(b.barcode.moduleW, sheet.id).toBeGreaterThanOrEqual(MIN_MODULE_PT);
    }
  });
});

describe('A4 シートのバーコードは 300/600dpi の格子にそろえる（ロール紙は従来どおり）', () => {
  const isInt = (v: number) => Math.abs(v - Math.round(v)) < 1e-6;
  const { totalModules } = code128Bars('X001ABCDE1');
  const sheetsOnly = SHEETS.filter((s) => s.kind === 'sheet');
  it('シート用紙: モジュール幅が 1/300 インチの整数倍（3 以上）で、許される幅に収まり、左右中央', () => {
    expect(sheetsOnly.length).toBeGreaterThan(0);
    for (const sheet of sheetsOnly) {
      const b = boxFor(sheet.id, false, null);
      const bc = b.barcode;
      const n = bc.moduleW / DOT_300_PT;
      expect(isInt(n), sheet.id).toBe(true);
      expect(Math.round(n), sheet.id).toBeGreaterThanOrEqual(3);
      expect(bc.w, sheet.id).toBeCloseTo(bc.moduleW * totalModules, 6);
      expect(bc.w, sheet.id).toBeLessThanOrEqual(b.width * DEFAULT_LAYOUT_TUNING.barcodeWidthRatio + 1e-6);
      // 1 段大きい整数倍は許される幅に収まらない（= 最大）
      expect((Math.round(n) + 1) * DOT_300_PT * totalModules, sheet.id).toBeGreaterThan(b.width * DEFAULT_LAYOUT_TUNING.barcodeWidthRatio);
      expect(bc.x / b.width, sheet.id).toBeGreaterThanOrEqual(DEFAULT_LAYOUT_TUNING.barcodeMinSideRatio);
      // 原点 0 なら中央から 1/600 インチ以内
      expect(Math.abs(bc.x - (b.width - bc.w) / 2), sheet.id).toBeLessThanOrEqual(DOT_300_PT / 2 + 1e-6);
    }
  });
  it('シート用紙: 全セル・微調整オフセットありでも左端が用紙原点基準で 1/300（＝1/600 にも乗る）インチの格子', () => {
    for (const sheet of sheetsOnly) {
      for (const [ox, oy] of [[0, 0], [0.7, -0.3], [-1.23, 0.5]]) {
        for (const [row, col] of [[0, 0], [0, sheet.cols - 1], [sheet.rows - 1, 1 % sheet.cols]]) {
          const rect = cellRect(sheet, row, col, ox, oy);
          const b = computeLabelBox({ sheetId: sheet.id, originXmm: rect.x, widthMm: sheet.labelW, heightMm: sheet.labelH, fnSku: 'X001ABCDE1', withImage: false, condition: null, measure: measureTextWidth });
          const abs = rect.x * MM + b.barcode.x;
          expect(isInt(abs / DOT_600_PT), `${sheet.id} ${row},${col},${ox}`).toBe(true);
          expect(isInt(abs / DOT_300_PT), `${sheet.id} ${row},${col},${ox} 300dpi`).toBe(true);
          const centered = rect.x * MM + (b.width - b.barcode.w) / 2;
          expect(Math.abs(abs - centered)).toBeLessThanOrEqual(DOT_300_PT / 2 + 1e-6);
          expect(b.barcode.x / b.width).toBeGreaterThanOrEqual(DEFAULT_LAYOUT_TUNING.barcodeMinSideRatio);
          expect((b.width - b.barcode.x - b.barcode.w) / b.width).toBeGreaterThanOrEqual(DEFAULT_LAYOUT_TUNING.barcodeMinSideRatio);
        }
      }
    }
  });
  it('新しい 24 面（66×33.9）・44 面（48.3×25.4）でもバーコードと文字がラベルからはみ出さない', () => {
    for (const id of ['A4_24', 'A4_44_48x25']) {
      const sheet = getSheet(id)!;
      for (const image of [false, true]) {
        const b = boxFor(id, image, '中古-非常に良い');
        const w = sheet.labelW * MM, h = sheet.labelH * MM;
        expect(b.barcode.x, id).toBeGreaterThanOrEqual(0);
        expect(b.barcode.x + b.barcode.w, id).toBeLessThanOrEqual(w + 1e-6);
        expect(b.barcode.y + b.barcode.h, id).toBeLessThanOrEqual(h + 1e-6);
        expect(b.text.x + b.text.w, id).toBeLessThanOrEqual(w + 1e-6);
        expect(b.text.y + b.text.h, id).toBeLessThanOrEqual(h + 1e-6);
      }
    }
  });
  it('高さ・上余白は変わらない', () => {
    for (const sheet of sheetsOnly) {
      const t = layoutTuningFor(sheet.id);
      const bc = boxFor(sheet.id, false, null).barcode;
      const h = sheet.labelH * MM;
      expect(bc.h).toBeCloseTo(Math.min(h * t.barcodeHeightRatio, t.barcodeMaxHeightMm !== null ? t.barcodeMaxHeightMm * MM : Infinity), 9);
      expect(bc.y).toBeCloseTo(Math.min(2 * MM, Math.min(sheet.labelW * MM, h) * 0.1), 9);
    }
  });
  it('ロール紙: 従来どおり（幅 78.8%・格子にそろえない）', () => {
    const rolls = SHEETS.filter((s) => s.kind === 'roll');
    expect(rolls.length).toBeGreaterThan(0);
    for (const sheet of rolls) {
      const b = boxFor(sheet.id, false, null);
      const old = computeLabelBox({ widthMm: sheet.labelW, heightMm: sheet.labelH, fnSku: 'X001ABCDE1', withImage: false, condition: null, measure: measureTextWidth }).barcode;
      expect(b.barcode, sheet.id).toEqual(old);
      expect(b.barcode.w / b.width, sheet.id).toBeCloseTo(DEFAULT_LAYOUT_TUNING.barcodeWidthRatio, 5);
    }
  });
});

describe('期限シール（左に縦書き「期限」＋右に年・月日の 2 段＋下端に FNSKU）', () => {
  it('全用紙: 上の余白 ≥ 高さの 15%・左右の余白 ≥ 幅の 10%・まとまりは FNSKU の行の上に収まる・見出しは日付の 70%・間は見出しの 0.6 字', () => {
    for (const sheet of SHEETS) {
      const e = computeExpiryBox(sheet.labelW, sheet.labelH);
      const h = sheet.labelH * MM;
      const w = sheet.labelW * MM;
      expect((e.centerY - e.blockH / 2) / h, sheet.id).toBeGreaterThanOrEqual(0.15 - 1e-9);
      expect(e.centerY + e.blockH / 2, sheet.id).toBeLessThanOrEqual(e.footer.y + 1e-9);
      expect((w - e.blockW) / 2 / w, sheet.id).toBeGreaterThanOrEqual(0.1 - 1e-9);
      expect(e.headingSize / e.bigSize, sheet.id).toBeCloseTo(0.7, 9);
      expect(e.gap / e.headingSize, sheet.id).toBeCloseTo(0.6, 9);
      expect(e.headingW, sheet.id).toBeCloseTo(e.headingSize, 9);
      // 見出し 2 字を縦に並べた高さは日付 2 段の高さに収まる（その中央に置く）
      expect(e.headingLineH * 2, sheet.id).toBeLessThanOrEqual(e.blockH + 1e-9);
      // FNSKU は通常ウェイトの 9pt 相当（用紙の高さに比例）で、ラベルの下端に収まる
      expect(e.footer.size / (h / REF_LABEL_HEIGHT_PT), sheet.id).toBeCloseTo(DEFAULT_LAYOUT_TUNING.fnSkuSizePt, 9);
      expect(e.footer.y + e.footer.lineH, sheet.id).toBeLessThanOrEqual(h + 1e-9);
    }
  });
  it('日付の列幅は「12月31日」（太字）の実測幅より少し広い（折り返さない）', () => {
    const e = computeExpiryBox(52.5, 29.46);
    expect(e.columnW / e.bigSize).toBeGreaterThanOrEqual(measureTextWidth('12月31日', 1, true) - 1e-6);
    expect(e.columnW / e.bigSize).toBeLessThan(measureTextWidth('12月31日', 1, true) + 0.2);
  });
  it('40 面は幅で制限される（収まる範囲で最大）: 左右の余白がちょうど 10%', () => {
    const s = getSheet('A4_40_52x29')!;
    const e = computeExpiryBox(s.labelW, s.labelH);
    expect((s.labelW * MM - e.blockW) / 2 / (s.labelW * MM)).toBeCloseTo(0.1, 9);
  });
});

describe('用紙ごとのレイアウト上書き（表は 1 か所。40 面が基準）', () => {
  it('40 面は既定値のまま。表にある用紙は 50x30/62x29（40面並み）・大きい 2 種・小さい 2 種', () => {
    expect(layoutTuningFor('A4_40_52x29')).toEqual(DEFAULT_LAYOUT_TUNING);
    expect(layoutTuningFor(undefined)).toEqual(DEFAULT_LAYOUT_TUNING);
    expect(Object.keys(SHEET_LAYOUT_OVERRIDES).sort()).toEqual(
      ['ROLL_50x30', 'ROLL_62x29', 'A4_21', 'A4_24', 'A4_44_48x25', 'ROLL_50.8x25.4'].sort(),
    );
    for (const id of Object.keys(SHEET_LAYOUT_OVERRIDES)) expect(getSheet(id), id).toBeTruthy();
  });
  it('上書きした項目だけ変わり、他は既定のまま（計算に反映される）', () => {
    const s = getSheet('A4_40_52x29')!;
    const before = box('A4_40_52x29', false, null);
    SHEET_LAYOUT_OVERRIDES[s.id] = { fnSkuSizePt: 12, expiryMinVMarginRatio: 0.3 };
    try {
      const t = layoutTuningFor(s.id);
      expect(t.fnSkuSizePt).toBe(12);
      expect(t.nameSizePt).toBe(DEFAULT_LAYOUT_TUNING.nameSizePt);
      const after = computeLabelBox({ widthMm: s.labelW, heightMm: s.labelH, fnSku: 'X001ABCDE1', withImage: false, condition: null, measure: measureTextWidth, sheetId: s.id });
      expect(after.fontSize).toBeCloseTo(before.fontSize * (12 / DEFAULT_LAYOUT_TUNING.fnSkuSizePt), 9);
      expect(computeExpiryBox(s.labelW, s.labelH, s.id).bigSize).toBeLessThan(computeExpiryBox(s.labelW, s.labelH).bigSize);
    } finally {
      delete SHEET_LAYOUT_OVERRIDES[s.id];
    }
  });
});

describe('用紙グループ（①40面並み ②大きい ③小さい）', () => {
  const G1 = ['ROLL_50x30', 'ROLL_62x29'];
  const G2 = ['A4_21', 'A4_24'];
  const G3 = ['A4_44_48x25', 'ROLL_50.8x25.4'];
  it('①は文字が 40 面と同じ pt（FNSKU・コンディション・商品名・追加項目すべて）', () => {
    const base = boxFor('A4_40_52x29', false, '新品');
    for (const id of G1) {
      const b = boxFor(id, false, '新品', ['SKU-1']);
      expect(b.fontSize, id).toBeCloseTo(base.fontSize, 9);
      expect(b.conditionFontSize, id).toBeCloseTo(base.conditionFontSize, 9);
      expect(b.nameFontSize, id).toBeCloseTo(base.nameFontSize, 9);
      expect(b.extraFontSize, id).toBeCloseTo(base.extraFontSize, 9);
    }
  });
  it('②は文字 10pt まで・バーコード高さは 10.6mm まで', () => {
    for (const id of G2) {
      const b = boxFor(id, false, '新品');
      expect(b.fontSize, id).toBeLessThanOrEqual(10 + 1e-9);
      expect(b.nameFontSize, id).toBeLessThanOrEqual(10 + 1e-9);
      expect(b.barcode.h, id).toBeLessThanOrEqual(10.6 * MM + 1e-9);
    }
  });
  it('③は文字 8pt 以上・商品名 1 行・画像は指定しても出ない', () => {
    for (const id of G3) {
      const b = boxFor(id, true, '新品');
      expect(b.fontSize, id).toBeGreaterThanOrEqual(8 - 1e-9);
      expect(b.nameLines, id).toBe(1);
      expect(b.image, id).toBeNull();
    }
  });
  it('②の商品名は余った高さで 2 行になれる', () => {
    expect(boxFor('A4_24', false, '新品').nameLines).toBe(2);
  });
});

describe('用紙ごとに選べる追加項目の数（本文の高さから自動）', () => {
  const expected: Record<string, number> = {
    A4_21: 2,
    A4_24: 2,
    A4_40_52x29: 1,
    ROLL_50x30: 1,
    ROLL_62x29: 1,
    A4_44_48x25: 0,
    'ROLL_50.8x25.4': 0,
  };
  it.each(Object.entries(expected))('%s は %i つ', (id, n) => {
    expect(sheetCapabilities(getSheet(id)!).maxExtras).toBe(n);
  });
  it('全用紙: 上限が 0 なら画像も不可、上限は 0〜2', () => {
    for (const sheet of SHEETS) {
      const c = sheetCapabilities(sheet);
      expect(c.maxExtras, sheet.id).toBeGreaterThanOrEqual(0);
      expect(c.maxExtras, sheet.id).toBeLessThanOrEqual(2);
      if (c.maxExtras === 0 && layoutTuningFor(sheet.id).maxExtras === 0) expect(c.image, sheet.id).toBe(false);
    }
  });
});

describe('全用紙 × 画像 × 追加項目 × コンディション で本文からはみ出さない', () => {
  const extraSets: string[][] = [[], ['SKU-ABC-001'], ['要期限'], ['3点入'], ['SKU-ABC-001', '要期限'], ['要期限', '3点入'], ['SKU-ABC-001', '3点入']];
  const conds: (string | null)[] = [null, '新品', '中古-非常に良い', 'コレクター-非常に良い'];
  it('積んだ行の高さが本文の高さ以内、省略数は選んだ数以内', () => {
    for (const sheet of SHEETS) {
      for (const image of [false, true]) {
        for (const extras of extraSets) {
          for (const condition of conds) {
            const b = boxFor(sheet.id, image, condition, extras);
            const rowCond = Math.max(b.conditionFontSize, b.extras.some((e) => e.placement === 'withCondition') ? b.extraFontSize : 0);
            const rows = b.extras.filter((e) => e.placement === 'row').length;
            const used = (b.fontSize + (b.conditionOwnLine ? rowCond : 0) + b.nameFontSize * b.nameLines + b.extraFontSize * rows) * 1.2;
            const tag = `${sheet.id} img=${image} ${extras.join('+')} ${condition}`;
            expect(used, tag).toBeLessThanOrEqual(b.text.h + 1e-6);
            expect(b.extras.length + b.extrasOmitted, tag).toBe(extras.length);
            expect(b.extras.length, tag).toBeLessThanOrEqual(sheetCapabilities(sheet).maxExtras);
          }
        }
      }
    }
  });
});

describe('nameRows（商品名の行分け。ハイフンを足さない・区切り優先で省略）', () => {
  // 全角 10・半角 5 の等幅。
  const m = (t: string) => Array.from(t).reduce((s, c) => s + (c.charCodeAt(0) <= 0xff ? 5 : 10), 0);
  it('入りきるときは文字単位で折り返し、行末に「-」を足さない', () => {
    const rows = nameRows('とても長い名前のテスト商品名です', 90, m, 2);
    expect(rows.join('')).toBe('とても長い名前のテスト商品名です');
    expect(rows.length).toBe(2);
    for (const r of rows) {
      expect(r.endsWith('-')).toBe(false);
      expect(m(r)).toBeLessThanOrEqual(90);
    }
  });
  it('英単語は次の行へ丸ごと回す（収まらない 1 語だけ文字で分ける）', () => {
    expect(nameRows('Sample Long Product', 80, m, 2)).toEqual(['Sample Long', 'Product']);
    expect(nameRows('ABCDEFGHIJKLMNOP', 80, m, 2)).toEqual(['ABCDEFGHIJKLMNOP']);
    expect(nameRows('ABCDEFGHIJKLMNOP', 50, m, 2)).toEqual(['ABCDEFGHIJ', 'KLMNOP']);
  });
  it('名前の中の「-」はそのまま残る', () => {
    expect(nameRows('ABC-123', 200, m, 2)).toEqual(['ABC-123']);
  });
  it('入りきらない 2 行: 1 行目＝先頭、2 行目＝「…」＋末尾（区切りの直後から。500ml が 0ml にならない）', () => {
    const rows = nameRows('サンプル商品名 とても長い名前のテスト用の商品です 500ml 3個セット', 140, m, 2);
    expect(rows.length).toBe(2);
    expect(rows[0].startsWith('サンプル商品名')).toBe(true);
    expect(rows[1]).toBe('…500ml 3個セット');
    for (const r of rows) expect(m(r)).toBeLessThanOrEqual(140);
  });
  it('英数字の連続の途中で切らない（先頭側は語ごと落とす）', () => {
    const rows = nameRows('Sample Product ABCDEFGHIJKLMN Name Large Size 3 Pack Set', 100, m, 2);
    expect(rows[0]).toBe('Sample Product');
    expect(rows[1].startsWith('…')).toBe(true);
    expect(rows[1]).toBe('…Size 3 Pack Set');
  });
  it('区切りが無い長い名前は文字単位（行幅いっぱい）', () => {
    const rows = nameRows('あいうえおかきくけこさしすせそたちつてとなにぬねの', 50, m, 2);
    expect(rows[0]).toBe('あいうえお');
    expect(rows[1].startsWith('…')).toBe(true);
    expect(m(rows[1])).toBeLessThanOrEqual(50);
    expect(rows[1].endsWith('ぬねの')).toBe(true);
  });
  it('1 行モードは「先頭…末尾」の 1 行で、末尾は区切りの直後から', () => {
    const rows = nameRows('サンプル商品名とても長い名前のテスト 500ml 3個セット', 150, m, 1);
    expect(rows.length).toBe(1);
    expect(rows[0]).toContain('…');
    expect(rows[0].endsWith('500ml 3個セット') || rows[0].endsWith('3個セット')).toBe(true);
    expect(m(rows[0])).toBeLessThanOrEqual(150);
  });
});

describe('追加項目の置き場所（コンディション別行でも切れない）', () => {
  const cond = '中古-非常に良い';
  function sku(sheetId: string, withImage: boolean, text = 'SKU-ABC-001') {
    return boxFor(sheetId, withImage, cond, [text]);
  }
  function usedHeight(b: ReturnType<typeof sku>) {
    const rowCond = Math.max(b.conditionFontSize, b.extras.some((e) => e.placement === 'withCondition') ? b.extraFontSize : 0);
    const rows = b.extras.filter((e) => e.placement === 'row').length;
    return (b.fontSize + (b.conditionOwnLine ? rowCond : 0) + b.nameFontSize * b.nameLines + b.extraFontSize * rows) * 1.2;
  }
  it.each([
    ['40面 画像あり', 'A4_40_52x29', true],
    ['44面 画像あり', 'A4_44_48x25', true],
    ['ロール62x29 画像あり', 'ROLL_62x29', true],
    ['ロール62x29 画像なし', 'ROLL_62x29', false],
  ])('%s: 出すなら本文の高さに収まり、出せないなら省略数が立つ', (_n, id, image) => {
    const b = sku(id, image);
    if (b.extras.length === 0) expect(b.extrasOmitted).toBe(1);
    else {
      expect(b.extrasOmitted).toBe(0);
      expect(usedHeight(b)).toBeLessThanOrEqual(b.text.h + 1e-6);
    }
    expect(b.nameLines).toBeGreaterThanOrEqual(1);
  });
  it('追加項目が短ければコンディション行の右端に同居し、行は増えない', () => {
    const b = sku('A4_40_52x29', true, 'A1');
    expect(b.conditionOwnLine).toBe(true);
    expect(b.extras[0]?.placement).toBe('withCondition');
  });
  it('コンディションが別行で追加項目が長いと最下行か省略（40面 画像あり）', () => {
    const b = sku('A4_40_52x29', true, 'VERY-LONG-SELLER-SKU-0123456789');
    if (b.extras.length === 0) expect(b.extrasOmitted).toBe(1);
    else expect(b.extras[0].placement).toBe('row');
  });
  it('③（44面）は追加項目を選んでも出ず、省略数に数える', () => {
    const b = boxFor('A4_44_48x25', false, '新品', ['要期限']);
    expect(b.extras).toEqual([]);
    expect(b.extrasOmitted).toBe(1);
  });
});

describe('長い追加項目（出品者SKU）の省略', () => {
  it('行幅に入る分で末尾を … にする（はみ出さない）', () => {
    const long = 'VERY-LONG-SELLER-SKU-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789';
    for (const id of ['A4_40_52x29', 'A4_21', 'A4_24', 'A4_44_48x25']) {
      const b = boxFor(id, true, '中古-非常に良い', [long]);
      for (const e of b.extras) {
        expect(measureTextWidth(e.text, b.extraFontSize, false), id).toBeLessThanOrEqual(b.text.w + 1e-6);
        if (e.text !== long) expect(e.text.endsWith('…'), id).toBe(true);
      }
    }
  });
});
