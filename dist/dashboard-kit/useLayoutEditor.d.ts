import type { LayoutItem, WidgetDef } from './types';
export declare function useLayoutEditor<T extends LayoutItem>({ layout, defs, commit, onStart, onCancel, resetKey, }: {
    layout: T[];
    defs: readonly WidgetDef[];
    /** 完了時に 1 回だけ呼ぶ（保存）。 */
    commit: (next: T[]) => void;
    /** 編集開始時に呼ぶ（遅れて届いたサーバー応答で土台が変わらないようにする等）。 */
    onStart?: () => void;
    /** 保存せずに編集を終えたとき（やめる・変更なしの完了・resetKey の変化）に呼ぶ。 */
    onCancel?: () => void;
    /** 変わったら下書きを捨てる（アカウント切替など。旧キーの下書きを新しい対象に保存しない）。 */
    resetKey?: string;
}): {
    editing: boolean;
    current: T[];
    start: () => void;
    done: () => void;
    cancel: () => void;
    reorder: (a: string, o: string) => void;
    remove: (id: string) => void;
    cycleSize: (id: string) => void;
    add: (id: string) => void;
};
//# sourceMappingURL=useLayoutEditor.d.ts.map