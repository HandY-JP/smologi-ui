import { describe, expect, it } from 'vitest';
import { fitName, formatExpiry, conditionDisplayName, truncateEndToWidth, truncateMiddle, visualLength } from '../../src/product-label/text';

describe('truncateMiddle', () => {
  it('収まるならそのまま', () => {
    expect(truncateMiddle('りんごジュース', 10)).toBe('りんごジュース');
  });
  it('先頭＋…＋末尾で、指定文字数に収まる', () => {
    const out = truncateMiddle('あいうえおかきくけこさしすせそ', 8);
    expect(Array.from(out)).toHaveLength(8);
    expect(out).toContain('…');
    expect(out.startsWith('あいう')).toBe(true);
    expect(out.endsWith('そ')).toBe(true);
  });
  it('極端に短い上限でも壊れない', () => {
    expect(truncateMiddle('abcdef', 1)).toBe('…');
    expect(truncateMiddle('abcdef', 2)).toBe('a…');
  });
});

describe('fitName', () => {
  it('半角は半分幅で数え、幅に収まる最長に省略する', () => {
    expect(visualLength('ab')).toBe(1);
    const out = fitName('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);
    expect(visualLength(out)).toBeLessThanOrEqual(10);
    expect(out).toContain('…');
    expect(out.endsWith('9')).toBe(true);
  });
  it('収まるなら変えない', () => {
    expect(fitName('短い名前', 10)).toBe('短い名前');
  });
});

describe('formatExpiry', () => {
  it('年と月日の 2 行にする', () => {
    expect(formatExpiry('2027-08-31')).toEqual({ year: '2027年', monthDay: '8月31日' });
    expect(formatExpiry('2026-12-01')).toEqual({ year: '2026年', monthDay: '12月1日' });
  });
  it('不正な値・存在しない日付は null', () => {
    expect(formatExpiry('2027-02-30')).toBeNull();
    expect(formatExpiry('2027/08/31')).toBeNull();
    expect(formatExpiry('')).toBeNull();
    expect(formatExpiry(null)).toBeNull();
  });
});

describe('conditionDisplayName', () => {
  it('生値から対応表で決める（大文字小文字・アンダースコアは無視）', () => {
    expect(conditionDisplayName('NewItem', null)).toBe('新品');
    expect(conditionDisplayName('new_new', '何か')).toBe('新品');
    expect(conditionDisplayName('UsedLikeNew', null)).toBe('中古-ほぼ新品');
    expect(conditionDisplayName('used_very_good', '違う表記')).toBe('中古-非常に良い');
    expect(conditionDisplayName('UsedGood', null)).toBe('中古-良い');
    expect(conditionDisplayName('used_acceptable', null)).toBe('中古-可');
  });
  it('対応表に無い値（コレクター・再生品・未知）は null（生成せず asis）', () => {
    expect(conditionDisplayName('Collectible', 'コレクター商品')).toBeNull();
    expect(conditionDisplayName('collectible_very_good', null)).toBeNull();
    expect(conditionDisplayName('Refurbished', '再生品')).toBeNull();
    expect(conditionDisplayName(null, '新品')).toBeNull();
  });
});

describe('truncateEndToWidth', () => {
  const m = (s: string) => Array.from(s).length * 10;
  it('収まるならそのまま', () => expect(truncateEndToWidth('ABCDE', 50, m)).toBe('ABCDE'));
  it('収まらないときは幅に入る分で末尾を … にする', () => {
    const r = truncateEndToWidth('ABCDEFGHIJ', 50, m);
    expect(r).toBe('ABCD…');
    expect(m(r)).toBeLessThanOrEqual(50);
  });
  it('極端に狭くても … だけは返す', () => expect(truncateEndToWidth('ABC', 5, m)).toBe('…'));
});
