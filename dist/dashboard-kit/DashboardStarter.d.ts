import type { ReactNode } from 'react';
export interface DashboardStarterProps {
    /** 「おすすめ」に入るウィジェット名（チップで並べる）。 */
    recommendedTitles: readonly string[];
    onRecommend: () => void;
    onPick: () => void;
    title?: string;
    description?: string;
    recommendLabel?: string;
    pickLabel?: string;
    /** 押せない間（保存中など）。 */
    busy?: boolean;
    /** 差し替えアイコン（既定はグリッド＋プラス）。 */
    icon?: ReactNode;
    /** カード本体（破線枠・背景・角丸）。 */
    className: string;
    /** アイコンを入れる角の丸い箱（背景色）。 */
    iconClassName: string;
    /** 主ボタン（おすすめ）。 */
    primaryClassName: string;
    /** 副ボタン（自分で選ぶ）。 */
    secondaryClassName: string;
    /** おすすめ名のチップ。 */
    chipClassName: string;
}
export declare function DashboardStarter({ recommendedTitles, onRecommend, onPick, title, description, recommendLabel, pickLabel, busy, icon, className, iconClassName, primaryClassName, secondaryClassName, chipClassName, }: DashboardStarterProps): import("react").JSX.Element;
//# sourceMappingURL=DashboardStarter.d.ts.map