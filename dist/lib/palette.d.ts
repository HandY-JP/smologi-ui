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
    swatch: {
        canvas: string;
        surface: string;
        accent: string;
    };
}
export declare const PALETTE_THEMES: readonly [{
    readonly key: "light";
    readonly name: "ライト";
    readonly scheme: "light";
    readonly description: "既定。白い面と青のアクセント";
    readonly swatch: {
        readonly canvas: "246 247 251";
        readonly surface: "255 255 255";
        readonly accent: "37 99 235";
    };
}, {
    readonly key: "dark";
    readonly name: "ダーク";
    readonly scheme: "dark";
    readonly description: "暗い地に濃い青のアクセント";
    readonly swatch: {
        readonly canvas: "15 17 21";
        readonly surface: "23 27 36";
        readonly accent: "37 99 235";
    };
}, {
    readonly key: "midnight";
    readonly name: "ミッドナイト";
    readonly scheme: "dark";
    readonly description: "紺の地に藍色のアクセント。夜間向けの落ち着いたダーク";
    readonly swatch: {
        readonly canvas: "10 16 34";
        readonly surface: "16 25 50";
        readonly accent: "79 70 229";
    };
}, {
    readonly key: "sepia";
    readonly name: "セピア";
    readonly scheme: "light";
    readonly description: "紙とインクの色。まぶしさを抑えた暖色のライト";
    readonly swatch: {
        readonly canvas: "245 240 231";
        readonly surface: "252 249 243";
        readonly accent: "146 84 34";
    };
}, {
    readonly key: "forest";
    readonly name: "フォレスト";
    readonly scheme: "light";
    readonly description: "生成りの地に深緑のアクセント";
    readonly swatch: {
        readonly canvas: "243 241 232";
        readonly surface: "251 250 244";
        readonly accent: "22 96 64";
    };
}, {
    readonly key: "sakura";
    readonly name: "サクラ";
    readonly scheme: "light";
    readonly description: "白地に淡いピンク。やわらかい印象";
    readonly swatch: {
        readonly canvas: "252 245 247";
        readonly surface: "255 255 255";
        readonly accent: "190 24 93";
    };
}, {
    readonly key: "contrast";
    readonly name: "ハイコントラスト";
    readonly scheme: "light";
    readonly description: "黒文字・濃い罫線。本文と状態色は 7:1 以上（AAA）";
    readonly swatch: {
        readonly canvas: "255 255 255";
        readonly surface: "255 255 255";
        readonly accent: "0 56 184";
    };
}];
export type PaletteThemeKey = (typeof PALETTE_THEMES)[number]['key'];
export declare const DEFAULT_PALETTE_THEME: PaletteThemeKey;
/** すべてのテーマクラス（付け替え時に一旦外す用）。`theme-dark` を含む。 */
export declare const PALETTE_THEME_CLASS_NAMES: readonly string[];
/**
 * `<html>` に付けるクラス。light は空（`:root` が既定）、ダーク系は `theme-dark` も付ける。
 * 例: paletteThemeClassNames('midnight') → ['theme-dark', 'theme-midnight']
 */
export declare function paletteThemeClassNames(key: PaletteThemeKey): string[];
/** `<html>` のテーマクラスを付け替える（ブラウザ専用）。 */
export declare function applyPaletteTheme(key: PaletteThemeKey, root?: HTMLElement): void;
declare const status: (s: string) => {
    soft: string;
    ink: string;
    solid: string;
};
/**
 * Tailwind の色（`theme.extend.colors` にそのまま入る）。
 * `bg-canvas` `bg-surface` `bg-surface-subtle` `text-ink-muted` `border-line-strong`
 * `bg-accent/15` `text-accent-ink` `text-on-accent` `bg-danger-soft` `text-cat-3-ink` …
 */
export declare const paletteColors: {
    readonly canvas: string;
    readonly surface: {
        readonly DEFAULT: string;
        readonly subtle: string;
        readonly muted: string;
    };
    readonly ink: {
        readonly DEFAULT: string;
        readonly muted: string;
        readonly faint: string;
    };
    readonly line: {
        readonly DEFAULT: string;
        readonly strong: string;
    };
    readonly accent: {
        readonly DEFAULT: string;
        readonly soft: string;
        readonly ink: string;
    };
    readonly 'on-accent': string;
    readonly success: {
        soft: string;
        ink: string;
        solid: string;
    };
    readonly warning: {
        soft: string;
        ink: string;
        solid: string;
    };
    readonly danger: {
        soft: string;
        ink: string;
        solid: string;
    };
    readonly cat: Record<"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8", ReturnType<typeof status>>;
};
/**
 * tailwind.config の `presets: [tailwindPreset]` に 1 行で入れる。
 * 既存の色（gray / blue …）は消さない（extend）。
 */
export declare const tailwindPreset: {
    theme: {
        extend: {
            colors: {
                readonly canvas: string;
                readonly surface: {
                    readonly DEFAULT: string;
                    readonly subtle: string;
                    readonly muted: string;
                };
                readonly ink: {
                    readonly DEFAULT: string;
                    readonly muted: string;
                    readonly faint: string;
                };
                readonly line: {
                    readonly DEFAULT: string;
                    readonly strong: string;
                };
                readonly accent: {
                    readonly DEFAULT: string;
                    readonly soft: string;
                    readonly ink: string;
                };
                readonly 'on-accent': string;
                readonly success: {
                    soft: string;
                    ink: string;
                    solid: string;
                };
                readonly warning: {
                    soft: string;
                    ink: string;
                    solid: string;
                };
                readonly danger: {
                    soft: string;
                    ink: string;
                    solid: string;
                };
                readonly cat: Record<"1" | "2" | "3" | "4" | "5" | "6" | "7" | "8", ReturnType<typeof status>>;
            };
        };
    };
};
export {};
//# sourceMappingURL=palette.d.ts.map