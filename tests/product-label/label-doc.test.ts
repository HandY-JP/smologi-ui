import { describe, expect, it } from 'vitest';
import { asisReason, decideLabelMode, parseLabelDocMetadata, type LabelItem } from '../../src/product-label/label-doc';

function item(over: Partial<LabelItem> = {}): LabelItem {
  return {
    sellerSku: 'SKU-001', asin: 'B000000001', fnSku: 'X001ABCDE1', productName: 'テスト商品 とても長い名前のサンプル 500ml 12本入りケース',
    quantity: 3, condition: 'new_new', conditionLabel: '新品', imageUrl: null, expiration: null, unitsPerSet: null, expiryManaged: null, prepInstructions: [], ...over,
  };
}


describe('モード判定', () => {
  it('全品目にコンディションがあるときだけ自前生成', () => {
    expect(decideLabelMode({ items: [item(), item()] })).toBe('generate');
    expect(decideLabelMode({ items: [item(), item({ conditionLabel: null })] })).toBe('asis');
    expect(decideLabelMode({ items: [] })).toBe('asis');
    expect(decideLabelMode(null)).toBe('asis');
  });

  it('生値 condition から表示名を決め、condition が無い品目があればそのまま印刷', () => {
    const doc = parseLabelDocMetadata({
      items: [
        { fnSku: 'X1', productName: 'n', quantity: 1, condition: 'UsedVeryGood', conditionLabel: 'ちがう' },
        { fnSku: 'X2', productName: 'n', quantity: 1, condition: 'Weird', conditionLabel: '特殊' },
      ],
    });
    expect(doc?.items.map((i) => i.conditionLabel)).toEqual(['中古-非常に良い', null]);
    // 対応表に無い値（コレクター・再生品・未知）が 1 つでもあれば asis
    expect(decideLabelMode(doc)).toBe('asis');
    for (const condition of ['CollectibleGood', 'Refurbished']) {
      expect(decideLabelMode(parseLabelDocMetadata({ items: [{ fnSku: 'X1', productName: 'n', quantity: 1, condition, conditionLabel: 'x' }] }))).toBe('asis');
    }
    expect(decideLabelMode(parseLabelDocMetadata({ items: [{ fnSku: 'X1', productName: 'n', quantity: 1, condition: 'UsedAcceptable' }] }))).toBe('generate');
    expect(decideLabelMode({ items: [item({ condition: null })] })).toBe('asis');
    expect(decideLabelMode({ items: [item({ condition: 'Weird', conditionLabel: null })] })).toBe('asis');
  });

  it('商品名が空の品目、FNSKU が空で読み飛ばした品目があれば出荷まるごとそのまま印刷に倒す', () => {
    expect(decideLabelMode({ items: [item({ productName: '' })] })).toBe('asis');
    const doc = parseLabelDocMetadata({
      items: [
        { fnSku: 'X1', productName: 'n', quantity: 2, condition: 'NewItem' },
        { fnSku: '', productName: 'm', quantity: 3, condition: 'NewItem' },
        { fnSku: '', productName: 'z', quantity: 0, condition: 'NewItem' },
      ],
    });
    expect(doc?.hasDroppedItems).toBe(true);
    expect(doc?.items).toHaveLength(1);
    expect(decideLabelMode(doc)).toBe('asis');
    // 数量 0 の空 FNSKU だけなら読み飛ばしても枚数は変わらない
    const ok = parseLabelDocMetadata({ items: [{ fnSku: 'X1', productName: 'n', quantity: 2, condition: 'NewItem' }, { fnSku: '', quantity: 0 }] });
    expect(ok?.hasDroppedItems).toBeUndefined();
    expect(decideLabelMode(ok)).toBe('generate');
  });

  it('FNSKU が空の品目があれば生成しない（形式や ASIN との照合はしない）', () => {
    expect(decideLabelMode({ items: [item({ fnSku: '' })] })).toBe('asis');
    expect(decideLabelMode({ items: [item(), item({ fnSku: '' })] })).toBe('asis');
    // 形式（X00 始まりでない・ASIN と同じ）は見ない。Code128B で表せれば生成する
    expect(decideLabelMode({ items: [item({ fnSku: 'B000000001', asin: 'B000000001' })] })).toBe('generate');
  });

  it('FNSKU が Code128B で表せないなら出荷まるごとそのまま印刷に倒す', () => {
    expect(decideLabelMode({ items: [item({ fnSku: 'ＦＮ全角' })] })).toBe('asis');
  });

  it('metadata の読み取りは数量 0・FNSKU なしを落とし、古い形式（condition なし）も読める', () => {
    const doc = parseLabelDocMetadata({
      items: [
        { sellerSku: 'a', asin: 'b', fnSku: 'X1', productName: 'n', quantity: 2 },
        { fnSku: '', quantity: 1 }, { fnSku: 'X2', quantity: 0 }, null,
      ],
    });
    expect(doc?.items).toHaveLength(1);
    expect(doc?.items[0].conditionLabel).toBeNull();
    expect(decideLabelMode(doc)).toBe('asis');
    expect(parseLabelDocMetadata({ items: 'x' })).toBeNull();
    expect(parseLabelDocMetadata(null)).toBeNull();
  });
});

describe('元 PDF の用紙と、作り直せない理由', () => {
  const ok = { fnSku: 'X1', productName: 'n', quantity: 1, condition: 'NewItem' };
  it('metadata の pageType から元 PDF の用紙を読む。無い・知らない値は null（推測しない）', () => {
    expect(parseLabelDocMetadata({ pageType: 'A4_24', officialPageType: 'A4_24', items: [ok] })?.sourceSheet).toBe('A4_24');
    expect(parseLabelDocMetadata({ pageType: 'A4_40', officialPageType: 'A4_40_52x29', items: [ok] })?.sourceSheet).toBe('A4_40_52x29');
    expect(parseLabelDocMetadata({ pageType: 'A4_40', items: [ok] })?.sourceSheet).toBe('A4_40_52x29');
    expect(parseLabelDocMetadata({ items: [ok] })?.sourceSheet).toBeNull();
    expect(parseLabelDocMetadata({ pageType: 'Weird', items: [ok] })?.sourceSheet).toBeNull();
  });
  it('理由は作り直せないときだけ。作り直せるなら null（モード判定と食い違わない）', () => {
    expect(asisReason({ items: [item()] })).toBeNull();
    expect(asisReason(null)).toContain('読み込めない');
    expect(asisReason({ items: [] })).toContain('品目');
    expect(asisReason({ items: [item()], hasDroppedItems: true })).toContain('FNSKU が入っていない');
    expect(asisReason({ items: [item({ productName: '' })] })).toContain('商品名');
    expect(asisReason({ items: [item({ condition: null })] })).toContain('コンディション');
    expect(asisReason({ items: [item({ fnSku: 'あ' })] })).toContain('バーコード');
    for (const doc of [null, { items: [] }, { items: [item()], hasDroppedItems: true }, { items: [item({ productName: '' })] }, { items: [item()] }]) {
      expect(decideLabelMode(doc as SellerLabelDoc | null) === 'generate').toBe(asisReason(doc as SellerLabelDoc | null) === null);
    }
  });
});
