// 並び・表示・サイズの汎用ロジック（Amazon 非依存）。保存形式への変換は呼び出し側が持つ。
import { SIZE_COLS, WIDGET_SIZES } from './sizes';
import type { LayoutItem, WidgetDef, WidgetSize } from './types';

export function isWidgetSize(value: unknown): value is WidgetSize {
  return typeof value === 'string' && (WIDGET_SIZES as readonly string[]).includes(value);
}

/** 旧形式（列数 w）→ サイズ。4→S, 6→M, 8→L, 12→W。それ以外は null。 */
export function legacyWidthToSize(w: unknown): WidgetSize | null {
  switch (w) {
    case 4: return 'S';
    case 6: return 'M';
    case 8: return 'L';
    case 12: return 'W';
    default: return null;
  }
}

/** 選べるサイズの中で、列数がいちばん近いもの。同点なら大きい方。 */
export function snapSize(allowed: readonly WidgetSize[], desired: WidgetSize): WidgetSize {
  if (allowed.includes(desired)) return desired;
  const target = SIZE_COLS[desired];
  let best = allowed[0];
  for (const s of allowed) {
    const d = Math.abs(SIZE_COLS[s] - target);
    const bd = Math.abs(SIZE_COLS[best] - target);
    if (d < bd || (d === bd && SIZE_COLS[s] > SIZE_COLS[best])) best = s;
  }
  return best;
}

export function defaultLayoutFor(defs: readonly WidgetDef[]): LayoutItem[] {
  return defs.map((d) => ({ id: d.id, on: d.defaultOn, size: d.defaultSize }));
}

/**
 * 保存値（壊れていてもよい）を定義に合わせる。
 * 未知 id は捨てる／重複は最初のものだけ／足りない id は既定で末尾／on が真偽値でなければ既定／
 * size と旧 w の両方を読む（size 優先）。選べないサイズは snapSize で寄せる。
 */
export function normalizeItems(defs: readonly WidgetDef[], raw: unknown): LayoutItem[] {
  if (!Array.isArray(raw)) return defaultLayoutFor(defs);
  const byId = new Map(defs.map((d) => [d.id, d]));
  const seen = new Set<string>();
  const result: LayoutItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const { id, on, size, w } = entry as { id?: unknown; on?: unknown; size?: unknown; w?: unknown };
    if (typeof id !== 'string' || !byId.has(id) || seen.has(id)) continue;
    seen.add(id);
    const def = byId.get(id)!;
    const desired = isWidgetSize(size) ? size : legacyWidthToSize(w) ?? def.defaultSize;
    result.push({
      id,
      on: typeof on === 'boolean' ? on : def.defaultOn,
      size: snapSize(def.sizes, desired),
    });
  }
  for (const d of defs) {
    if (!seen.has(d.id)) result.push({ id: d.id, on: d.defaultOn, size: d.defaultSize });
  }
  return result;
}

export function visibleItems<T extends LayoutItem>(layout: readonly T[]): T[] {
  return layout.filter((i) => i.on);
}

/** active を over のいる位置へ移す（非表示を含む全体の並びの中で）。 */
export function reorderItems<T extends LayoutItem>(layout: T[], activeId: string, overId: string): T[] {
  const from = layout.findIndex((i) => i.id === activeId);
  const to = layout.findIndex((i) => i.id === overId);
  if (from < 0 || to < 0 || from === to) return layout;
  const next = layout.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/** サイズを選べる順に 1 つ進める。選べるサイズが 1 つなら変えない。 */
export function cycleItemSize<T extends LayoutItem>(layout: T[], id: string, defs: readonly WidgetDef[]): T[] {
  const def = defs.find((d) => d.id === id);
  if (!def || def.sizes.length < 2) return layout;
  return layout.map((i) => {
    if (i.id !== id) return i;
    const idx = def.sizes.indexOf(i.size);
    return { ...i, size: def.sizes[(idx + 1) % def.sizes.length] };
  });
}

export function removeItem<T extends LayoutItem>(layout: T[], id: string): T[] {
  return layout.map((i) => (i.id === id ? { ...i, on: false } : i));
}

/** 表示にする。表示中の末尾（非表示の手前）に足す。 */
export function appendItem<T extends LayoutItem>(layout: T[], id: string): T[] {
  const target = layout.find((i) => i.id === id);
  if (!target || target.on) return layout;
  const rest = layout.filter((i) => i.id !== id);
  let lastOn = -1;
  rest.forEach((i, idx) => { if (i.on) lastOn = idx; });
  const next = rest.slice();
  next.splice(lastOn + 1, 0, { ...target, on: true });
  return next;
}

/** 下書き状態が今の resetKey のものなら items、違う（別アカウントの）ものや無しなら null。 */
export function draftFor<T>(state: { key: string | undefined; items: T[] } | null, key: string | undefined): T[] | null {
  return state && state.key === key ? state.items : null;
}
