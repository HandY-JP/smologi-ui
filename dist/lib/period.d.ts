export type PeriodInput = Date | string | number | null | undefined;
export type PeriodPhase = 'upcoming' | 'active' | 'ended' | 'unknown';
export type PeriodState = {
    phase: PeriodPhase;
    /** 0〜1。開始前 0、終了後 1、期間が決まらないときは 0。 */
    ratio: number;
    /** 終了までの日数（切り上げ、0 以上）。終了が不明・終了後は null。 */
    daysLeft: number | null;
    /** 開始までの日数（切り上げ）。開始前だけ。 */
    daysUntilStart: number | null;
    /** 「あと3日」「本日まで」「3日後に開始」「終了」「期間未設定」。 */
    label: string;
};
export declare function computePeriodState(input: {
    start?: PeriodInput;
    end?: PeriodInput;
    now?: PeriodInput;
}): PeriodState;
//# sourceMappingURL=period.d.ts.map