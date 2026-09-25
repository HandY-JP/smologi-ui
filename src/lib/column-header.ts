// 列見出しの「⋮」メニュー（components/ColumnHeaderMenu.tsx）の型と純粋ロジック。
//
// 部品から切り出してあるのは、アプリ側が「画面の state ⇄ 列メニューの指定」の写像を
// テストで押さえられるようにするため（並び替えのトグル順・絞り込みの有効判定・解除値）。
// smologi 本体の src/components/layout/ColumnHeaderMenu.tsx と同じ名前・同じ形を保つ
// （smologi が後でこのパッケージへ載せ替えるときに呼び出し側を書き換えずに済むように）。

export type ColumnSortDir = 'asc' | 'desc';

/** 列ごとの並び替えラベル。「昇順 / 降順」ではなく、その列で自然な言い方を入れる。 */
export interface ColumnSortLabels {
  /** 昇順にあたる並びの言い方（例: 「名前順（あ→ん／A→Z）」「少ない順」「安い順」） */
  asc: string;
  /** 降順にあたる並びの言い方（例: 「名前の逆順」「多い順」「高い順」） */
  desc: string;
}

/** ラベルを持たない列の汎用語。「昇順」を避ける。 */
export const GENERIC_COLUMN_SORT_LABELS: ColumnSortLabels = { asc: '小さい順', desc: '大きい順' };

export interface ColumnHeaderSortSpec {
  /** この列が今の並び替え列なら向き。別の列（または未ソート）なら null。 */
  dir: ColumnSortDir | null;
  labels: ColumnSortLabels;
  /**
   * 見出しの文字クリックで最初に適用する向き（既定 'asc'）。
   * 数量・金額のように「多い順を先に見たい」列は 'desc' を渡す。
   */
  firstDir?: ColumnSortDir;
  /**
   * 選べる向き（既定は両方）。サーバー側に片方の並びしか無い列（例: 「30日販売が多い順」だけ）は
   * `['desc']` のように絞る。メニューには選べる向きだけを出し、文字クリックは「その向き ↔ 解除」になる。
   */
  available?: readonly ColumnSortDir[];
  onSort: (dir: ColumnSortDir) => void;
  onClear: () => void;
}

/** 一覧全体の既定の並び（どの列のメニューからでも戻れるようにする）。 */
export interface ColumnHeaderPreset {
  key: string;
  label: string;
  active: boolean;
  onSelect: () => void;
}

export interface ColumnHeaderVariantOption {
  value: string;
  label: string;
  hint?: string;
}

/** その列だけの表示切替（商品名＝商品名 / システム商品名 / 両方、原価＝税抜 / 税込 など）。 */
export interface ColumnHeaderVariantSpec {
  /** 区画の見出し（例: 「表示する内容」）。 */
  label: string;
  value: string;
  options: readonly ColumnHeaderVariantOption[];
  onChange: (value: string) => void;
}

/** 列の左右移動。端の列など動かせない向きは undefined にする（メニューでは押せない表示）。 */
export interface ColumnHeaderMoveSpec {
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}

// ---------------------------------------------------------------------------
// 列ごとの絞り込み（型付きの 5 種）
// ---------------------------------------------------------------------------

interface ColumnFilterBase {
  /** 区画の見出し（省略時は「この列で絞り込み」）。1 列に複数の絞り込みを置くときは必ず付ける。 */
  label?: string;
  /** 補足（入力欄の下に小さく出す）。 */
  hint?: string;
  /** 押せない理由（例: 「広告の連携が無いため絞り込めません」）。あると入力を無効にして理由を出す。 */
  disabledReason?: string;
}

