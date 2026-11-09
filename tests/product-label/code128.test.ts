import { describe, expect, it } from 'vitest';
import {
  CODE128_START_B,
  CODE128_STOP,
  code128BCharValue,
  code128BEncodeValues,
  code128Bars,
  code128Widths,
  isCode128BEncodable,
} from '../../src/product-label/code128';

describe('code128BCharValue', () => {
  it('スペース(32)を0、`~`(126)を94に変換する', () => {
    expect(code128BCharValue(' ')).toBe(0);
    expect(code128BCharValue('~')).toBe(94);
  });

  it('英数字の値を正しく計算する（charCode - 32）', () => {
    expect(code128BCharValue('A')).toBe(33);
    expect(code128BCharValue('0')).toBe(16);
    expect(code128BCharValue('-')).toBe(13);
  });

  it('ASCII 32-126の範囲外は例外を投げる', () => {
    expect(() => code128BCharValue('\n')).toThrow();
    expect(() => code128BCharValue('あ')).toThrow();
  });
});

describe('isCode128BEncodable', () => {
  it('ASCII可視文字のみの文字列はtrue', () => {
    expect(isCode128BEncodable('503-3283065-5781455')).toBe(true);
  });

  it('空文字列や非ASCIIを含む文字列はfalse', () => {
    expect(isCode128BEncodable('')).toBe(false);
    expect(isCode128BEncodable('受注123')).toBe(false);
  });
});

describe('code128BEncodeValues', () => {
  it('START B + データ + チェックサム + STOP の並びになる', () => {
    const values = code128BEncodeValues('A1');
    expect(values[0]).toBe(CODE128_START_B);
    expect(values[values.length - 1]).toBe(CODE128_STOP);
    // START, 'A'(33), '1'(17), checksum, STOP
    expect(values).toHaveLength(5);
  });

  it('チェックサムは mod 103（START=重み1、以降は位置番号を重みにする）', () => {
    // START_B(104)*1 + 'A'(33)*1 + '1'(17)*2 = 104 + 33 + 34 = 171 -> 171 % 103 = 68
    const values = code128BEncodeValues('A1');
    expect(values).toEqual([CODE128_START_B, 33, 17, 68, CODE128_STOP]);
  });

  it('長い文字列でもチェックサムが範囲内(0-102)に収まる', () => {
    const values = code128BEncodeValues('503-3283065-5781455');
    const checksum = values[values.length - 2];
    expect(checksum).toBeGreaterThanOrEqual(0);
    expect(checksum).toBeLessThanOrEqual(102);
  });

  it('符号化できない文字を渡すと例外を投げる', () => {
    expect(() => code128BEncodeValues('受注123')).toThrow();
  });
});

describe('code128Widths', () => {
  it('各値のパターン幅の合計は11（STOPのみ13）', () => {
    const values = code128BEncodeValues('AB');
    const widths = code128Widths(values);
    // START(6) + 'A'(6) + 'B'(6) + checksum(6) + STOP(7) = 31本
    expect(widths).toHaveLength(31);
    expect(widths.reduce((sum, w) => sum + w, 0)).toBe(4 * 11 + 13);
  });

  it('未定義の値を渡すと例外を投げる', () => {
    expect(() => code128Widths([999])).toThrow();
  });
});

describe('code128Bars', () => {
  it('バーの位置と幅を返し、totalModulesが幅の合計と一致する', () => {
    const { bars, totalModules } = code128Bars('AB');
    expect(bars.length).toBeGreaterThan(0);
    for (const bar of bars) {
      expect(bar.width).toBeGreaterThanOrEqual(1);
      expect(bar.width).toBeLessThanOrEqual(4);
    }
    const lastBar = bars[bars.length - 1];
    expect(lastBar.x + lastBar.width).toBeLessThanOrEqual(totalModules);
  });

  it('受注番号のような実データでも例外を投げずに描画データを作れる', () => {
    const { bars, totalModules } = code128Bars('503-3283065-5781455');
    expect(bars.length).toBeGreaterThan(0);
    expect(totalModules).toBeGreaterThan(0);
  });

  it('空文字列でもSTART+STOPだけの最小構成として例外を投げずに扱える（呼び出し側は空文字を渡さない前提）', () => {
    expect(() => code128Bars('')).not.toThrow();
  });
});

