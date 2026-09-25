// 最小パレット（意味名トークン）— テーマ一覧と Tailwind プリセット。
// 値そのものは src/tokens/palette.css（`@handy-jp/smologi-ui/tokens/palette.css`）が持つ。
// テーマを足すときは CSS にブロックを 1 つ、ここに 1 行。`npm test` が両者の対応と AA を検証する。

export type PaletteScheme = 'light' | 'dark';

export interface PaletteTheme {
  /** CSS の `html.theme-<key>`（light は `:root` 既定）。 */
  key: string;
  /** テーマピッカーの表示名。 */
  name: string;
  /** ライト系／ダーク系。dark は html に `theme-dark` も付ける（部品 CSS・dark-compat.css の暗転用）。 */
  scheme: PaletteScheme;
  /** 雰囲気の説明（1 行）。 */
  description: string;
  /** ピッカーの見本色（`r g b`）: 地・面・アクセント。 */
  swatch: { canvas: string; surface: string; accent: string };
}

export const PALETTE_THEMES = [
  {
    key: 'light',
    name: 'ライト',
    scheme: 'light',
    description: '既定。白い面と青のアクセント',
    swatch: { canvas: '246 247 251', surface: '255 255 255', accent: '37 99 235' },
  },
  {
    key: 'dark',
    name: 'ダーク',
    scheme: 'dark',
    description: '暗い地に濃い青のアクセント',
    swatch: { canvas: '15 17 21', surface: '23 27 36', accent: '37 99 235' },
  },
  {
    key: 'midnight',
    name: 'ミッドナイト',
    scheme: 'dark',
    description: '紺の地に藍色のアクセント。夜間向けの落ち着いたダーク',
    swatch: { canvas: '10 16 34', surface: '16 25 50', accent: '79 70 229' },
  },
  {
    key: 'sepia',
    name: 'セピア',
    scheme: 'light',
    description: '紙とインクの色。まぶしさを抑えた暖色のライト',
    swatch: { canvas: '245 240 231', surface: '252 249 243', accent: '146 84 34' },
  },
  {
    key: 'forest',
    name: 'フォレスト',
    scheme: 'light',
    description: '生成りの地に深緑のアクセント',
    swatch: { canvas: '243 241 232', surface: '251 250 244', accent: '22 96 64' },
  },
  {
    key: 'sakura',
    name: 'サクラ',
    scheme: 'light',
    description: '白地に淡いピンク。やわらかい印象',
    swatch: { canvas: '252 245 247', surface: '255 255 255', accent: '190 24 93' },
  },
  {
    key: 'contrast',
    name: 'ハイコントラスト',
    scheme: 'light',
    description: '黒文字・濃い罫線。本文と状態色は 7:1 以上（AAA）',
    swatch: { canvas: '255 255 255', surface: '255 255 255', accent: '0 56 184' },
  },
] as const satisfies readonly PaletteTheme[];

export type PaletteThemeKey = (typeof PALETTE_THEMES)[number]['key'];

export const DEFAULT_PALETTE_THEME: PaletteThemeKey = 'light';

/** すべてのテーマクラス（付け替え時に一旦外す用）。`theme-dark` を含む。 */
export const PALETTE_THEME_CLASS_NAMES: readonly string[] = Array.from(
  new Set(PALETTE_THEMES.flatMap((t) => [`theme-${t.key}`, 'theme-dark'])),
);

/**
 * `<html>` に付けるクラス。light は空（`:root` が既定）、ダーク系は `theme-dark` も付ける。
 * 例: paletteThemeClassNames('midnight') → ['theme-dark', 'theme-midnight']
 */
export function paletteThemeClassNames(key: PaletteThemeKey): string[] {
  const theme = PALETTE_THEMES.find((t) => t.key === key);
  if (!theme || theme.key === 'light') return [];
  if (theme.key === 'dark') return ['theme-dark'];
  return theme.scheme === 'dark' ? ['theme-dark', `theme-${theme.key}`] : [`theme-${theme.key}`];
}

/** `<html>` のテーマクラスを付け替える（ブラウザ専用）。 */
export function applyPaletteTheme(key: PaletteThemeKey, root: HTMLElement = document.documentElement): void {
  root.classList.remove(...PALETTE_THEME_CLASS_NAMES);
  root.classList.add(...paletteThemeClassNames(key));
  root.style.colorScheme = PALETTE_THEMES.find((t) => t.key === key)?.scheme ?? 'light';
}

const c = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;
const status = (s: string) => ({ soft: c(`${s}-soft`), ink: c(`${s}-ink`), solid: c(`${s}-solid`) });

/**
 * Tailwind の色（`theme.extend.colors` にそのまま入る）。
 * `bg-canvas` `bg-surface` `bg-surface-subtle` `text-ink-muted` `border-line-strong`
 * `bg-accent/15` `text-accent-ink` `text-on-accent` `bg-danger-soft` `text-cat-3-ink` …
 */
export const paletteColors = {
  canvas: c('canvas'),
  surface: { DEFAULT: c('surface'), subtle: c('surface-subtle'), muted: c('surface-muted') },
  ink: { DEFAULT: c('ink'), muted: c('ink-muted'), faint: c('ink-faint') },
  line: { DEFAULT: c('line'), strong: c('line-strong') },
  accent: { DEFAULT: c('accent'), soft: c('accent-soft'), ink: c('accent-ink') },
  'on-accent': c('on-accent'),
  success: status('success'),
  warning: status('warning'),
  danger: status('danger'),
  cat: Object.fromEntries(
    Array.from({ length: 8 }, (_, i) => [String(i + 1), status(`cat-${i + 1}`)]),
  ) as Record<'1' | '2' | '3' | '4' | '5' | '6' | '7' | '8', ReturnType<typeof status>>,
} as const;

/**
 * tailwind.config の `presets: [tailwindPreset]` に 1 行で入れる。
 * 既存の色（gray / blue …）は消さない（extend）。
 */
export const tailwindPreset = {
  theme: { extend: { colors: paletteColors } },
};
