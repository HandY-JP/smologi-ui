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
export declare const THEMES: Record<ThemeKey, {
    name: string;
    swatch: string;
    vars: ThemeVars;
}>;
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
export declare const DARK_THEME: ThemeKey;
/** お客様画面（/customer 配下）の既定テーマ。 */
export declare const CUSTOMER_DEFAULT_THEME: ThemeKey;
/** 管理画面ほか（お客様画面以外）の既定テーマ。従来の既定と同じ。 */
export declare const DEFAULT_THEME: ThemeKey;
/** 実際に適用しうるテーマ（先行スクリプトへ埋め込むパレットの対象）。 */
export declare const ACTIVE_THEMES: ThemeKey[];
/** お客様画面のパスか（テーマのエリア判定）。 */
export declare function isCustomerAreaPath(pathname: string | null | undefined): boolean;
/** ダークOFF のときに使うテーマ（エリア既定）。 */
export declare function areaDefaultTheme(pathname: string | null | undefined): ThemeKey;
/** エリアとダークON/OFF から、実際に当てるテーマを決める。 */
export declare function resolveTheme(pathname: string | null | undefined, dark: boolean): ThemeKey;
/**
 * Smologi Client（/customer）専用の固定パレット。
 * ポータルの Smologi Client と同じ teal/emerald 系にして、Logistics 管理画面や
 * 通常テーマから一目で区別できるようにする。
 */
export declare const SMOLOGI_CLIENT_THEME_VARS: ThemeVars;
/**
 * ダークモード中のお客様画面（/customer）のアクセントだけを上書きするトークン。
 *
 * ダークテーマの共通パレット（THEMES.dark）はアクセントが青（#3b82f6）だが、お客様画面は
 * 「緑基調のまま（青にしない）」がユーザー決定（2026-09-14、2026-09-22 のトップバー載せ替えで再確認）。
 * 面・文字・罫線はダーク共通のままにして、アクセント系の変数だけをここで teal へ戻す。
 * 当てているのは customer/layout.tsx の <style>（お客様レイアウトだけが出力する）。
 */
export declare const SMOLOGI_CLIENT_DARK_ACCENT_VARS: Partial<ThemeVars>;
/**
 * 意味色（テーマ非依存）。
 * 「成功／注意／危険／情報」はテーマを切り替えても意味が変わらないので、アクセント色とは
 * 別系統として固定する。値はコード内で最も多く使われている Tailwind の色に合わせてある。
 * Tailwind のクラス名ではなく色そのものを持つのは、tailwind.config.ts の content が
 * src/lib/** を見ておらず、ここに書いたクラス名は CSS へ出力されないため。
 */
export declare const SEMANTIC: {
    /** 完了・確定・成功（emerald-600） */
    readonly confirm: "#059669";
    /** 注意・要確認（amber-500） */
    readonly warn: "#f59e0b";
    /** エラー・破壊的操作（rose-600） */
    readonly danger: "#e11d48";
    /** 情報・補足（blue-600） */
    readonly info: "#2563eb";
};
export type SemanticKey = keyof typeof SEMANTIC;
//# sourceMappingURL=theme.d.ts.map