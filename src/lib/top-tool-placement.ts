// 道具バー（TopToolCapsule）の「帯に出す道具」を決める規則。
//
// 2026-09-22 ユーザー決定（案A）: 帯にワンクリックで出す道具は
//   「新規（primary の ＋）」＋「一覧を最新にする（key='refresh'）」＋あと最大3個 ＝ 既定 5 個まで。
// それ以外の道具は帯に出さず、帯の右端の「▾」で開く縦一覧パネルからだけ実行する。
//
// 純粋な関数としてここに置くのは、規則そのものをテストできるようにするため
// （コンポーネント側は .tsx で、このリポジトリの vitest は node 環境の *.test.ts しか拾わない）。

/** 帯に出すか一覧のみにするか。既定は 'bar'。 */
export type TopToolPlacement = 'bar' | 'list';

export interface TopToolPlacementInput {
  key: string;
  placement?: TopToolPlacement;
  primary?: boolean;
}

/** 帯に必ず残す道具（新規の ＋ と 更新）。 */
function isAlwaysOnBar(item: TopToolPlacementInput): boolean {
  return !!item.primary || item.key === 'refresh';
}

/**
 * 帯に残す道具の key を返す（並びは呼び出し側の定義順のまま使うこと）。
 * - placement: 'list' の道具は最初から対象外。
 * - 'bar' の道具が maxBarItems を超えたら、超えた分は自動的に一覧のみへ回す。
 *   そのとき primary と 'refresh' は優先して残す（画面ごとの並び順に関係なく主操作は帯に残る）。
 */
export function selectBarItemKeys(items: TopToolPlacementInput[], maxBarItems: number): Set<string> {
  const candidates = items.filter((item) => (item.placement ?? 'bar') === 'bar');
  if (candidates.length <= maxBarItems) return new Set(candidates.map((item) => item.key));
  const kept = new Set<string>();
  for (const item of candidates) {
    if (kept.size >= maxBarItems) break;
    if (isAlwaysOnBar(item)) kept.add(item.key);
  }
  for (const item of candidates) {
    if (kept.size >= maxBarItems) break;
    kept.add(item.key);
  }
  return kept;
}

/** 帯からあふれた（＝'bar' 指定なのに一覧のみへ回った）道具。開発時の警告に使う。 */
export function overflowedBarItems<T extends TopToolPlacementInput>(items: T[], barKeys: Set<string>): T[] {
  return items.filter((item) => (item.placement ?? 'bar') === 'bar' && !barKeys.has(item.key));
}
