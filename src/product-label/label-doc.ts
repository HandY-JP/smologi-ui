// 商品ラベルの元データ（Seller の納品プランの product_label 書類の metadata）の読み取りと、「作り直せるか」の判定。
// 納品プランの書類 amazon_inbound_plan_documents の type='product_label' の metadata に、
// 印刷設定ごとのラベル生成に必要な項目が入る。Smologi（共有 DB 越しに読む）と Seller（自分の DB）が同じ規則で読む。
// DB から書類を取り出す部分はアプリごとに違うので、ここには持たない。
import { isCode128BEncodable } from './code128';
import { buildNameCharEm } from './dialog-model';
import { resolveSourceSheetId } from './sheets';
import { conditionDisplayName, extraText } from './text';

export interface LabelItem {
  sellerSku: string;
  asin: string;
  fnSku: string;
  productName: string;
  quantity: number;
  /** 例: 'new_new' / 'used_like_new'。古いデータには無い。 */
  condition: string | null;
  /** 画面・ラベルに出すコンディション表記（例: 新品 / 中古 - ほぼ新品）。古いデータには無い。 */
  conditionLabel: string | null;
  imageUrl: string | null;
  /** 'YYYY-MM-DD'。期限管理でない商品・未入力は null。 */
  expiration: string | null;
  /** 1 セットの点数（セット商品）。単品・古いデータは null。 */
  unitsPerSet: number | null;
  /** 期限管理の商品か。古いデータ（不明）は null。 */
  expiryManaged: boolean | null;
  /** 梱包要件（Seller が納品プラン作成時に取得。表示用の文字）。古いデータは空。 */
  prepInstructions: string[];
}

export interface SellerLabelDoc {
  items: LabelItem[];
  /** FNSKU が空・数量 0 以下で読み飛ばした品目があった（＝items の合計は元 PDF の枚数と一致しない）。 */
  hasDroppedItems?: boolean;
  /** Seller が届けた元 PDF の用紙（sheets.ts の ID）。metadata に pageType があり、既知の用紙のときだけ。無ければ推測せず null。 */
  sourceSheet?: string | null;
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function positiveIntOrNull(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number.NaN;
  return Number.isInteger(n) && n > 0 ? n : null;
}

function strList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => str(v)).filter((v) => v !== '');
}

function strOrNull(value: unknown): string | null {
  const s = str(value);
  return s ? s : null;
}

/** metadata JSON を読み取り用の形にする。items が配列でなければ null（＝生成せず Amazon の PDF をそのまま印刷する）。 */
export function parseLabelDocMetadata(metadata: unknown): SellerLabelDoc | null {
  if (!metadata || typeof metadata !== 'object') return null;
  const meta = metadata as Record<string, unknown>;
  if (!Array.isArray(meta.items)) return null;
  const items: LabelItem[] = [];
  let hasDroppedItems = false;
  for (const raw of meta.items) {
    if (!raw || typeof raw !== 'object') continue;
    const it = raw as Record<string, unknown>;
    const quantity = Math.trunc(Number(it.quantity));
    const fnSku = str(it.fnSku);
    if (!fnSku || !Number.isFinite(quantity) || quantity <= 0) {
      // 数量が正なのに FNSKU が空の品目は、元 PDF にはラベルがある。自前生成すると枚数が欠けるので印を付ける。
      if (!fnSku && Number.isFinite(quantity) && quantity > 0) hasDroppedItems = true;
      continue;
    }
    items.push({
      sellerSku: str(it.sellerSku),
      asin: str(it.asin),
      fnSku,
      productName: str(it.productName),
      quantity,
      condition: strOrNull(it.condition),
      conditionLabel: conditionDisplayName(strOrNull(it.condition), strOrNull(it.conditionLabel)),
      imageUrl: strOrNull(it.imageUrl),
      expiration: strOrNull(it.expiration),
      unitsPerSet: positiveIntOrNull(it.unitsPerSet),
      expiryManaged: typeof it.expiryManaged === 'boolean' ? it.expiryManaged : null,
      prepInstructions: strList(it.prepInstructions),
    });
  }
  const sourceSheet = resolveSourceSheetId(meta.officialPageType) ?? resolveSourceSheetId(meta.pageType);
  return { items, ...(hasDroppedItems ? { hasDroppedItems } : {}), sourceSheet };
}

export type LabelMode = 'generate' | 'asis';

/**
 * 作り直せない（Amazon の PDF をそのまま印刷するしかない）理由。作り直せるなら null。画面の理由文にもそのまま使う。
 * 全品目にコンディション（生値）があり表示名が決まるときだけ自前生成（コンディションはラベルの必須項目で、推測で埋めない）。
 * 商品名が空の品目、FNSKU が Code128B で表せない品目、FNSKU 空で読み飛ばした品目が 1 つでもあれば、出荷まるごと作り直せない（混在させない）。
 */
export function asisReason(doc: SellerLabelDoc | null): string | null {
  if (!doc) return 'Seller のラベルのデータを読み込めないため作り直せません';
  if (doc.items.length === 0) return 'ラベルの品目のデータがないため作り直せません';
  if (doc.hasDroppedItems) return 'FNSKU が入っていない品目があるため作り直せません';
  if (doc.items.some((item) => !item.productName)) return '商品名が入っていない品目があるため作り直せません';
  if (doc.items.some((item) => !item.condition || !item.conditionLabel)) return 'コンディションが分からない品目があるため作り直せません';
  if (doc.items.some((item) => !isCode128BEncodable(item.fnSku))) return 'FNSKU をバーコードにできない品目があるため作り直せません';
  return null;
}

/** 自前生成するか、Amazon の PDF をそのまま印刷するか（asisReason が null のときだけ自前生成）。 */
export function decideLabelMode(doc: SellerLabelDoc | null): LabelMode {
  return asisReason(doc) === null ? 'generate' : 'asis';
}

export function totalLabelCount(doc: SellerLabelDoc): number {
  return doc.items.reduce((sum, item) => sum + item.quantity, 0);
}

/** preview API の品目。クライアントのシート図が印刷と同じ判定をできるよう、1pt あたりの文字幅（フォント実測）を付ける。 */
export function toPreviewItem(item: LabelItem, measureEm: (text: string) => number) {
  return {
    productName: item.productName,
    fnSku: item.fnSku,
    sellerSku: item.sellerSku,
    quantity: item.quantity,
    hasImage: Boolean(item.imageUrl),
    expiration: item.expiration,
    unitsPerSet: item.unitsPerSet,
    expiryManaged: item.expiryManaged,
    prepInstructions: item.prepInstructions,
    conditionLabel: item.conditionLabel ?? null,
    fnSkuEm: measureEm(item.fnSku),
    conditionEm: item.conditionLabel ? measureEm(item.conditionLabel) : 0,
    skuEm: item.sellerSku ? measureEm(item.sellerSku) : 0,
    // 追加項目（要期限・◯点入）の幅。クライアントの判定が印刷と一致するために、出せる文字だけ実測して渡す。
    extraEm: Object.fromEntries(
      (['needsExpiry', 'setUnits'] as const)
        .map((k) => extraText(k, item))
        .filter((t): t is string => t !== null)
        .map((t) => [t, measureEm(t)]),
    ),
    nameCharEm: buildNameCharEm(item.productName, (t) => measureEm(t)),
  };
}
