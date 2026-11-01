// 期間（開始〜終了）と今から、進み具合と残り日数を出す純関数。PeriodProgress が使う。
// 日数は切り上げ（残り 1 時間でも「あと 1 日」ではなく「本日まで」と読ませる）。

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

const DAY_MS = 24 * 60 * 60 * 1000;

function toMs(v: PeriodInput): number | null {
  if (v == null || v === '') return null;
  const t = v instanceof Date ? v.getTime() : new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

export function computePeriodState(input: { start?: PeriodInput; end?: PeriodInput; now?: PeriodInput }): PeriodState {
  const start = toMs(input.start);
  const end = toMs(input.end);
  const now = toMs(input.now) ?? Date.now();

  if (start != null && now < start) {
    const daysUntilStart = Math.max(1, Math.ceil((start - now) / DAY_MS));
    return { phase: 'upcoming', ratio: 0, daysLeft: null, daysUntilStart, label: `${daysUntilStart}日後に開始` };
  }
  if (end != null && now >= end) {
    return { phase: 'ended', ratio: 1, daysLeft: null, daysUntilStart: null, label: '終了' };
  }
  if (end == null) {
    return { phase: start == null ? 'unknown' : 'active', ratio: 0, daysLeft: null, daysUntilStart: null, label: start == null ? '期間未設定' : '終了日なし' };
  }
  const daysLeft = Math.max(0, Math.ceil((end - now) / DAY_MS));
  const total = start != null ? end - start : 0;
  const ratio = total > 0 ? Math.min(1, Math.max(0, (now - (start as number)) / total)) : 0;
  // 24 時間未満しか残っていなければ「本日まで」。
  const label = end - now < DAY_MS ? '本日まで' : `あと${daysLeft}日`;
  return { phase: 'active', ratio, daysLeft, daysUntilStart: null, label };
}
