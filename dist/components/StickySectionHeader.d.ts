import { type ReactNode } from 'react';
export declare function StickySectionHeader({ topPx, colSpan, children, className, id, trailing, visuallyActive, onStuckChange, dataTour, }: {
    /** stuck 時に固定する top（px）。畳み時は浮遊カプセルの下（60px 目安）、通常時は上段バーの高さに合わせて呼び出し側が計算する。 */
    topPx: number;
    colSpan: number;
    children: ReactNode;
    className?: string;
    /** 見出しの実体（.sb-sticky-inner）に付ける id。「次のグループ／次の日付」ジャンプ導線の着地点として使う。 */
    id?: string;
    /** 見出し右端に置く要素（「次のグループ ▸」等）。無ければ何も出さない。 */
    trailing?: ReactNode;
    /** false のときは stuck でもガラス化しない（複数セクション同時 stuck の重なり防止。既定 true）。 */
    visuallyActive?: boolean;
    /** stuck 状態が変わるたびに呼ばれる（useLastStuckSection と組み合わせて使う）。 */
    onStuckChange?: (stuck: boolean) => void;
    /**
     * ガイドツアーのスポットライト対象にする data-tour 値。常に通常フローに残る td に付ける
     * （帯の div は stuck 中 body へ portal されるため、位置の基準に使えない）。
     * 同じ値を複数の見出しに付けないこと（querySelector は先頭1件しか見ない）。
     */
    dataTour?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=StickySectionHeader.d.ts.map