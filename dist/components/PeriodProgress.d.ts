import { type PeriodInput } from '../lib/period';
export declare function PeriodProgress({ start, end, now, showLabel, className, }: {
    start?: PeriodInput;
    end?: PeriodInput;
    /** 現在時刻。省略すると描画時の現在時刻。 */
    now?: PeriodInput;
    /** 線の右に文言を出す。 */
    showLabel?: boolean;
    className?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=PeriodProgress.d.ts.map