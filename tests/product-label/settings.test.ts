import { describe, expect, it } from 'vitest';
import { DEFAULT_PRODUCT_LABEL_SETTINGS, normalizeProductLabelSettings, trimExtras, withSheet } from '../../src/product-label/settings';

describe('商品ラベル印刷の既定', () => {
  it('既定値と、壊れた保存値の読み込み', () => {
    expect(normalizeProductLabelSettings(undefined)).toEqual(DEFAULT_PRODUCT_LABEL_SETTINGS);
    expect(normalizeProductLabelSettings('x')).toEqual(DEFAULT_PRODUCT_LABEL_SETTINGS);
    expect(DEFAULT_PRODUCT_LABEL_SETTINGS).toEqual({
      sheet: 'A4_40_52x29', order: 'row', image: false, extra: [], expirySticker: false, offsetXmm: 0, offsetYmm: 0,
    });
  });

  it('未知の値は既定に倒し、微調整は 0.5 刻み・±10mm に収める', () => {
    const n = normalizeProductLabelSettings({ sheet: 'nope', order: 'x', extra: 'expiration', offsetXmm: 99, offsetYmm: 0.26 });
    expect(n.sheet).toBe('A4_40_52x29');
    expect(n.order).toBe('row');
    expect(n.extra).toEqual([]);
    expect(n.offsetXmm).toBe(10);
    expect(n.offsetYmm).toBe(0.5);
  });

  it('古い保存（extra が文字列 sku / none）は配列に読み替える', () => {
    expect(normalizeProductLabelSettings({ extra: 'sku' }).extra).toEqual(['sku']);
    expect(normalizeProductLabelSettings({ extra: 'none' }).extra).toEqual([]);
  });

  it('追加項目は重複・未知の値を除き、用紙の上限まで（後から選んだ分を外す）', () => {
    expect(normalizeProductLabelSettings({ sheet: 'A4_21', extra: ['sku', 'sku', 'zzz', 'needsExpiry', 'setUnits'] }).extra).toEqual(['sku', 'needsExpiry']);
    expect(normalizeProductLabelSettings({ sheet: 'A4_40_52x29', extra: ['needsExpiry', 'sku'] }).extra).toEqual(['needsExpiry']);
    const small = normalizeProductLabelSettings({ sheet: 'A4_44_48x25', extra: ['sku'], image: true });
    expect(small.extra).toEqual([]);
    expect(small.image).toBe(false);
  });

  it('trimExtras: 上限を超えた分だけ後ろから外し、外した項目を返す', () => {
    expect(trimExtras(['sku', 'needsExpiry', 'setUnits'], 2)).toEqual({ kept: ['sku', 'needsExpiry'], removed: ['setUnits'] });
    expect(trimExtras(['sku', 'needsExpiry'], 1)).toEqual({ kept: ['sku'], removed: ['needsExpiry'] });
    expect(trimExtras(['sku'], 0)).toEqual({ kept: [], removed: ['sku'] });
    expect(trimExtras(['sku'], 2)).toEqual({ kept: ['sku'], removed: [] });
  });

  it('削除した用紙が保存されていたら 40 面に戻す', () => {
    for (const id of ['A4_24i', 'A4_24_64x33', 'A4_24_66x35', 'A4_24_70x36', 'A4_24_70x37', 'A4_27']) {
      expect(normalizeProductLabelSettings({ sheet: id }).sheet, id).toBe('A4_40_52x29');
    }
  });
});

describe('この出荷だけの用紙（withSheet）', () => {
  it('用紙だけを差し替え、元の設定は変えない', () => {
    const base = { ...DEFAULT_PRODUCT_LABEL_SETTINGS, order: 'column' as const, offsetXmm: 1 };
    const next = withSheet(base, 'A4_24');
    expect(next.sheet).toBe('A4_24');
    expect(next.order).toBe('column');
    expect(next.offsetXmm).toBe(1);
    expect(base.sheet).toBe('A4_40_52x29');
  });
  it('知らない用紙は無視。画像が使えない用紙では画像を外す', () => {
    expect(withSheet(DEFAULT_PRODUCT_LABEL_SETTINGS, 'nope')).toBe(DEFAULT_PRODUCT_LABEL_SETTINGS);
    const withImage = { ...DEFAULT_PRODUCT_LABEL_SETTINGS, sheet: 'A4_21', image: true };
    const onSmall = withSheet(withImage, 'A4_44_48x25');
    expect(onSmall.sheet).toBe('A4_44_48x25');
    expect(typeof onSmall.image).toBe('boolean');
  });
});