/** 文字を含む。 */
export interface ColumnTextFilterSpec extends ColumnFilterBase {
  kind: 'text';
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

/** 数値の範囲。値は入力欄そのままの文字列（空＝指定なし）。 */
export interface ColumnNumberRangeFilterSpec extends ColumnFilterBase {
  kind: 'numberRange';
  min: string;
  max: string;
  /** 単位（例: 「¥」「個」「日」）。 */
  unit?: string;
  /** 単位を数値の前に置くか後ろに置くか（既定: ¥ は前、それ以外は後ろ）。 */
  unitPosition?: 'prefix' | 'suffix';
  /** 小数を許すか（既定 false＝整数だけ）。 */
  allowDecimal?: boolean;
  onChange: (range: { min: string; max: string }) => void;
}

export interface ColumnEnumFilterOption {
  value: string;
  label: string;
  hint?: string;
}

/** 選択肢から選ぶ。`multiple: false` は 1 つだけ（先頭に「すべて」を出す）。 */
export interface ColumnEnumFilterSpec extends ColumnFilterBase {
  kind: 'enum';
  options: readonly ColumnEnumFilterOption[];
  /** 選択中の値（空配列＝すべて）。単一選択でも配列で渡す。 */
  value: readonly string[];
  /** 既定 true（複数選択）。 */
  multiple?: boolean;
  onChange: (value: string[]) => void;
}

/** はい / いいえ。null＝すべて。falseLabel を省くと「すべて / はい」の 2 択になる。 */
export interface ColumnBooleanFilterSpec extends ColumnFilterBase {
  kind: 'boolean';
  value: boolean | null;
  trueLabel: string;
  falseLabel?: string;
  onChange: (value: boolean | null) => void;
}

/** 日付の範囲（YYYY-MM-DD。空＝指定なし）。 */
export interface ColumnDateRangeFilterSpec extends ColumnFilterBase {
  kind: 'dateRange';
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}

export type ColumnFilterSpec =
  | ColumnTextFilterSpec
  | ColumnNumberRangeFilterSpec
  | ColumnEnumFilterSpec
  | ColumnBooleanFilterSpec
  | ColumnDateRangeFilterSpec;

export type ColumnFilterKind = ColumnFilterSpec['kind'];

// ---------------------------------------------------------------------------
// 純粋ロジック
// ---------------------------------------------------------------------------

/** 選べる向き（既定は両方）。空配列を渡された場合も両方として扱う。 */
export function availableColumnSortDirs(sort: Pick<ColumnHeaderSortSpec, 'available'>): ColumnSortDir[] {
  const list = (sort.available ?? []).filter((dir): dir is ColumnSortDir => dir === 'asc' || dir === 'desc');
  return list.length > 0 ? Array.from(new Set(list)) : ['asc', 'desc'];
}

/**
 * 見出しの文字クリックで次に適用する向き。null＝並び替えを解除する。
 * 1回目＝firstDir（選べないときは選べる方）→ 2回目＝逆向き（選べるときだけ）→ 3回目＝解除。
 */
export function nextColumnSortDir(
  sort: Pick<ColumnHeaderSortSpec, 'dir' | 'firstDir' | 'available'>,
): ColumnSortDir | null {
  const dirs = availableColumnSortDirs(sort);
  const preferred = sort.firstDir ?? 'asc';
  const first = dirs.includes(preferred) ? preferred : dirs[0];
  if (!sort.dir) return first;
  if (sort.dir === first) {
    const other: ColumnSortDir = first === 'asc' ? 'desc' : 'asc';
    return dirs.includes(other) ? other : null;
  }
  return null;
}

/** いまの並びの短い言い方（ツールチップ用。例「多い順」）。 */
export function activeColumnSortLabel(sort: ColumnHeaderSortSpec | undefined): string | null {
  if (!sort || !sort.dir) return null;
  return sort.dir === 'asc' ? sort.labels.asc : sort.labels.desc;
}

/** その絞り込みが効いているか（見出しのじょうご表示と「解除」の可否に使う）。 */
export function isColumnFilterActive(filter: ColumnFilterSpec): boolean {
  switch (filter.kind) {
    case 'text':
      return filter.value.trim() !== '';
    case 'numberRange':
      return filter.min.trim() !== '' || filter.max.trim() !== '';
    case 'enum':
      return filter.value.length > 0;
    case 'boolean':
      return filter.value !== null;
    case 'dateRange':
      return filter.from !== '' || filter.to !== '';
    default:
      return false;
  }
}

/** 列に置いた絞り込みのどれかが効いているか。 */
export function anyColumnFilterActive(filters: readonly ColumnFilterSpec[] | undefined): boolean {
  return Boolean(filters?.some(isColumnFilterActive));
}

/** その絞り込みを「指定なし」に戻す（onChange を空の値で呼ぶ）。 */
export function clearColumnFilter(filter: ColumnFilterSpec): void {
  if (!isColumnFilterActive(filter)) return;
  switch (filter.kind) {
    case 'text':
      filter.onChange('');
      return;
    case 'numberRange':
      filter.onChange({ min: '', max: '' });
      return;
    case 'enum':
      filter.onChange([]);
      return;
    case 'boolean':
      filter.onChange(null);
      return;
    case 'dateRange':
      filter.onChange({ from: '', to: '' });
      return;
    default:
      return;
  }
}

/**
 * 数値入力の正規化。全角数字・カンマ・前後空白を受け、数値として読めない文字は捨てる。
 * 整数だけの列（既定）は小数点以下を捨てる。空文字は空のまま返す（＝指定なし）。
 */
export function normalizeColumnNumberInput(raw: string, allowDecimal = false): string {
  const half = raw
    .replace(/[０-９．－]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[,，\s]/g, '');
  const pattern = allowDecimal ? /-?\d+(?:\.\d+)?/ : /-?\d+/;
  const match = half.match(pattern);
  return match ? match[0] : '';
}

/** 数値範囲の入力エラー（下限＞上限）。問題なければ null。 */
export function columnNumberRangeError(min: string, max: string): string | null {
  if (min === '' || max === '') return null;
  const a = Number(min);
  const b = Number(max);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return a > b ? '下限が上限より大きくなっています' : null;
}

/** 日付範囲の入力エラー（開始＞終了）。問題なければ null。 */
export function columnDateRangeError(from: string, to: string): string | null {
  if (!from || !to) return null;
  return from > to ? '開始日が終了日より後です' : null;
}

/** 絞り込みの今の値を 1 行で言う（ツールチップ・読み上げ用）。効いていなければ null。 */
export function columnFilterSummary(filter: ColumnFilterSpec): string | null {
  if (!isColumnFilterActive(filter)) return null;
  switch (filter.kind) {
    case 'text':
      return `「${filter.value.trim()}」を含む`;
    case 'numberRange': {
      const unit = filter.unit ?? '';
      const prefix = (filter.unitPosition ?? (unit === '¥' ? 'prefix' : 'suffix')) === 'prefix';
      const fmt = (v: string) => (prefix ? `${unit}${v}` : `${v}${unit}`);
      if (filter.min && filter.max) return `${fmt(filter.min)}〜${fmt(filter.max)}`;
      if (filter.min) return `${fmt(filter.min)}以上`;
      return `${fmt(filter.max)}以下`;
    }
    case 'enum': {
      const labels = filter.value.map((v) => filter.options.find((o) => o.value === v)?.label ?? v);
      return labels.join('・');
    }
    case 'boolean':
      return filter.value ? filter.trueLabel : (filter.falseLabel ?? 'いいえ');
    case 'dateRange':
      if (filter.from && filter.to) return `${filter.from}〜${filter.to}`;
      if (filter.from) return `${filter.from}以降`;
      return `${filter.to}以前`;
    default:
      return null;
  }
}

/**
 * 単一選択の enum を、画面の state（空文字＝すべて）と行き来させる小道具。
 * 既存の絞り込みメニューが `string`（'' ＝指定なし）で持っている state をそのまま渡せる。
 */
export function singleEnumValue(value: string): string[] {
  return value ? [value] : [];
}

/** singleEnumValue の逆。複数来たら最後に選んだもの（末尾）を採る。 */
export function singleEnumFromValues(values: readonly string[]): string {
  return values.length > 0 ? values[values.length - 1] : '';
}

/**
 * 「はいのみ」の boolean（state は true / false で、false ＝指定なし）と行き来させる小道具。
 * 例: 「原価未設定だけ」チェックボックス。
 */
export function flagFilterValue(checked: boolean): boolean | null {
  return checked ? true : null;
}

/** flagFilterValue の逆。「いいえ」は指定なしとして扱う（falseLabel を持たない列用）。 */
export function flagFromFilterValue(value: boolean | null): boolean {
  return value === true;
}
