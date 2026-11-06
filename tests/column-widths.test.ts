import { describe, expect, it } from 'vitest';
import {
  clampColumnWidth,
  diffColumnWidthsFromDefaults,
  parseSavedColumnWidths,
  resolveColumnWidths,
  serializeColumnWidths,
  withColumnWidth,
  withoutColumnWidth,
  type ColumnWidthSpec,
} from '../src/lib/column-widths';

const SPECS: ColumnWidthSpec[] = [
  { key: 'asin', defaultWidth: 160, minWidth: 100 },
  { key: 'name', defaultWidth: null, minWidth: 160 },
  { key: 'fixed', defaultWidth: 40, resizable: false },
];

describe('column-widths', () => {
  it('clampColumnWidth は最小幅以上の整数に丸める', () => {
    expect(clampColumnWidth(80.4, 100)).toBe(100);
    expect(clampColumnWidth(150.6, 100)).toBe(151);
    expect(clampColumnWidth(NaN, 100)).toBe(100);
  });

  it('parse は壊れた JSON・知らない列・固定列・不正値を捨てる', () => {
    expect(parseSavedColumnWidths(null, SPECS)).toEqual({});
    expect(parseSavedColumnWidths('{oops', SPECS)).toEqual({});
    expect(parseSavedColumnWidths('[1,2]', SPECS)).toEqual({});
    expect(parseSavedColumnWidths(JSON.stringify({ asin: 220, zzz: 90, fixed: 99, name: 'x' }), SPECS)).toEqual({ asin: 220 });
    expect(parseSavedColumnWidths(JSON.stringify({ asin: 10, name: -5 }), SPECS)).toEqual({ asin: 100 });
  });

  it('既定と同じ幅は保存しない（auto 列は値があれば保存）', () => {
    expect(diffColumnWidthsFromDefaults({ asin: 160, name: 300 }, SPECS)).toEqual({ name: 300 });
    expect(serializeColumnWidths({ asin: 160 }, SPECS)).toBe('{}');
  });

  it('resolve は変えた列だけ上書きし、固定列は既定のまま', () => {
    expect(resolveColumnWidths(SPECS, { asin: 200, fixed: 90 })).toEqual({ asin: 200, name: null, fixed: 40 });
  });

  it('withColumnWidth / withoutColumnWidth', () => {
    expect(withColumnWidth({}, SPECS, 'asin', 50)).toEqual({ asin: 100 });
    expect(withColumnWidth({ asin: 200 }, SPECS, 'asin', 160)).toEqual({});
    expect(withColumnWidth({}, SPECS, 'fixed', 99)).toEqual({});
    expect(withoutColumnWidth({ asin: 200, name: 300 }, 'asin')).toEqual({ name: 300 });
  });
});
