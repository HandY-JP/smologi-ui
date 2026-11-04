// check-typography: ignore-file
// 文字（書体・サイズ・太さ）の共通定数。値の元は src/tokens/typography.css（同じ数字を持つ）。
//
// サイズは 8 段（meta / note / label / body / item / title / heading / figure）、太さは 3 段
// （normal / medium / strong）。クラスは Tailwind の任意値で書く: Tailwind の preset が無いアプリ
// （amazon-app など）でも、このパッケージの dist を `content` に入れるだけで効く。
// クラス文字列はリテラルのまま残すこと（テンプレートで組み立てると Tailwind が拾えない）。
//
// 使い方:
//   <h2 className={`${TEXT.title} ${WEIGHT.strong}`}>…</h2>
//   <span className={`${TEXT.body} ${NUM_CLASS}`}>1,234</span>

export type TypeStep = 'meta' | 'note' | 'label' | 'body' | 'item' | 'title' | 'heading' | 'figure';
export type WeightStep = 'normal' | 'medium' | 'strong';

/** サイズ 8 段 → Tailwind 任意値クラス（文字サイズ + 行の高さ）。 */
export const TEXT = {
  meta: 'text-[11px] leading-[16px]',
  note: 'text-[12px] leading-[18px]',
  label: 'text-[13px] leading-[20px]',
  body: 'text-[14px] leading-[22px]',
  item: 'text-[15px] leading-[22px]',
  title: 'text-[18px] leading-[26px]',
  heading: 'text-[22px] leading-[30px]',
  figure: 'text-[28px] leading-[36px]',
} as const satisfies Record<TypeStep, string>;

/** 太さ 3 段 → Tailwind クラス。bold / extrabold / black は使わない。 */
export const WEIGHT = {
  normal: 'font-normal',
  medium: 'font-medium',
  strong: 'font-semibold',
} as const satisfies Record<WeightStep, string>;

/** 数字の桁をそろえる（金額・件数・コード）。 */
export const NUM_CLASS = 'tabular-nums';

export interface TypeScaleEntry {
  name: TypeStep;
  px: number;
  lineHeight: number;
  /** 日本語の用途（ドキュメント・テストの見出し用）。 */
  usage: string;
}

/** サイズ 8 段の一覧（docs / テスト用）。 */
export const TYPE_SCALE: readonly TypeScaleEntry[] = [
  { name: 'meta', px: 11, lineHeight: 16, usage: '補足の補足。バッジ・タグ・小さな注記・日付の添え' },
  { name: 'note', px: 12, lineHeight: 18, usage: '注釈・ヘルプ文・入力欄の下の説明・表の補助行' },
  { name: 'label', px: 13, lineHeight: 20, usage: '項目名・表の見出し・フォームのラベル・ボタン（小）' },
  { name: 'body', px: 14, lineHeight: 22, usage: '本文・表のセル・入力欄・ボタン（標準）' },
  { name: 'item', px: 15, lineHeight: 22, usage: '一覧の主役（商品名・コード）・サイドバーの項目' },
  { name: 'title', px: 18, lineHeight: 26, usage: 'カード・モーダル・区画の見出し' },
  { name: 'heading', px: 22, lineHeight: 30, usage: 'ページの見出し' },
  { name: 'figure', px: 28, lineHeight: 36, usage: 'ダッシュボードの大きな数字' },
];

// ---- 既存コードを 8 段へ寄せる対応表（コードモッド・check 用） ----

/**
 * 旧サイズ → 段の対応。
 * - px: 下限（含む）から次の下限の手前まで。7〜11.5px は meta、12〜12.5 は note、13〜13.5 は label、
 *   14〜14.5 は body、15〜16 は item、17〜19 は title、20〜27 は heading（25〜27 も heading）、28 以上は figure。
 * - tailwind: Tailwind 標準のサイズ名。
 */
export const TYPE_SIZE_MAP = {
  px: [
    { from: 0, step: 'meta' },
    { from: 12, step: 'note' },
    { from: 13, step: 'label' },
    { from: 14, step: 'body' },
    { from: 15, step: 'item' },
    { from: 17, step: 'title' },
    { from: 20, step: 'heading' },
    { from: 28, step: 'figure' },
  ],
  tailwind: {
    xs: 'note',
    sm: 'body',
    base: 'item',
    lg: 'title',
    xl: 'heading',
    '2xl': 'heading',
    '3xl': 'figure',
    '4xl': 'figure',
    '5xl': 'figure',
    '6xl': 'figure',
    '7xl': 'figure',
    '8xl': 'figure',
    '9xl': 'figure',
  },
} as const satisfies {
  px: readonly { from: number; step: TypeStep }[];
  tailwind: Record<string, TypeStep>;
};

/** px の値（例 13.5）→ 段。負数・NaN は meta 扱いにせず undefined。 */
export function typeStepForPx(px: number): TypeStep | undefined {
  if (!Number.isFinite(px) || px < 0) return undefined;
  let hit: TypeStep = TYPE_SIZE_MAP.px[0].step;
  for (const row of TYPE_SIZE_MAP.px) if (px >= row.from) hit = row.step;
  return hit;
}

/** Tailwind のサイズ名（'sm' など。`text-` は付けない）→ 段。 */
export function typeStepForTailwind(name: string): TypeStep | undefined {
  return (TYPE_SIZE_MAP.tailwind as Record<string, TypeStep>)[name];
}

/** 旧い太さのクラス（`font-` 付き）→ 3 段。 */
export const WEIGHT_MAP = {
  'font-thin': 'normal',
  'font-extralight': 'normal',
  'font-light': 'normal',
  'font-normal': 'normal',
  'font-medium': 'medium',
  'font-semibold': 'strong',
  'font-bold': 'strong',
  'font-extrabold': 'strong',
  'font-black': 'strong',
} as const satisfies Record<string, WeightStep>;
