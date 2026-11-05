export type SummaryTileTone = 'slate' | 'emerald' | 'sky' | 'amber' | 'rose' | 'gray';
export declare function SummaryTile({ label, sublabel, value, tone, variant, }: {
    label: string;
    sublabel?: string;
    value: number | string;
    tone?: SummaryTileTone;
    /**
     * 'card'（既定）は従来の枠付き。'flat' は枠なし一覧（ADMIN_FLAT_*）へ載せ替えた画面用で、
     * 一覧と同じく外枠・角丸を持たない（2026-09-23 請求ページから。他画面は据え置き）。
     */
    variant?: 'card' | 'flat';
}): import("react").JSX.Element;
//# sourceMappingURL=SummaryTile.d.ts.map