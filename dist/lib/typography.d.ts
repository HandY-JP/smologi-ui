export type TypeStep = 'meta' | 'note' | 'label' | 'body' | 'item' | 'title' | 'heading' | 'figure';
export type WeightStep = 'normal' | 'medium' | 'strong';
/** サイズ 8 段 → Tailwind 任意値クラス（文字サイズ + 行の高さ）。 */
export declare const TEXT: {
    readonly meta: "text-[11px] leading-[16px]";
    readonly note: "text-[12px] leading-[18px]";
    readonly label: "text-[13px] leading-[20px]";
    readonly body: "text-[14px] leading-[22px]";
    readonly item: "text-[15px] leading-[22px]";
    readonly title: "text-[18px] leading-[26px]";
    readonly heading: "text-[22px] leading-[30px]";
    readonly figure: "text-[28px] leading-[36px]";
};
/** 太さ 3 段 → Tailwind クラス。bold / extrabold / black は使わない。 */
export declare const WEIGHT: {
    readonly normal: "font-normal";
    readonly medium: "font-medium";
    readonly strong: "font-semibold";
};
/** 数字の桁をそろえる（金額・件数・コード）。 */
export declare const NUM_CLASS = "tabular-nums";
export interface TypeScaleEntry {
    name: TypeStep;
    px: number;
    lineHeight: number;
    /** 日本語の用途（ドキュメント・テストの見出し用）。 */
    usage: string;
}
/** サイズ 8 段の一覧（docs / テスト用）。 */
export declare const TYPE_SCALE: readonly TypeScaleEntry[];
/**
 * 旧サイズ → 段の対応。
 * - px: 下限（含む）から次の下限の手前まで。7〜11.5px は meta、12〜12.5 は note、13〜13.5 は label、
 *   14〜14.5 は body、15〜16 は item、17〜19 は title、20〜27 は heading（25〜27 も heading）、28 以上は figure。
 * - tailwind: Tailwind 標準のサイズ名。
 */
export declare const TYPE_SIZE_MAP: {
    readonly px: readonly [{
        readonly from: 0;
        readonly step: "meta";
    }, {
        readonly from: 12;
        readonly step: "note";
    }, {
        readonly from: 13;
        readonly step: "label";
    }, {
        readonly from: 14;
        readonly step: "body";
    }, {
        readonly from: 15;
        readonly step: "item";
    }, {
        readonly from: 17;
        readonly step: "title";
    }, {
        readonly from: 20;
        readonly step: "heading";
    }, {
        readonly from: 28;
        readonly step: "figure";
    }];
    readonly tailwind: {
        readonly xs: "note";
        readonly sm: "body";
        readonly base: "item";
        readonly lg: "title";
        readonly xl: "heading";
        readonly '2xl': "heading";
        readonly '3xl': "figure";
        readonly '4xl': "figure";
        readonly '5xl': "figure";
        readonly '6xl': "figure";
        readonly '7xl': "figure";
        readonly '8xl': "figure";
        readonly '9xl': "figure";
    };
};
/** px の値（例 13.5）→ 段。負数・NaN は meta 扱いにせず undefined。 */
export declare function typeStepForPx(px: number): TypeStep | undefined;
/** Tailwind のサイズ名（'sm' など。`text-` は付けない）→ 段。 */
export declare function typeStepForTailwind(name: string): TypeStep | undefined;
/** 旧い太さのクラス（`font-` 付き）→ 3 段。 */
export declare const WEIGHT_MAP: {
    readonly 'font-thin': "normal";
    readonly 'font-extralight': "normal";
    readonly 'font-light': "normal";
    readonly 'font-normal': "normal";
    readonly 'font-medium': "medium";
    readonly 'font-semibold': "strong";
    readonly 'font-bold': "strong";
    readonly 'font-extrabold': "strong";
    readonly 'font-black': "strong";
};
//# sourceMappingURL=typography.d.ts.map