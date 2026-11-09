// 商品ラベルの文字まわりの小さな関数（省略・期限の書き方・コンディション判定）。

/**
 * 商品名を maxChars 以内に収める。入りきらないときは「先頭 + … + 末尾」にする
 * （型番やサイズが末尾に来る商品名が多いため、末尾を残す）。
 * maxChars は全角 1 文字を 1 として数える（呼び出し側が幅から決める）。
 */
export function truncateMiddle(text: string, maxChars: number): string {
  const chars = Array.from(text.trim());
  const max = Math.max(1, Math.floor(maxChars));
  if (chars.length <= max) return chars.join('');
  if (max === 1) return '…';
  if (max === 2) return `${chars[0]}…`;
  const rest = max - 1;
  const tail = Math.max(1, Math.floor(rest / 3));
  const head = rest - tail;
  return `${chars.slice(0, head).join('')}…${chars.slice(chars.length - tail).join('')}`;
}

/** 文字の見かけの幅（全角=1、半角=0.5）。省略の判定用。 */
export function visualLength(text: string): number {
  let total = 0;
  for (const ch of text) total += ch.charCodeAt(0) <= 0xff ? 0.5 : 1;
  return total;
}

/**
 * 見かけの幅が maxWidth（全角換算）に収まるよう、先頭＋…＋末尾で省略する。
 * 半角混じりの商品名でも幅に収まるように、文字数ではなく幅で刻む。
 */
export function fitName(text: string, maxWidth: number): string {
  const trimmed = text.trim();
  if (visualLength(trimmed) <= maxWidth) return trimmed;
  let lo = 1;
  let hi = Array.from(trimmed).length;
  let best = truncateMiddle(trimmed, 1);
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const candidate = truncateMiddle(trimmed, mid);
    if (visualLength(candidate) <= maxWidth) {
      best = candidate;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

export interface ExpiryParts {
  year: string;
  monthDay: string;
}

/** 'YYYY-MM-DD' を「2027年」「8月31日」に分ける（期限シールの唯一の書式）。不正な値は null。 */
export function formatExpiry(value: string | null | undefined): ExpiryParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? '').trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year: `${year}年`, monthDay: `${month}月${day}日` };
}

/** コンディション生値 → 表示名の対応表（ここ1か所。本番に存在する新品・中古4種のみ。それ以外の値の出荷は自前生成せず Amazon の PDF をそのまま印刷する）。キーは小文字化し、アンダースコア・ハイフン・空白を除いたもの。 */
const CONDITION_NAMES: Record<string, string> = {
  newitem: '新品',
  newnew: '新品',
  new: '新品',
  usedlikenew: '中古-ほぼ新品',
  usedverygood: '中古-非常に良い',
  usedgood: '中古-良い',
  usedacceptable: '中古-可',
};

/**
 * ラベルに印字するコンディション表示名。生値（NewItem / used_very_good など）を対応表で引く。
 * 対応表に無い値（コレクター・再生品など）は null（＝生成できない。呼び出し側は Amazon の PDF をそのまま印刷する）。
 */
export function conditionDisplayName(condition: string | null | undefined, _conditionLabel?: string | null): string | null {
  const key = String(condition ?? '').toLowerCase().replace(/[\s_-]/g, '');
  return (key && CONDITION_NAMES[key]) || null;
}

/** 幅 maxWidth に収まる分だけ残し、末尾を「…」にする（文字の途中では切らない）。収まるならそのまま。 */
export function truncateEndToWidth(text: string, maxWidth: number, measure: (t: string) => number): string {
  const chars = Array.from(text.trim());
  const full = chars.join('');
  if (measure(full) <= maxWidth + 1e-6) return full;
  let lo = 0;
  let hi = chars.length - 1;
  let best = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (measure(`${chars.slice(0, mid).join('')}…`) <= maxWidth + 1e-6) {
      best = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return `${chars.slice(0, best).join('')}…`;
}

/** ラベルの文字行に足せる追加項目（⚙ のチェックボックス。選んだ順に並ぶ）。 */
export type LabelExtraKey = 'sku' | 'needsExpiry' | 'setUnits';

export const LABEL_EXTRA_OPTIONS: readonly { key: LabelExtraKey; label: string }[] = [
  { key: 'sku', label: '出品者SKU' },
  { key: 'needsExpiry', label: '要期限' },
  { key: 'setUnits', label: '◯点入（セット商品）' },
];

const LABEL_EXTRA_KEYS = new Set<string>(LABEL_EXTRA_OPTIONS.map((o) => o.key));

export function isLabelExtraKey(value: unknown): value is LabelExtraKey {
  return typeof value === 'string' && LABEL_EXTRA_KEYS.has(value);
}

export function labelExtraName(key: LabelExtraKey): string {
  return LABEL_EXTRA_OPTIONS.find((o) => o.key === key)?.label.replace('（セット商品）', '') ?? key;
}

export interface ExtraSource {
  sellerSku?: string | null;
  /** 期限管理の商品か。古いデータ（不明）は null/undefined。 */
  expiryManaged?: boolean | null;
  /** 1 セットの点数。単品・不明は null/undefined。 */
  unitsPerSet?: number | null;
}

/** 追加項目 1 つの印字文字。出せない（データが無い・対象外）ときは null（何も出さない）。 */
export function extraText(key: LabelExtraKey, src: ExtraSource): string | null {
  if (key === 'sku') {
    const sku = String(src.sellerSku ?? '').trim();
    return sku || null;
  }
  if (key === 'needsExpiry') return src.expiryManaged === true ? '要期限' : null;
  const n = src.unitsPerSet;
  return typeof n === 'number' && Number.isInteger(n) && n > 1 ? `${n}点入` : null;
}

/** 選んだ追加項目のうち、この品目で出せるものの文字（選んだ順）。 */
export function extraTexts(src: ExtraSource, extras: readonly LabelExtraKey[]): string[] {
  return extras.map((k) => extraText(k, src)).filter((t): t is string => t !== null);
}
