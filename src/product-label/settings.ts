// 商品ラベル印刷の設定（用紙・並び順・印字項目・微調整）の型と、読み込み時の整え方。
// 保存先（DB）はアプリごとに違うので、ここには持たない（Smologi=設定行 / Seller=アカウントの labelPreferences）。
import { sheetCapabilities } from './label-layout';
import { DEFAULT_SHEET_ID, getSheet, type LabelOrder } from './sheets';
import { isLabelExtraKey, type LabelExtraKey } from './text';

export type { LabelExtraKey };

export interface ProductLabelPrintSettings {
  sheet: string;
  order: LabelOrder;
  image: boolean;
  /** 文字行に足す追加項目（選んだ順。数は用紙ごとの上限まで）。 */
  extra: LabelExtraKey[];
  expirySticker: boolean;
  /** 印刷位置の微調整（mm、右・下が＋）。 */
  offsetXmm: number;
  offsetYmm: number;
}

export const DEFAULT_PRODUCT_LABEL_SETTINGS: ProductLabelPrintSettings = {
  sheet: DEFAULT_SHEET_ID,
  order: 'row',
  image: false,
  extra: [],
  expirySticker: false,
  offsetXmm: 0,
  offsetYmm: 0,
};

export const MAX_OFFSET_MM = 10;

function clampOffset(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  const stepped = Math.round(n * 2) / 2;
  return Math.min(MAX_OFFSET_MM, Math.max(-MAX_OFFSET_MM, stepped));
}

/** 追加項目の保存形式を読む。配列（選んだ順）。旧形式の 'sku' / 'none' も受ける。未知の値・重複は捨てる。 */
export function normalizeExtras(raw: unknown): LabelExtraKey[] {
  if (raw === 'sku') return ['sku'];
  if (!Array.isArray(raw)) return [];
  const out: LabelExtraKey[] = [];
  for (const v of raw) if (isLabelExtraKey(v) && !out.includes(v)) out.push(v);
  return out;
}

/** 用紙の上限を超える分を、後から選んだ方から外す。 */
export function trimExtras(extras: readonly LabelExtraKey[], max: number): { kept: LabelExtraKey[]; removed: LabelExtraKey[] } {
  const n = Math.max(0, max);
  return { kept: extras.slice(0, n), removed: extras.slice(n) };
}

/** 未知の値・欠けた項目は既定値に倒す（壊れた行や古い行で印刷が止まらないように）。 */
export function normalizeProductLabelSettings(input: unknown): ProductLabelPrintSettings {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const d = DEFAULT_PRODUCT_LABEL_SETTINGS;
  const sheet = typeof raw.sheet === 'string' && getSheet(raw.sheet) ? raw.sheet : d.sheet;
  // 用紙で選べない項目は外す（画像不可の用紙は画像なし、追加項目は上限まで。後から選んだ方を外す）。
  const caps = sheetCapabilities(getSheet(sheet) ?? getSheet(DEFAULT_SHEET_ID)!);
  return {
    sheet,
    order: raw.order === 'column' ? 'column' : 'row',
    image: raw.image === true && caps.image,
    extra: trimExtras(normalizeExtras(raw.extra), caps.maxExtras).kept,
    expirySticker: raw.expirySticker === true,
    offsetXmm: clampOffset(raw.offsetXmm),
    offsetYmm: clampOffset(raw.offsetYmm),
  };
}

/** 用紙だけを差し替えた設定（この出荷だけの用紙選択用。保存はしない）。用紙で選べない画像・追加項目は外す。 */
export function withSheet(settings: ProductLabelPrintSettings, sheetId: string): ProductLabelPrintSettings {
  if (!getSheet(sheetId)) return settings;
  return normalizeProductLabelSettings({ ...settings, sheet: sheetId });
}
