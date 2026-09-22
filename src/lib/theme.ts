export type ThemeKey = 'light' | 'navy' | 'charcoal' | 'forest' | 'dark' | 'pink' | 'rose' | 'dq';

export interface ThemeVars {
  '--sb-bg': string;
  '--sb-border': string;
  '--sb-hover': string;
  '--sb-text': string;
  '--sb-label': string;
  /** サイドバー内の見出し・強調テキスト色（暗色テーマは白、明色テーマは濃紺） */
  '--sb-heading': string;
  '--sb-accent-bg': string;
  '--accent-hover': string;
  /**
   * アクセント色の 15% 透過。フォーカスリングなど「うっすらアクセント」に使う。
   * Tailwind v3 は `ring-[var(--x)]/15` の透過修飾子を var() 相手には黙って捨てる
   * （ユーティリティごと出力されない）ため、透過値はトークン側で用意する必要がある。
   */
  '--accent-ring': string;
  /** アクセント色の淡い背景（選択中の行・タグ・カレントタブの塗りなど） */
  '--accent-subtle': string;
  /** @deprecated --accent-subtle と同値の旧名。既存参照のための互換エイリアス。 */
  '--accent-light': string;
  /** アクセント色の上に乗せる文字色（塗りボタンのラベルなど） */
  '--accent-on': string;
  '--page-bg': string;
}

