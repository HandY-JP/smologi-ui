// 商品ラベル印刷 PDF の組み立て（品目 → 1 本の PDF）。対象（出荷の添付・納品プランの書類）を順に並べる。
// 「どの対象を印刷してよいか」「生成できない対象を断る文言」はアプリごとに違うので、アプリ側で決めてから品目だけ渡す。
// 開始位置は最初の 1 枚にだけ効き、複数の対象は続けて詰める。
import { LabelPrintError } from '../errors';
import type { LabelItem } from '../label-doc';
import { layoutLabels, sheetOrDefault, type LabelOrder, type Placement } from '../sheets';
import type { ProductLabelPrintSettings } from '../settings';
import { formatExpiry } from '../text';
import { renderDrawnPdf, renderFacesPdf, type DrawnLabel, type DrawnPlacement } from './generate';
import { fetchLabelImage } from './image-fetch';
import type { LabelFontFiles } from './text-measure';

export const MAX_TOTAL_LABELS = 5000;
/** 見本用 PDF の上限ページ数（品目数＋期限シール）。 */
export const MAX_FACE_PAGES = 300;

/** 対象 1 つぶんの品目（自前で生成できると判定済みのものだけ渡す）。 */
export interface LabelGroup {
  items: LabelItem[];
}

export type FetchLabelImage = (url: string | null | undefined) => Promise<Buffer | null>;

export interface BuildOptions extends ProductLabelPrintSettings {
  /** 1 始まりの開始位置。 */
  start: number;
}

export interface BuildPdfInput {
  groups: LabelGroup[];
  options: BuildOptions;
  fonts: LabelFontFiles;
  /** 商品画像の取得（テストで差し替える）。 */
  fetchImage?: FetchLabelImage;
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function collectImages(groups: LabelGroup[], fetchImage: FetchLabelImage): Promise<Map<string, Buffer | null>> {
  const images = new Map<string, Buffer | null>();
  const urls = Array.from(new Set(groups.flatMap((g) => g.items.map((i) => i.imageUrl).filter((u): u is string => Boolean(u)))));
  const fetched = await mapLimit(urls, 4, (url) => fetchImage(url));
  urls.forEach((url, i) => images.set(url, fetched[i]));
  return images;
}

export interface BuildFacesInput {
  groups: LabelGroup[];
  options: Pick<ProductLabelPrintSettings, 'sheet' | 'image' | 'extra' | 'expirySticker'>;
  fonts: LabelFontFiles;
  fetchImage?: FetchLabelImage;
}

/**
 * 画面の見本用: 品目ごとに 1 ページ（ラベル 1 枚の寸法）。品目の順に、商品ラベル→（期限シールを出す設定で期限があれば）期限シール。
 * ページの並びは dialog-model.faceSlots と同じ（クライアントはこれでページを品目に対応づける）。
 */
export async function buildFacesPdf(input: BuildFacesInput): Promise<Uint8Array> {
  const { groups, options } = input;
  const dest = sheetOrDefault(options.sheet);
  const fetchImage = input.fetchImage ?? fetchLabelImage;
  const images = options.image ? await collectImages(groups, fetchImage) : new Map<string, Buffer | null>();
  const labels: DrawnLabel[] = [];
  for (const g of groups) {
    for (const item of g.items) {
      labels.push({ kind: 'product', item, image: item.imageUrl ? images.get(item.imageUrl) ?? null : null });
      if (options.expirySticker && formatExpiry(item.expiration)) labels.push({ kind: 'expiry', item, image: null });
    }
  }
  if (labels.length === 0) throw new LabelPrintError('見本にできるラベルがありません。');
  if (labels.length > MAX_FACE_PAGES) throw new LabelPrintError(`見本にできるラベルは${MAX_FACE_PAGES}枚までです。`);
  return renderFacesPdf(labels, { sheet: dest, image: options.image, extra: options.extra }, input.fonts);
}

/** 印刷用 PDF。各品目は数量ぶんの商品ラベルのあとに、期限シール（設定オンで期限あり）を同じ数だけ続ける。 */
export async function buildProductLabelPdf(input: BuildPdfInput): Promise<Uint8Array> {
  const { groups, options } = input;
  const dest = sheetOrDefault(options.sheet);
  const fetchImage = input.fetchImage ?? fetchLabelImage;
  // 商品画像（画像オンのときだけ）を先に集めて取る。
  const images = options.image ? await collectImages(groups, fetchImage) : new Map<string, Buffer | null>();

  const labels: DrawnLabel[] = [];
  for (const g of groups) {
    for (const item of g.items) {
      const image = item.imageUrl ? images.get(item.imageUrl) ?? null : null;
      for (let n = 0; n < item.quantity; n += 1) labels.push({ kind: 'product', item, image });
      if (options.expirySticker && formatExpiry(item.expiration)) {
        for (let n = 0; n < item.quantity; n += 1) labels.push({ kind: 'expiry', item, image: null });
      }
    }
  }

  if (labels.length === 0) throw new LabelPrintError('印刷するラベルがありません。');
  if (labels.length > MAX_TOTAL_LABELS) {
    throw new LabelPrintError(`一度に印刷できるラベルは${MAX_TOTAL_LABELS}枚までです（対象は${labels.length}枚）。`);
  }

  const placements: Placement[] = layoutLabels(dest, options.order as LabelOrder, options.start, labels.length);
  const pageCount = placements.reduce((m, p) => Math.max(m, p.page + 1), 0);
  const drawn: DrawnPlacement[] = labels.map((label, i) => ({ ...placements[i], label }));
  return renderDrawnPdf(
    drawn,
    pageCount,
    { sheet: dest, image: options.image, extra: options.extra, offsetXmm: options.offsetXmm, offsetYmm: options.offsetYmm },
    input.fonts,
  );
}
