export interface SelectableCandidate {
    id: string;
    disabled?: boolean;
    /** true なら追加済み（選べない）。 */
    added?: boolean;
}
/** 選択を切り替える。disabled・added の候補、候補にない id は選べない（今の選択をそのまま返す）。 */
export declare function toggleSelected(selected: readonly string[], candidates: readonly SelectableCandidate[], id: string): string[];
/** 確定する id。候補の並び順で、今も選べる（候補にあって disabled でも added でもない）ものだけ。 */
export declare function confirmedSelection(selected: readonly string[], candidates: readonly SelectableCandidate[]): string[];
//# sourceMappingURL=selection.d.ts.map