export const THEMES: Record<ThemeKey, { name: string; swatch: string; vars: ThemeVars }> = {
  light: {
    name: 'ホワイト',
    swatch: '#e2e8f0',
    vars: {
      '--sb-bg':        '#f6f7fb',
      '--sb-border':    '#e7ebf0',
      '--sb-hover':     '#e9edf4',
      '--sb-text':      '#334155',
      '--sb-label':     '#64748b',
      '--sb-heading':   '#0f172a',
      '--sb-accent-bg': '#2563eb',
      '--accent-hover': '#1d4ed8',
      '--accent-ring':  'rgba(37, 99, 235, 0.15)',
      '--accent-subtle':'#eff6ff',
      '--accent-light': '#eff6ff',
      '--accent-on':    '#ffffff',
      '--page-bg':      '#f6f7fb',
    },
  },
  navy: {
    name: 'ブルー',
    swatch: '#2563eb',
    vars: {
      '--sb-bg':        '#1e293b',
      '--sb-border':    '#334155',
      '--sb-hover':     '#2d3f55',
      '--sb-text':      '#cbd5e1',
      '--sb-label':     '#94a3b8',
      '--sb-heading':   '#ffffff',
      '--sb-accent-bg': '#2563eb',
      '--accent-hover': '#1d4ed8',
      '--accent-ring':  'rgba(37, 99, 235, 0.15)',
      '--accent-subtle':'#eff6ff',
      '--accent-light': '#eff6ff',
      '--accent-on':    '#ffffff',
      '--page-bg':      '#f0f5ff',
    },
  },
  charcoal: {
    name: 'パープル',
    swatch: '#7c3aed',
    vars: {
      '--sb-bg':        '#2e1065', // violet-950 — はっきり紫が分かる濃さ
      '--sb-border':    '#3c1a78',
      '--sb-hover':     '#4c1d95', // violet-900
      '--sb-text':      '#ddd6fe', // violet-200
      '--sb-label':     '#a78bfa', // violet-400
      '--sb-heading':   '#ffffff',
      '--sb-accent-bg': '#7c3aed', // violet-600
      '--accent-hover': '#6d28d9',
      '--accent-ring':  'rgba(124, 58, 237, 0.15)',
      '--accent-subtle':'#f5f3ff',
      '--accent-light': '#f5f3ff',
      '--accent-on':    '#ffffff',
      '--page-bg':      '#f8f5ff',
    },
  },
  forest: {
    name: 'グリーン',
    swatch: '#047857',
    vars: {
      '--sb-bg':        '#0f2418',
      '--sb-border':    '#1a3626',
      '--sb-hover':     '#1e4030',
      '--sb-text':      '#d1fae5',
      '--sb-label':     '#6ee7b7',
      '--sb-heading':   '#ffffff',
      '--sb-accent-bg': '#047857',
      '--accent-hover': '#065f46',
      '--accent-ring':  'rgba(4, 120, 87, 0.15)',
      '--accent-subtle':'#ecfdf5',
      '--accent-light': '#ecfdf5',
      '--accent-on':    '#ffffff',
      '--page-bg':      '#f0fdf4',
    },
  },
  dark: {
    name: 'ダーク',
    swatch: '#0f172a',
    vars: {
      '--sb-bg':        '#020617',
      '--sb-border':    '#1e293b',
      '--sb-hover':     '#1e293b',
      '--sb-text':      '#cbd5e1',
      '--sb-label':     '#64748b',
      '--sb-heading':   '#ffffff',
      '--sb-accent-bg': '#3b82f6',
      '--accent-hover': '#2563eb',
      '--accent-ring':  'rgba(59, 130, 246, 0.15)',
      '--accent-subtle':'#1e3a8a',
      '--accent-light': '#1e3a8a',
      '--accent-on':    '#ffffff',
      '--page-bg':      '#0f172a',
    },
  },
  pink: {
    name: 'ピンクシャボン',
    swatch: '#ec4899',
    vars: {
      '--sb-bg':        '#5e1f3d',
      '--sb-border':    '#73294c',
      '--sb-hover':     '#7d2f55',
      '--sb-text':      '#fce7f3',
      '--sb-label':     '#f9a8d4',
      '--sb-heading':   '#ffffff',
      '--sb-accent-bg': '#ec4899',
      '--accent-hover': '#db2777',
      '--accent-ring':  'rgba(236, 72, 153, 0.15)',
      '--accent-subtle':'#fdf2f8',
      '--accent-light': '#fdf2f8',
      '--accent-on':    '#ffffff',
      '--page-bg':      '#fff5fa',
    },
  },
  rose: {
    name: 'ピンク',
    swatch: '#ec4899',
    vars: {
      '--sb-bg':        '#fdf2f8', // pink-50 — 明るい（ダークでない）ピンク
      '--sb-border':    '#fbcfe8', // pink-200
      '--sb-hover':     '#fce7f3', // pink-100
      '--sb-text':      '#9d174d', // pink-800（明色背景で読める濃ピンク）
      '--sb-label':     '#db2777', // pink-600
      '--sb-heading':   '#831843', // pink-900
      '--sb-accent-bg': '#ec4899', // pink-500
      '--accent-hover': '#db2777',
      '--accent-ring':  'rgba(236, 72, 153, 0.15)',
      '--accent-subtle':'#fdf2f8',
      '--accent-light': '#fdf2f8',
      '--accent-on':    '#ffffff',
      '--page-bg':      '#fff5fa',
    },
  },
  dq: {
    name: 'スライム',
    swatch: '#2f8fd6',
    vars: {
      '--sb-bg':        '#0c1d4d',
      '--sb-border':    '#1b2f66',
      '--sb-hover':     '#1a2f6e',
      '--sb-text':      '#dbe4ff',
      '--sb-label':     '#9fb3e6',
      '--sb-heading':   '#ffffff',
      '--sb-accent-bg': '#2f8fd6',
      '--accent-hover': '#2575b5',
      '--accent-ring':  'rgba(47, 143, 214, 0.15)',
      '--accent-subtle':'#eaf4fc',
      '--accent-light': '#eaf4fc',
      '--accent-on':    '#ffffff',
      '--page-bg':      '#eef3fb',
    },
  },
};

/**
 * 2026-08 の整理：ユーザーごとの自由なテーマ選択（設定ページのカラーテーマ）を廃止し、
 * 「エリア既定 ＋ ダークモードのON/OFF」だけにした。
 *
 * - お客様画面（/customer）の既定 … グリーン（forest）
 * - 管理画面ほかの既定 …………………… 従来どおりホワイト＋青アクセント（light）
 * - ダークON ……………………………………… エリアに関わらずダーク（dark）
 *
 * ユーザーが保存するのは「ダークかどうか」だけ。light / navy / pink / dq などの
 * 旧テーマ保存値はダークではないので、自動的にエリア既定へ寄る。
 */

/** ダークモードのテーマキー。 */
export const DARK_THEME: ThemeKey = 'dark';

