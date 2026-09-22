import { type ReactNode } from 'react';
export interface GuideTourStep {
    /** ハイライト対象の CSS セレクタ（例: '[data-tour="save"]'）。省略時は中央にカードのみ表示 */
    target?: string;
    title: string;
    body: ReactNode;
}
export interface GuideMeta {
    id: string;
    label: string;
}
/** いまの画面で開始できるガイドの一覧（ヘルプドロワーが使う）。 */
export declare function useAvailableGuides(): GuideMeta[];
/** 指定 id のガイドを（表示済みでも）最初のステップから開始する。 */
export declare function startGuide(id: string): void;
/** 指定 storageKey のガイドが「表示済み」かどうかを追跡する（終了イベントで再評価）。 */
export declare function useGuideSeen(storageKey: string | null): boolean;
export declare function GuideTour({ storageKey, introTitle, introBody, steps, active, id, label, showIntroOnMount, startLabel, onStepChange }: {
    /** 表示済み記録のキー。ユーザー/顧客ごとに分けること */
    storageKey: string;
    introTitle: string;
    introBody: ReactNode;
    steps: GuideTourStep[];
    /** false の間はガイドを出さない（対象UIがまだ描画されていない画面状態など） */
    active?: boolean;
    /** ヘルプドロワーから再生できるようにする識別子（省略時はヘルプに出ない） */
    id?: string;
    /** ヘルプドロワーに表示する名前（省略時は introTitle） */
    label?: string;
    /** true のときは初回表示を自動で出す。false なら startGuide(id) など明示開始のみ。 */
    showIntroOnMount?: boolean;
    /** イントロの開始ボタンのラベル（省略時は「ガイドを開始」）。 */
    startLabel?: string;
    /**
     * 表示中のステップ番号が変わるたびに呼ばれる（ガイドを閉じている間は null）。
     * 「このステップの間だけ画面を一時的にその状態にする」（例: 先頭行を選択して
     * 一括操作ピルを出す）ような演出を呼び出し側で行うためのフック。
     */
    onStepChange?: (index: number | null) => void;
}): import("react").ReactPortal | null;
//# sourceMappingURL=GuideTour.d.ts.map