const DAY_MS = 24 * 60 * 60 * 1e3;
function toMs(v) {
  if (v == null || v === "") return null;
  const t = v instanceof Date ? v.getTime() : new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}
function computePeriodState(input) {
  const start = toMs(input.start);
  const end = toMs(input.end);
  const now = toMs(input.now) ?? Date.now();
  if (start != null && now < start) {
    const daysUntilStart = Math.max(1, Math.ceil((start - now) / DAY_MS));
    return { phase: "upcoming", ratio: 0, daysLeft: null, daysUntilStart, label: `${daysUntilStart}\u65E5\u5F8C\u306B\u958B\u59CB` };
  }
  if (end != null && now >= end) {
    return { phase: "ended", ratio: 1, daysLeft: null, daysUntilStart: null, label: "\u7D42\u4E86" };
  }
  if (end == null) {
    return { phase: start == null ? "unknown" : "active", ratio: 0, daysLeft: null, daysUntilStart: null, label: start == null ? "\u671F\u9593\u672A\u8A2D\u5B9A" : "\u7D42\u4E86\u65E5\u306A\u3057" };
  }
  const daysLeft = Math.max(0, Math.ceil((end - now) / DAY_MS));
  const total = start != null ? end - start : 0;
  const ratio = total > 0 ? Math.min(1, Math.max(0, (now - start) / total)) : 0;
  const label = end - now < DAY_MS ? "\u672C\u65E5\u307E\u3067" : `\u3042\u3068${daysLeft}\u65E5`;
  return { phase: "active", ratio, daysLeft, daysUntilStart: null, label };
}
export {
  computePeriodState
};
//# sourceMappingURL=period.js.map