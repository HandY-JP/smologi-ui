// 追加シートの複数選択のロジック（UI と分けてテストできるように）。
export interface SelectableCandidate {
  id: string;
  disabled?: boolean;
  /** true なら追加済み（選べない）。 */
  added?: boolean;
}

/** 選択を切り替える。disabled・added の候補、候補にない id は選べない（今の選択をそのまま返す）。 */
export function toggleSelected(selected: readonly string[], candidates: readonly SelectableCandidate[], id: string): string[] {
  const c = candidates.find((x) => x.id === id);
  if (!c || c.disabled || c.added) return [...selected];
  return selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
}

/** 確定する id。候補の並び順で、今も選べる（候補にあって disabled でも added でもない）ものだけ。 */
export function confirmedSelection(selected: readonly string[], candidates: readonly SelectableCandidate[]): string[] {
  return candidates.filter((c) => !c.disabled && !c.added && selected.includes(c.id)).map((c) => c.id);
}
