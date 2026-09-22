import type { SectionJumpItem } from './SectionJumpNav';
export interface SectionJumpMeasurement {
    /** item.key → ボタンの実寸（px）。 */
    widths: Map<string, number>;
    /** 「＋n ▾」ボタンの実寸（px）。 */
    moreWidthPx: number;
}
/**
 * ジャンプ一覧の各ボタンの実寸を返す。測ったことのある組み合わせはキャッシュから返すので、
 * 見出しが何個あっても実際の測定は「新しいラベル×件数」の分だけしか起きない。
 */
export declare function measureSectionJumpWidths(items: SectionJumpItem[]): SectionJumpMeasurement;
//# sourceMappingURL=section-jump-measure.d.ts.map