/**
 * パターン表そのものの検証。Code128 の仕様上、各シンボルは
 * 「6要素（STOPのみ7要素）／各1〜4モジュール／合計11モジュール（STOPのみ13）」で、
 * さらにバー側モジュール数の合計が必ず偶数になる（自己検査用のパリティ）。
 * 1桁でも打ち間違えるとこのいずれかが崩れるため、表の書き写しミスを検出できる。
 */
describe('Code128 パターン表の妥当性', () => {
  const patterns = Array.from({ length: 107 }, (_, value) => code128Widths([value]));

  it('要素数・合計モジュール数・各幅が仕様どおり', () => {
    patterns.forEach((pattern, value) => {
      const isStop = value === CODE128_STOP;
      expect(pattern).toHaveLength(isStop ? 7 : 6);
      expect(pattern.reduce((sum, w) => sum + w, 0)).toBe(isStop ? 13 : 11);
      expect(pattern.every((w) => w >= 1 && w <= 4)).toBe(true);
    });
  });

  it('バー側モジュール数の合計は常に偶数（Code128の自己検査パリティ）', () => {
    patterns.forEach((pattern, value) => {
      if (value === CODE128_STOP) return;
      const barModules = pattern.filter((_, i) => i % 2 === 0).reduce((sum, w) => sum + w, 0);
      expect(barModules % 2, `value=${value}`).toBe(0);
    });
  });

  it('107個のパターンはすべて相異なる（重複＝どこかを写し間違えている）', () => {
    expect(new Set(patterns.map((pattern) => pattern.join(''))).size).toBe(107);
  });

  it('よく知られたシンボルのビット列と一致する', () => {
    const bits = (value: number) => code128Widths([value])
      .map((width, i) => (i % 2 === 0 ? '1' : '0').repeat(width))
      .join('');
    expect(bits(CODE128_START_B)).toBe('11010010000'); // START B
    expect(bits(CODE128_STOP)).toBe('1100011101011'); // STOP
    expect(bits(code128BCharValue(' '))).toBe('11011001100'); // 値0
    expect(bits(code128BCharValue('0'))).toBe('10011101100'); // 値16
  });
});

/** 幅パターン → 値 の逆引き（テスト内の簡易デコーダ）。 */
function decodeCode128Widths(widths: number[]): { text: string; checksumValid: boolean } {
  const byPattern = new Map<string, number>();
  for (let value = 0; value <= 106; value++) byPattern.set(code128Widths([value]).join(','), value);

  const values: number[] = [];
  let cursor = 0;
  while (cursor < widths.length) {
    const size = widths.length - cursor === 7 ? 7 : 6;
    const value = byPattern.get(widths.slice(cursor, cursor + size).join(','));
    if (value == null) throw new Error(`未知のパターン（位置 ${cursor}）`);
    values.push(value);
    cursor += size;
  }
  expect(values[0]).toBe(CODE128_START_B);
  expect(values[values.length - 1]).toBe(CODE128_STOP);

  const dataValues = values.slice(1, -2);
  const checksum = values[values.length - 2];
  const expected = (values[0] + dataValues.reduce((sum, v, i) => sum + v * (i + 1), 0)) % 103;
  return {
    text: dataValues.map((value) => String.fromCharCode(value + 0x20)).join(''),
    checksumValid: checksum === expected,
  };
}

describe('エンコード→デコードの往復', () => {
  it.each([
    '503-3283065-5781455',
    'GROW-000123',
    'A1',
    ' ~',
    'abcXYZ0123456789',
  ])('%s を符号化して復号すると元に戻り、チェックサムも整合する', (text) => {
    const decoded = decodeCode128Widths(code128Widths(code128BEncodeValues(text)));
    expect(decoded.text).toBe(text);
    expect(decoded.checksumValid).toBe(true);
  });

  it('バーだけを抜き出した描画データが、幅パターンの並びと一致する', () => {
    const widths = code128Widths(code128BEncodeValues('A1'));
    const { bars, totalModules } = code128Bars('A1');
    expect(totalModules).toBe(widths.reduce((sum, w) => sum + w, 0));
    const expected: { x: number; width: number }[] = [];
    let x = 0;
    widths.forEach((width, i) => {
      if (i % 2 === 0) expected.push({ x, width });
      x += width;
    });
    expect(bars).toEqual(expected);
  });
});