/** お客様画面（/customer 配下）の既定テーマ。 */
export const CUSTOMER_DEFAULT_THEME: ThemeKey = 'forest';

/** 管理画面ほか（お客様画面以外）の既定テーマ。従来の既定と同じ。 */
export const DEFAULT_THEME: ThemeKey = 'light';

/** 実際に適用しうるテーマ（先行スクリプトへ埋め込むパレットの対象）。 */
export const ACTIVE_THEMES: ThemeKey[] = [DEFAULT_THEME, CUSTOMER_DEFAULT_THEME, DARK_THEME];

/** お客様画面のパスか（テーマのエリア判定）。 */
export function isCustomerAreaPath(pathname: string | null | undefined): boolean {
  return !!pathname && (pathname === '/customer' || pathname.startsWith('/customer/'));
}

/** ダークOFF のときに使うテーマ（エリア既定）。 */
export function areaDefaultTheme(pathname: string | null | undefined): ThemeKey {
  return isCustomerAreaPath(pathname) ? CUSTOMER_DEFAULT_THEME : DEFAULT_THEME;
}

/** エリアとダークON/OFF から、実際に当てるテーマを決める。 */
export function resolveTheme(pathname: string | null | undefined, dark: boolean): ThemeKey {
  return dark ? DARK_THEME : areaDefaultTheme(pathname);
}

/**
 * Smologi Client（/customer）専用の固定パレット。
 * ポータルの Smologi Client と同じ teal/emerald 系にして、Logistics 管理画面や
 * 通常テーマから一目で区別できるようにする。
 */
export const SMOLOGI_CLIENT_THEME_VARS: ThemeVars = {
  '--sb-bg':        '#052e2b',
  '--sb-border':    '#134e4a',
  '--sb-hover':     '#0f766e',
  '--sb-text':      '#ccfbf1',
  '--sb-label':     '#5eead4',
  '--sb-heading':   '#ffffff',
  '--sb-accent-bg': '#14b8a6',
  '--accent-hover': '#0d9488',
  '--accent-ring':  'rgba(20, 184, 166, 0.15)',
  '--accent-subtle':'#ccfbf1',
  '--accent-light': '#ccfbf1',
  '--accent-on':    '#ffffff',
  '--page-bg':      '#f0fdfa',
};

/**
 * ダークモード中のお客様画面（/customer）のアクセントだけを上書きするトークン。
 *
 * ダークテーマの共通パレット（THEMES.dark）はアクセントが青（#3b82f6）だが、お客様画面は
 * 「緑基調のまま（青にしない）」がユーザー決定（2026-09-14、2026-09-22 のトップバー載せ替えで再確認）。
 * 面・文字・罫線はダーク共通のままにして、アクセント系の変数だけをここで teal へ戻す。
 * 当てているのは customer/layout.tsx の <style>（お客様レイアウトだけが出力する）。
 */
export const SMOLOGI_CLIENT_DARK_ACCENT_VARS: Partial<ThemeVars> = {
  '--sb-accent-bg': '#14b8a6',
  '--accent-hover': '#0d9488',
  '--accent-ring':  'rgba(20, 184, 166, 0.2)',
  '--accent-subtle':'#134e4a',
  '--accent-light': '#134e4a',
  '--accent-on':    '#ffffff',
};

/**
 * 意味色（テーマ非依存）。
 * 「成功／注意／危険／情報」はテーマを切り替えても意味が変わらないので、アクセント色とは
 * 別系統として固定する。値はコード内で最も多く使われている Tailwind の色に合わせてある。
 * Tailwind のクラス名ではなく色そのものを持つのは、tailwind.config.ts の content が
 * src/lib/** を見ておらず、ここに書いたクラス名は CSS へ出力されないため。
 */
export const SEMANTIC = {
  /** 完了・確定・成功（emerald-600） */
  confirm: '#059669',
  /** 注意・要確認（amber-500） */
  warn: '#f59e0b',
  /** エラー・破壊的操作（rose-600） */
  danger: '#e11d48',
  /** 情報・補足（blue-600） */
  info: '#2563eb',
} as const;

export type SemanticKey = keyof typeof SEMANTIC;
