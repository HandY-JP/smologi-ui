export interface AddWidgetCandidate {
    id: string;
    title: string;
    description?: string;
    /** true なら選べない（Plus 未契約など）。 */
    disabled?: boolean;
    /** 候補に付ける小さなバッジ（例: 「Plus」）。 */
    badge?: string;
}
export interface AddWidgetSheetProps {
    open: boolean;
    candidates: AddWidgetCandidate[];
    onPick: (id: string) => void;
    onClose: () => void;
    /** シート本体のクラス（ガラス・角丸・背景）。 */
    sheetClassName: string;
    /** 候補ボタンのクラス。 */
    candidateClassName: string;
    scrimClassName?: string;
}
export declare function AddWidgetSheet({ open, candidates, onPick, onClose, sheetClassName, candidateClassName, scrimClassName, }: AddWidgetSheetProps): import("react").ReactPortal | null;
//# sourceMappingURL=AddWidgetSheet.d.ts.map