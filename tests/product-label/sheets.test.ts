import { describe, expect, it } from 'vitest';
import {
  cellOfIndex, cellRect, clampStart, getSheet, groupedSheets, layoutLabels, numberOfCell, resolveSourceSheetId, SHEETS, sheetFacesName, sourceFacesName, summarizeLabels,
} from '../../src/product-label/sheets';

const A40 = getSheet('A4_40_52x29')!;
const A21 = getSheet('A4_21')!;

describe('用紙定義', () => {
  it('A4 の 4 種（21・24・40・44 面）とロール 3 種だけがある。削除した用紙は無い', () => {
    const ids = SHEETS.map((s) => s.id);
    for (const id of ['A4_21', 'A4_24', 'A4_40_52x29', 'A4_44_48x25']) {
      expect(ids).toContain(id);
    }
    for (const id of ['A4_24i', 'A4_24_64x33', 'A4_24_66x35', 'A4_24_70x36', 'A4_24_70x37', 'A4_27']) {
      expect(ids).not.toContain(id);
      expect(getSheet(id)).toBeNull();
    }
    expect(SHEETS.filter((s) => s.kind === 'sheet')).toHaveLength(4);
    expect(SHEETS.filter((s) => s.kind === 'roll')).toHaveLength(3);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('面数 = 列 × 行で、全セルが用紙の中に収まる（A4）', () => {
    for (const s of SHEETS.filter((x) => x.kind === 'sheet')) {
      expect(s.faces).toBe(s.cols * s.rows);
      const last = cellRect(s, s.rows - 1, s.cols - 1);
      expect(last.x).toBeGreaterThanOrEqual(0);
      expect(last.y).toBeGreaterThanOrEqual(0);
      expect(last.x + last.w).toBeLessThanOrEqual(s.pageW + 0.01);
      expect(last.y + last.h).toBeLessThanOrEqual(s.pageH + 0.01);
    }
  });

  it('新しい 24 面は 66×33.9mm・3×8・上 12.9 / 左 6、44 面は 48.3×25.4mm・4×11・上 8.8 / 左 8.4・隙間なし', () => {
    const a24 = getSheet('A4_24')!;
    expect([a24.cols, a24.rows, a24.labelW, a24.labelH, a24.pitchX, a24.pitchY, a24.marginLeft, a24.marginTop]).toEqual([3, 8, 66, 33.9, 66, 33.9, 6, 12.9]);
    const a44 = getSheet('A4_44_48x25')!;
    expect([a44.cols, a44.rows, a44.labelW, a44.labelH, a44.pitchX, a44.pitchY, a44.marginLeft, a44.marginTop]).toEqual([4, 11, 48.3, 25.4, 48.3, 25.4, 8.4, 8.8]);
  });

  it('面数のグループ順 21/24/40/44/ロール', () => {
    expect(groupedSheets().map((g) => g.label)).toEqual(['21面', '24面', '40面', '44面', 'ロール紙']);
  });

  it('微調整はセルを動かす', () => {
    const base = cellRect(A40, 0, 0);
    const moved = cellRect(A40, 0, 0, 1.5, -0.5);
    expect(moved.x - base.x).toBeCloseTo(1.5);
    expect(moved.y - base.y).toBeCloseTo(-0.5);
  });
});

describe('番号の振り方', () => {
  it('横は左→右、縦は上→下（1↓2↓3）', () => {
    expect(cellOfIndex(A40, 'row', 0)).toEqual({ row: 0, col: 0 });
    expect(cellOfIndex(A40, 'row', 1)).toEqual({ row: 0, col: 1 });
    expect(cellOfIndex(A40, 'row', 4)).toEqual({ row: 1, col: 0 });
    expect(cellOfIndex(A40, 'column', 1)).toEqual({ row: 1, col: 0 });
    expect(cellOfIndex(A40, 'column', 10)).toEqual({ row: 0, col: 1 });
  });

  it('numberOfCell は cellOfIndex の逆', () => {
    for (const order of ['row', 'column'] as const) {
      for (let i = 0; i < A21.faces; i += 1) {
        const { row, col } = cellOfIndex(A21, order, i);
        expect(numberOfCell(A21, order, row, col)).toBe(i + 1);
      }
    }
  });
});

describe('開始位置と枚数', () => {
  it('開始位置は 1..面数に収める', () => {
    expect(clampStart(A40, 0)).toBe(1);
    expect(clampStart(A40, 99)).toBe(40);
    expect(clampStart(A40, Number.NaN)).toBe(1);
  });

  it('13 番から 30 枚: 用紙 2 枚、余り 38 - 30 + ... を数える', () => {
    // 13 番から 30 枚 → 使う面 = 12 + 30 = 42 → 用紙 2 枚、余り 80 - 42 = 38
    expect(summarizeLabels(A40, 13, 30)).toEqual({ labels: 30, start: 13, pages: 2, leftover: 38 });
    expect(summarizeLabels(A40, 1, 40)).toEqual({ labels: 40, start: 1, pages: 1, leftover: 0 });
    expect(summarizeLabels(A40, 1, 41)).toEqual({ labels: 41, start: 1, pages: 2, leftover: 39 });
    expect(summarizeLabels(A40, 40, 1)).toEqual({ labels: 1, start: 40, pages: 1, leftover: 0 });
    expect(summarizeLabels(A40, 5, 0).pages).toBe(0);
  });

  it('開始位置は最初の用紙にだけ効き、2 枚目は 1 番から', () => {
    const placed = layoutLabels(A40, 'row', 39, 4);
    expect(placed.map((p) => [p.page, p.row, p.col])).toEqual([
      [0, 9, 2], [0, 9, 3], [1, 0, 0], [1, 0, 1],
    ]);
    const col = layoutLabels(A40, 'column', 10, 3);
    expect(col.map((p) => [p.page, p.row, p.col])).toEqual([[0, 9, 0], [0, 0, 1], [0, 1, 1]]);
  });

  it('ロール紙は 1 ページ 1 ラベルで開始位置は無視', () => {
    const roll = getSheet('ROLL_50x30')!;
    expect(layoutLabels(roll, 'row', 7, 3).map((p) => p.page)).toEqual([0, 1, 2]);
    expect(summarizeLabels(roll, 7, 3)).toEqual({ labels: 3, start: 1, pages: 3, leftover: 0 });
  });
});

describe('元 PDF の用紙', () => {
  it('Seller が保存する pageType（Smologi の ID・Seller 側の短い名前）を用紙 ID にする。知らない値は null', () => {
    expect(resolveSourceSheetId('A4_21')).toBe('A4_21');
    expect(resolveSourceSheetId('A4_24')).toBe('A4_24');
    expect(resolveSourceSheetId('A4_40')).toBe('A4_40_52x29');
    expect(resolveSourceSheetId('A4_40_52x29')).toBe('A4_40_52x29');
    expect(resolveSourceSheetId('A4_99')).toBeNull();
    expect(resolveSourceSheetId(undefined)).toBeNull();
    expect(resolveSourceSheetId(24)).toBeNull();
  });
  it('面数の言い方', () => {
    expect(sheetFacesName(A40)).toBe('40面');
    expect(sheetFacesName(getSheet('ROLL_62x29')!)).toBe('ロール紙');
    expect(sourceFacesName('A4_24')).toBe('24面');
    expect(sourceFacesName(null)).toBeNull();
    expect(sourceFacesName('nope')).toBeNull();
  });
});
