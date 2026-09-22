import { ReactNode } from 'react';
/**
 * 画面下中央の一括操作ピル（反転ガラス）の共通部品。
 *
 * 決定（2026-09-22 ユーザー）:
 *  - 道具バー＝選択不要の操作／一括操作ピル＝選択した行への操作（2026-09-15 決定の再確認）。
 *  - ピルの並びは「次にやること」順。主操作だけアクセント塗り、ほかはゴースト。
 *  - 左に「いま何を選んでいて、何が残っているか」（N件選択・CSV未出力 n …）を出す。
 *  - 押せない操作は消さずに disabled ＋ 理由のツールチップで示す。
 *
 * レイアウトは「左: 状態テキスト＋すべて選択 ／ 中: 主操作 ／ 右: 副操作＋選択解除」。
 * 反転ガラス（.sb-bulk-bar / .sb-bulk-btn / .sb-bulk-primary。globals.css）は据え置きで、
 * 出荷・入荷・返品・振替のどの一覧でも同じ流儀で載せ替えられるようにしてある
 * （今回の載せ替えは出荷のみ。入荷・返品・振替は別PR）。
 */
/** ピル左側に出す「選択の中身」。count が 0 の行は呼び出し側で落としてよい（ここでは出す）。 */
export type BulkPillStat = {
    key: string;
    label: string;
    count: number;
    /** 「残っている作業」は少し強めに出す（未出力・未入力・未ピッキング等）。 */
    tone?: 'plain' | 'warn';
    title?: string;
};
export type BulkPillMenuItem = {
    key: string;
    label: string;
    description?: string;
    onClick: () => void;
    disabled?: boolean;
    /** disabled のときにツールチップで出す理由。 */
    disabledReason?: string;
    /** 右端に出す件数（省略可）。 */
    count?: number;
    separatorBefore?: boolean;
};
export type BulkPillAction = {
    key: string;
    label: string;
    /** 押したときの実処理。menuItems だけ渡した場合は省略可（＝メニューを開くボタンになる）。 */
    onClick?: () => void;
    busy?: boolean;
    /** busy のときのラベル（例: 「確定処理中…」）。 */
    busyLabel?: string;
    disabled?: boolean;
    /** disabled のときにツールチップで出す理由（「送り状番号が未入力の出荷があります」等）。 */
    disabledReason?: string;
    title?: string;
    /** ▾ で開くメニュー。onClick と両方あるとスプリットボタンになる。 */
    menuItems?: BulkPillMenuItem[];
    menuAriaLabel?: string;
    /** 主操作だけ 'primary'（アクセント塗り）。既定はゴースト。 */
    tone?: 'primary' | 'ghost' | 'danger';
    /** 既存の独自ポップオーバー部品（出荷グループ選択など）をそのまま置く口。 */
    render?: ReactNode;
};
export declare function BulkActionPill({ ariaLabel, dataTour, selectedCount, selectedLabel, stats, leading, primary, secondary, onClear, clearLabel, error, }: {
    ariaLabel: string;
    dataTour?: string;
    selectedCount: number;
    selectedLabel?: string;
    /** 「CSV未出力 3」など、選んだ行の残作業。 */
    stats?: BulkPillStat[];
    /** 状態テキストの直後（例: 「すべて選択（N件）」）。 */
    leading?: ReactNode;
    /** 次にやること（アクセント塗りは先頭の tone: 'primary' だけにする）。 */
    primary?: BulkPillAction[];
    /** 戻す・差し戻すなどの副操作。 */
    secondary?: BulkPillAction[];
    onClear?: () => void;
    clearLabel?: string;
    /** 実行に失敗したときの理由（ピルの下に出す）。 */
    error?: ReactNode;
}): import("react").JSX.Element;
export default BulkActionPill;
//# sourceMappingURL=BulkActionPill.d.ts.map