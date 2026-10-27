import type { WidgetPreview } from './types';
export interface AddWidgetCandidate {
    id: string;
    title: string;
    description?: string;
    /** true なら選べない（Plus 未契約など）。 */
    disabled?: boolean;
    /** 候補に付ける小さなバッジ（例: 「Plus」）。 */
    badge?: string;
    /** true なら「おすすめ」の小さなタグを付ける。 */
    recommended?: boolean;
    /** true なら追加済み。押せないが見本は見えたまま、チェックと「追加済み」を出す。 */
    added?: boolean;
    /** 見本の種類（未指定は 'stats'）。 */
    preview?: WidgetPreview;
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
    /**
     * true なら複数選択モード: 押すと選択が切り替わり（aria-pressed）、「追加する」でまとめて onPickMany を呼ぶ。
     * disabled の候補は選べない。省略（false）は従来どおり、押した 1 つを onPick で追加して閉じる前提。
     */
    multiple?: boolean;
    onPickMany?: (ids: string[]) => void;
    /** 見出し（既定: 複数選択は「ウィジェットを選ぶ」、1 つ追加は「ウィジェットを追加」）。 */
    title?: string;
    /** 見出しの下の説明（複数選択のときの既定あり）。 */
    hint?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** 複数選択のフッターのボタン（やめる）。 */
    footerButtonClassName?: string;
    /** 複数選択のフッターの主ボタン（追加する）。 */
    footerPrimaryClassName?: string;
    /** 複数選択のフッター（スクロール中も下に貼り付く）の背景。シートと同じ色を渡す（候補が透けないように）。 */
    footerClassName?: string;
    /** 選択中の候補に足すクラス。 */
    selectedClassName?: string;
}
export declare function AddWidgetSheet({ open, candidates, onPick, onClose, sheetClassName, candidateClassName, scrimClassName, multiple, onPickMany, title, hint, confirmLabel, cancelLabel, footerButtonClassName, footerPrimaryClassName, selectedClassName, footerClassName, }: AddWidgetSheetProps): import("react").ReactPortal | null;
//# sourceMappingURL=AddWidgetSheet.d.ts.map