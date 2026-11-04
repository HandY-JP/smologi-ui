import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import {
  NUM_CLASS, TEXT, TYPE_SCALE, TYPE_SIZE_MAP, WEIGHT, WEIGHT_MAP,
  typeStepForPx, typeStepForTailwind,
} from '../src/lib/typography';
import type { TypeStep } from '../src/lib/typography';

describe('typography: 8 段', () => {
  it('TEXT・TYPE_SCALE・tokens/typography.css・preset が同じ数字を持つ', () => {
    const css = readFileSync(new URL('../src/tokens/typography.css', import.meta.url), 'utf8');
    const preset = createRequire(import.meta.url)('../tailwind-preset.cjs');
    expect(TYPE_SCALE.map((s) => s.name)).toEqual(['meta', 'note', 'label', 'body', 'item', 'title', 'heading', 'figure']);
    for (const s of TYPE_SCALE) {
      expect(TEXT[s.name]).toBe(`text-[${s.px}px] leading-[${s.lineHeight}px]`);
      expect(css).toContain(`--sm-text-${s.name}: ${s.px}px;`);
      expect(css).toContain(`--sm-leading-${s.name}: ${s.lineHeight}px;`);
      const [size, opt] = preset.theme.extend.fontSize[s.name];
      expect(size).toBe(`var(--sm-text-${s.name}, ${s.px}px)`);
      expect(opt.lineHeight).toBe(`var(--sm-leading-${s.name}, ${s.lineHeight}px)`);
      expect(s.usage.length).toBeGreaterThan(0);
    }
  });

  it('太さは 3 段だけ', () => {
    expect(WEIGHT).toEqual({ normal: 'font-normal', medium: 'font-medium', strong: 'font-semibold' });
    expect(NUM_CLASS).toBe('tabular-nums');
  });
});

describe('TYPE_SIZE_MAP', () => {
  const cases: [number, TypeStep][] = [
    [7, 'meta'], [9, 'meta'], [10, 'meta'], [11, 'meta'], [11.5, 'meta'],
    [12, 'note'], [12.5, 'note'], [13, 'label'], [13.5, 'label'],
    [14, 'body'], [14.5, 'body'], [15, 'item'], [16, 'item'],
    [17, 'title'], [18, 'title'], [19, 'title'],
    [20, 'heading'], [22, 'heading'], [24, 'heading'], [25, 'heading'], [27, 'heading'],
    [28, 'figure'], [32, 'figure'], [48, 'figure'],
  ];
  it.each(cases)('%ipx → %s', (px, step) => {
    expect(typeStepForPx(px)).toBe(step);
  });

  it('不正な値は undefined', () => {
    expect(typeStepForPx(Number.NaN)).toBeUndefined();
    expect(typeStepForPx(-1)).toBeUndefined();
  });

  it('Tailwind 標準名', () => {
    expect(typeStepForTailwind('xs')).toBe('note');
    expect(typeStepForTailwind('sm')).toBe('body');
    expect(typeStepForTailwind('base')).toBe('item');
    expect(typeStepForTailwind('lg')).toBe('title');
    expect(typeStepForTailwind('xl')).toBe('heading');
    expect(typeStepForTailwind('2xl')).toBe('heading');
    for (const n of ['3xl', '4xl', '5xl', '9xl']) expect(typeStepForTailwind(n)).toBe('figure');
    expect(typeStepForTailwind('huge')).toBeUndefined();
    expect(TYPE_SIZE_MAP.px[0].from).toBe(0);
  });
});

describe('WEIGHT_MAP', () => {
  it('旧い太さ → 3 段', () => {
    expect(WEIGHT_MAP['font-light']).toBe('normal');
    expect(WEIGHT_MAP['font-normal']).toBe('normal');
    expect(WEIGHT_MAP['font-medium']).toBe('medium');
    for (const k of ['font-semibold', 'font-bold', 'font-extrabold', 'font-black'] as const) {
      expect(WEIGHT_MAP[k]).toBe('strong');
    }
  });
});
