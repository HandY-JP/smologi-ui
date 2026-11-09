// 自前生成ラベル 1 枚の中の寸法計算（pt）。描画（generate.tsx）とテストで共有する純粋関数。
import { code128Bars } from './code128';
import { getSheet } from './sheets';
import { truncateEndToWidth } from './text';

export const MM = 72 / 25.4;
/** FNSKU とコンディションの間の隙間（コンディションの文字サイズに対する割合。約 0.3 文字）。 */
export const CONDITION_GAP_EM = 0.3;
/**
 * 文字サイズ（pt）は Amazon 純正 40 面ラベルの高さ 84.17pt を基準に決め、他の用紙はラベル高さに比例させる。
 * 40 面で FNSKU 9pt（通常）／コンディション 9pt（通常）／商品名 9pt／出品者 SKU 9pt（DEFAULT_LAYOUT_TUNING）。
 */
export const REF_LABEL_HEIGHT_PT = 84.17;
const LINE_RATIO = 1.2;
/** 1 モジュールの最小幅（0.25mm）。これを下回るとスキャナで読みにくい。 */
export const MIN_MODULE_PT = 0.25 * MM;
/** 1/300 インチ（pt）。A4 シートのバーコードのモジュール幅はこの整数倍にする（300dpi・600dpi のプリンターで 1 モジュールがドットの整数個になり、にじみで細り太りしても分解可能性が落ちない）。 */
export const DOT_300_PT = 72 / 300;
/**
 * 1/600 インチ（pt）。A4 シートのバーコードの左端の x 座標（用紙原点基準）は、300dpi の格子（= 600dpi の格子の偶数番）にそろえる。
 * 1/600 の格子だと半分は 300dpi のドットの境目（半ドット）に乗り、300dpi の分解可能性が 0.5 に落ちるため（実測）。
 */
export const DOT_600_PT = 72 / 600;
/** 四隅の余白（mm）。 */
export const CORNER_PAD_MM = 2;

/**
 * レイアウトの数値（比率・文字サイズ）。既定値は 40 面（Amazon 純正 148.82×84.17pt）の値を比率にしたもの。
 * 用紙ごとに変えたいときは SHEET_LAYOUT_OVERRIDES に「用紙 ID → 変えたい項目だけ」を足す（ここ 1 か所。今は空）。
 */
export interface LayoutTuning {
  /** バー部分の幅（ラベル幅に対する割合）。 */
  barcodeWidthRatio: number;
  /** 何も描かない左右余白の最小値（ラベル幅に対する割合）。 */
  barcodeMinSideRatio: number;
  /** バーの高さ（ラベル高さに対する割合）。 */
  barcodeHeightRatio: number;
  /** 文字領域の左右の余白（ラベル幅に対する割合）。 */
  textSideMarginRatio: number;
  /** 文字サイズ（pt）。REF_LABEL_HEIGHT_PT の高さのときの値で、実際はラベル高さに比例する。 */
  fnSkuSizePt: number;
  conditionSizePt: number;
  nameSizePt: number;
  /** 追加項目（出品者SKU・要期限・◯点入）の文字サイズ。 */
  extraSizePt: number;
  /** 文字の拡縮の基準にするラベル高さ（pt）。null ならそのラベルの高さ（用紙に比例）。値があれば用紙によらず 40 面と同じ pt になる。 */
  fontHeightRefPt: number | null;
  /** 文字サイズの上限・下限（pt）。null は制限なし。 */
  fontPtMax: number | null;
  fontPtMin: number | null;
  /** バーコードの高さの上限（mm）。null は制限なし（高さの割合どおり）。 */
  barcodeMaxHeightMm: number | null;
  /** 商品名の最大行数。 */
  maxNameLines: number;
  /** 商品画像を置けるか。false の用紙は画像オンでも画像なしで描く。 */
  imageAllowed: boolean;
  /** 追加項目の最大数（用紙の高さで更に絞られる。0 は不可）。 */
  maxExtras: number;
  /** 期限シール（横並び: 左に「期限」、右に年・月日の 2 段）の、ラベルの上下・左右に最低限空ける余白（ラベル高さ・幅に対する割合）。 */
  expiryMinVMarginRatio: number;
  expiryMinHMarginRatio: number;
  /** 見出し「期限」の文字サイズ ÷ 年・月日のサイズ。 */
  expiryHeadingRatio: number;
  /** 見出しと日付の間（見出しの文字サイズに対する倍率）。 */
  expiryGapEm: number;
  /** 見た目を上下中央にするための上への補正（ラベル高さに対する割合）。 */
  expiryOpticalShiftRatio: number;
}

export const DEFAULT_LAYOUT_TUNING: LayoutTuning = {
  barcodeWidthRatio: 0.788,
  barcodeMinSideRatio: 0.078,
  barcodeHeightRatio: 0.356,
  textSideMarginRatio: 0.06,
  fnSkuSizePt: 9,
  conditionSizePt: 9,
  nameSizePt: 9,
  extraSizePt: 9,
  fontHeightRefPt: null,
  fontPtMax: null,
  fontPtMin: null,
  barcodeMaxHeightMm: null,
  maxNameLines: 2,
  imageAllowed: true,
  maxExtras: 2,
  expiryMinVMarginRatio: 0.15,
  expiryMinHMarginRatio: 0.1,
  expiryHeadingRatio: 0.7,
  expiryGapEm: 0.6,
  expiryOpticalShiftRatio: 0.043,
};

/** 40 面（A4_40_52x29）のラベル高さ（pt）。「40 面と同じ pt」の基準。 */
export const H40_PT = 29.46 * MM;
/** Amazon 純正 40 面のバーコードの高さ（mm）。大きい用紙でもこれを超えない。 */
export const BARCODE_MAX_HEIGHT_MM = 10.6;

/** グループ①: 40 面並み。文字は用紙によらず 40 面と同じ pt。 */
const SAME_AS_40: Partial<LayoutTuning> = { fontHeightRefPt: H40_PT };
/** グループ②: 大きい用紙。文字は 10pt 上限、バーコードは 40 面と同じ高さ上限。増えた高さは追加項目・商品名 2 行・画像に回る。 */
const LARGE: Partial<LayoutTuning> = { fontPtMax: 10, barcodeMaxHeightMm: BARCODE_MAX_HEIGHT_MM };
/** グループ③: 小さい用紙。文字は 8pt 下限、商品名 1 行、画像と追加項目は不可。 */
const SMALL: Partial<LayoutTuning> = { fontPtMin: 8, maxNameLines: 1, imageAllowed: false, maxExtras: 0 };

/**
 * 用紙（SheetDef.id）ごとの上書き。変えたい項目だけ書く。40 面（A4_40_52x29）が基準で、ここに無い用紙は既定値。
 * ①40 面並み: ロール 50×30・62×29 ／ ②大きい: 21 面・24 面 ／ ③小さい: 44 面・ロール 50.8×25.4。
 */
export const SHEET_LAYOUT_OVERRIDES: Record<string, Partial<LayoutTuning>> = {
  'ROLL_50x30': SAME_AS_40,
  'ROLL_62x29': SAME_AS_40,
  A4_21: LARGE,
  A4_24: LARGE,
  A4_44_48x25: SMALL,
  'ROLL_50.8x25.4': SMALL,
};

/** 基準の文字サイズ（40 面の値）を、この用紙のラベル高さ（pt）に合わせた pt にする（比例 → 上限・下限）。 */
export function scaledPt(basePt: number, heightPt: number, t: LayoutTuning): number {
  let pt = basePt * ((t.fontHeightRefPt ?? heightPt) / REF_LABEL_HEIGHT_PT);
  if (t.fontPtMax !== null) pt = Math.min(pt, t.fontPtMax);
  if (t.fontPtMin !== null) pt = Math.max(pt, t.fontPtMin);
  return pt;
}

export function layoutTuningFor(sheetId?: string | null): LayoutTuning {
  const override = sheetId ? SHEET_LAYOUT_OVERRIDES[sheetId] : undefined;
  return override ? { ...DEFAULT_LAYOUT_TUNING, ...override } : DEFAULT_LAYOUT_TUNING;
}

export interface LabelBoxInput {
  /** ラベルの大きさ（mm）。 */
  widthMm: number;
  heightMm: number;
  fnSku: string;
  /** 画像を出すか（画像が取れなかったときは false にして呼ぶ）。用紙が画像不可なら無視する。 */
  withImage: boolean;
  /**
   * コンディション表示。あれば「FNSKU（通常）＋最小の隙間（約0.3文字）＋コンディション（通常）」が、それぞれの文字サイズで行幅に（縮めずに）収まるか（隙間は CONDITION_GAP_EM）を実測し、
   * 収まれば FNSKU と同じ行（FNSKU は左詰め・コンディションは右端に右詰め）、収まらないときだけ次の行に独立させる。null は表示なし。
   */
  condition: string | null;
  /** 文字幅の実測（描画に使うフォント）。 */
  measure: (text: string, fontSize: number, bold: boolean) => number;
  /** 追加項目の文字（選んだ順。この品目で出せるものだけ。出せない項目は含めない）。用紙が追加項目不可・上限超えなら入る分だけ使う。 */
  extras?: readonly string[];
  /** 用紙 ID。SHEET_LAYOUT_OVERRIDES の上書きを引く（無ければ既定値）。A4 シート（kind が sheet）ならバーコードを 300/600dpi の格子にそろえる。 */
  sheetId?: string | null;
  /** ラベルの左端の用紙上の x（mm。微調整オフセット込み）。バーコードの左端を 1/600 インチの格子にそろえるのに使う。無ければ 0。 */
  originXmm?: number;
}

export interface PlacedExtra {
  text: string;
  /** row=自分の行、withCondition=別行のコンディションの行の右端に右詰め。 */
  placement: 'row' | 'withCondition';
}

export interface LabelBox {
  pad: number;
  width: number;
  height: number;
  /** バー部分の領域（左右の余白は含まない。offsetModules は常に 0）。 */
  barcode: { x: number; y: number; w: number; h: number; moduleW: number; offsetModules: number };
  /** 2〜3 段目の領域。 */
  body: { x: number; y: number; w: number; h: number };
  /** 正方形の画像（2 段分）。出さないときは null。 */
  image: { x: number; y: number; size: number } | null;
  text: { x: number; y: number; w: number; h: number };
  /** FNSKU の文字サイズ（通常ウェイト）。 */
  fontSize: number;
  lineHeight: number;
  /** コンディションの文字サイズ（通常ウェイト）。 */
  conditionFontSize: number;
  /** 商品名の文字サイズ。 */
  nameFontSize: number;
  /** 追加項目の文字サイズ。 */
  extraFontSize: number;
  /** 商品名に使える行数。 */
  nameLines: number;
  /** コンディションを FNSKU とは別の行にしたか。 */
  conditionOwnLine: boolean;
  /** 実際に置く追加項目（選んだ順）。 */
  extras: PlacedExtra[];
  /** 出したいのに、高さが足りず省略した追加項目の数（必須の項目は削らない・文字は縮めない）。 */
  extrasOmitted: number;
}

/** バーコード・本文の領域（文字や画像の有無によらない部分）。 */
function baseGeometry(widthMm: number, heightMm: number, t: LayoutTuning) {
  const width = widthMm * MM;
  const height = heightMm * MM;
  const pad = Math.min(CORNER_PAD_MM * MM, Math.min(width, height) * 0.1);
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const barH = Math.min(height * t.barcodeHeightRatio, t.barcodeMaxHeightMm !== null ? t.barcodeMaxHeightMm * MM : Infinity);
  const barTop = pad;
  const gap = Math.max(1.5, innerH * 0.04);
  const bodyY = barTop + barH + gap;
  const sideMargin = Math.max(pad, width * t.textSideMarginRatio);
  const body = { x: sideMargin, y: bodyY, w: width - sideMargin * 2, h: height - pad - bodyY };
  return { width, height, pad, innerW, barH, barTop, body };
}

export interface SheetCapabilities {
  /** 商品画像を置けるか。 */
  image: boolean;
  /** 選べる追加項目の数（0 は不可）。本文の高さに「FNSKU の行＋商品名 1 行＋追加項目の行」が収まる数（最大 2）。 */
  maxExtras: number;
}

const capabilityCache = new Map<string, SheetCapabilities>();

/** 用紙で選べる商品画像・追加項目の数。本文の高さで決める（コンディションが同じ行に収まる最良の場合）。 */
export function sheetCapabilities(sheet: { id: string; labelW: number; labelH: number }): SheetCapabilities {
  const key = `${sheet.id}|${sheet.labelW}|${sheet.labelH}`;
  const hit = capabilityCache.get(key);
  if (hit) return hit;
  const t = layoutTuningFor(sheet.id);
  const g = baseGeometry(sheet.labelW, sheet.labelH, t);
  const lh = (base: number) => scaledPt(base, g.height, t) * LINE_RATIO;
  const free = g.body.h - lh(t.fnSkuSizePt) - lh(t.nameSizePt);
  const fit = Math.floor(free / lh(t.extraSizePt) + 1e-6);
  const out = { image: t.imageAllowed, maxExtras: Math.max(0, Math.min(2, t.maxExtras, fit)) };
  capabilityCache.set(key, out);
  return out;
}

/** ラベルの中の配置を決める。用紙が大きいほど文字も画像も大きくなる（用紙のグループごとの上限・下限あり）。 */
export function computeLabelBox(input: LabelBoxInput): LabelBox {
  const t = layoutTuningFor(input.sheetId);
  const g = baseGeometry(input.widthMm, input.heightMm, t);
  const { width, height, pad, innerW, barH, barTop, body } = g;

  // 1 段目: バーコードは Amazon 純正の比率（既定は幅 78.8%・高さ 35.6%、上は四隅の余白と同じ）で左右中央。他の行の有無では変えない。
  const { totalModules } = code128Bars(input.fnSku);
  let barW = width * t.barcodeWidthRatio;
  let barX = Math.max(width * t.barcodeMinSideRatio, (width - barW) / 2);
  // A4 シート（レーザー／インクジェット 300・600dpi）: モジュール幅を許される幅に収まる最大の「1/300 インチの整数倍（3 以上）」にし、
  // ラベル内で左右中央、左端の用紙上の x を 1/300 インチの格子（1/600 の格子にも乗る）にそろえる。ロール紙（感熱 203dpi）は従来どおり。
  if (input.sheetId && getSheet(input.sheetId)?.kind === 'sheet') {
    const n = Math.floor(barW / totalModules / DOT_300_PT + 1e-9);
    if (n >= 3) {
      barW = n * DOT_300_PT * totalModules;
      const originPt = (input.originXmm ?? 0) * MM;
      const centered = (width - barW) / 2;
      barX = Math.round((originPt + centered) / DOT_300_PT) * DOT_300_PT - originPt;
    }
  }
  const barcode = { x: barX, y: barTop, w: barW, h: barH, moduleW: barW / totalModules, offsetModules: 0 };

  // 2〜3 段目
  const withImage = input.withImage && t.imageAllowed;
  const imageSize = withImage ? Math.min(body.h, innerW * 0.4) : 0;
  const image = withImage ? { x: body.x, y: body.y, size: imageSize } : null;
  const textGap = withImage ? Math.max(2, pad * 0.8) : 0;
  const text = {
    x: body.x + imageSize + textGap,
    y: body.y,
    w: body.w - imageSize - textGap,
    h: body.h,
  };

  // 文字: 用紙の高さに比例した固定サイズ（グループごとの上限・下限あり。縮小・省略はしない）。
  const fontSize = scaledPt(t.fnSkuSizePt, height, t);
  const conditionFontSize = scaledPt(t.conditionSizePt, height, t);
  const nameFontSize = scaledPt(t.nameSizePt, height, t);
  const extraFontSize = scaledPt(t.extraSizePt, height, t);
  const lh = (size: number) => size * LINE_RATIO;

  // コンディションは自動判定: それぞれの文字サイズで FNSKU の右に隙間つきで収まるなら同じ行。収まらなければ次の行。
  let conditionOwnLine = false;
  if (input.condition) {
    const joinedW = input.measure(input.fnSku, fontSize, false) + conditionFontSize * CONDITION_GAP_EM + input.measure(input.condition, conditionFontSize, false);
    conditionOwnLine = joinedW > text.w;
  }

  // 追加項目: 用紙の上限まで。先頭の 1 つは、コンディションが別行でその行の右端に入るなら行を増やさず同居させる。
  // 長い項目（出品者SKU など）は行幅に入る分で末尾を「…」にする。
  const wanted = (input.extras ?? []).slice(0, t.maxExtras > 0 ? 2 : 0).map((x) => truncateEndToWidth(x, text.w, (s) => input.measure(s, extraFontSize, false)));
  const ride =
    conditionOwnLine && wanted.length > 0
      ? input.measure(input.condition ?? '', conditionFontSize, false) + Math.min(conditionFontSize, extraFontSize) * CONDITION_GAP_EM + input.measure(wanted[0], extraFontSize, false) <= text.w
      : false;
  const baseH = lh(fontSize) + (conditionOwnLine ? lh(conditionFontSize) : 0);
  const usedH = (placed: number, nameLines: number) => {
    const rideUp = ride && placed >= 1 ? lh(Math.max(conditionFontSize, extraFontSize)) - lh(conditionFontSize) : 0;
    const rows = placed - (ride && placed >= 1 ? 1 : 0);
    return baseH + rideUp + lh(nameFontSize) * nameLines + lh(extraFontSize) * rows;
  };
  // 必須の項目（FNSKU・コンディション・商品名 1 行）が先。入る数だけ追加項目を置く。
  let placed = wanted.length;
  while (placed > 0 && usedH(placed, 1) > text.h + 1e-6) placed -= 1;
  // 余った高さは商品名の 2 行目へ（用紙の上限まで）。
  let nameLines = 1;
  for (let n = Math.max(1, t.maxNameLines); n > 1; n -= 1) {
    if (usedH(placed, n) <= text.h + 1e-6) {
      nameLines = n;
      break;
    }
  }
  const extras: PlacedExtra[] = wanted.slice(0, placed).map((txt, i) => ({ text: txt, placement: ride && i === 0 ? 'withCondition' : 'row' }));
  return {
    pad, width, height, barcode, body, image, text,
    fontSize, lineHeight: fontSize * LINE_RATIO, conditionFontSize, nameFontSize, extraFontSize, nameLines, conditionOwnLine,
    extras, extrasOmitted: Math.max(0, (input.extras ?? []).length - placed),
  };
}

const ALNUM = /[0-9A-Za-z.]/;
const SEPARATOR = /[\s\u3000\-/・、。,，（）()［］\[\]【】「」『』〈〉|｜_:：;；]/;

/** 位置 i（chars[i-1] と chars[i] の間）で切ってよいか。英数字の連続の途中は不可。 */
function canCutAt(chars: string[], i: number): boolean {
  if (i <= 0 || i >= chars.length) return true;
  return !(ALNUM.test(chars[i - 1]) && ALNUM.test(chars[i]));
}

/** 区切り（空白・記号）の直後・直前の位置か。 */
function isNiceCut(chars: string[], i: number): boolean {
  if (i <= 0 || i >= chars.length) return true;
  return SEPARATOR.test(chars[i - 1]) || SEPARATOR.test(chars[i]);
}

/**
 * 先頭から幅 width に収まる最長の切り位置（文字数）を返す。区切りで切れて幅の 5 割以上使えるならそれを優先し、
 * 無ければ英数字の途中を避けた最長、それも無ければ文字単位。
 */
function headCut(chars: string[], width: number, measure: (t: string) => number): number {
  let fit = 0;
  while (fit < chars.length && measure(chars.slice(0, fit + 1).join('')) <= width + 1e-6) fit++;
  if (fit >= chars.length) return chars.length;
  let nice = -1;
  let ok = -1;
  for (let i = fit; i >= 1; i--) {
    if (ok < 0 && canCutAt(chars, i)) ok = i;
    if (isNiceCut(chars, i) && canCutAt(chars, i)) {
      nice = i;
      break;
    }
  }
  if (nice > 0 && measure(chars.slice(0, nice).join('').trimEnd()) >= width * 0.5) return nice;
  return ok > 0 ? ok : Math.max(1, fit);
}

/** 末尾から幅 width に収まる最長の開始位置（文字数）。headCut と同じ方針で、区切りの直後から始める。 */
function tailCut(chars: string[], width: number, measure: (t: string) => number): number {
  const n = chars.length;
  let fit = n; // 末尾 (n - fit) 文字
  while (fit > 0 && measure(chars.slice(fit - 1).join('')) <= width + 1e-6) fit--;
  if (fit <= 0) return 0;
  let nice = -1;
  let ok = -1;
  for (let i = fit; i < n; i++) {
    if (ok < 0 && canCutAt(chars, i)) ok = i;
    if (SEPARATOR.test(chars[i - 1]) && canCutAt(chars, i)) {
      nice = i;
      break;
    }
  }
  if (nice >= 0 && measure(chars.slice(nice).join('').trimStart()) >= width * 0.5) return nice;
  return ok >= 0 ? ok : Math.min(n - 1, fit);
}

/** 省略なしで幅に合わせて折り返す（文字単位。ハイフンは足さない）。英数字の連なりは次の行へ丸ごと回し、1 語が 1 行に収まらないときだけ文字で分ける。 */
function wrapAll(name: string, widthPt: number, measure: (t: string) => number): string[] {
  const tokens = name.match(/[\x21-\x7e\u00a0-\u00ff]+|\s+|[^\s]/gu) ?? [];
  const lines: string[] = [];
  let cur = '';
  const push = () => {
    lines.push(cur.trimEnd());
    cur = '';
  };
  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      if (cur) cur += ' ';
      continue;
    }
    if (measure(cur + token) <= widthPt + 1e-6) {
      cur += token;
      continue;
    }
    if (cur) push();
    for (const ch of Array.from(token)) {
      if (cur && measure(cur + ch) > widthPt + 1e-6) push();
      cur += ch;
    }
  }
  if (cur) push();
  return lines.filter((l) => l !== '');
}

/**
 * 商品名を表示する行に分ける（描画・プレビュー共通）。measure は商品名の文字サイズでの文字列の幅（pt）。
 * - 入りきるときは折り返して lines 行まで（普通の 2 行）。
 * - 入りきらない 2 行: 1 行目＝先頭（行幅いっぱい）、2 行目＝「…」＋末尾（行幅いっぱい）。
 * - 入りきらない 1 行: 「先頭…末尾」を 1 行に。
 * どちらも区切り（空白・記号）優先で、英数字の連続の途中では切らない（区切りが無ければ文字単位）。
 */
export function nameRows(name: string, widthPt: number, measure: (text: string) => number, lines: number): string[] {
  const text = name.trim();
  if (!text) return [];
  const all = wrapAll(text, widthPt, measure);
  if (all.length <= Math.max(1, lines)) return all;
  const chars = Array.from(text);
  const ellW = measure('…');
  if (lines <= 1) {
    const avail = widthPt - ellW;
    const tailStart = tailCut(chars, avail * 0.35, measure);
    const tail = chars.slice(tailStart).join('').trimStart();
    const headChars = chars.slice(0, tailStart);
    const headEnd = headCut(headChars, avail - measure(tail), measure);
    return [`${headChars.slice(0, headEnd).join('').trimEnd()}…${tail}`];
  }
  const headEnd = headCut(chars, widthPt, measure);
  const head = chars.slice(0, headEnd).join('').trimEnd();
  const rest = chars.slice(headEnd);
  const tailStart = tailCut(rest, widthPt - ellW, measure);
  return [head, `…${rest.slice(tailStart).join('').trimStart()}`];
}

export interface ExpiryBox {
  /** 「期」「限」の文字サイズ（縦書き。1 字ずつ縦に並べる）。 */
  headingSize: number;
  /** 見出し 1 字ぶんの行の高さ（2 字を縦に並べる）。 */
  headingLineH: number;
  /** 年・月日の文字サイズ（2 段とも同じ）。 */
  bigSize: number;
  /** 見出しの幅（全角 1 字）。 */
  headingW: number;
  /** 見出しと日付の間。 */
  gap: number;
  /** 日付の列の幅（最も長い「12月31日」の太字の幅。2 段ともこの幅の中で中央に置く）。 */
  columnW: number;
  /** 見出し＋日付のまとまり全体の幅・高さ（左右はラベルの中央）。 */
  blockW: number;
  blockH: number;
  /** まとまりの上下の中心（ラベル上端からの pt）。下端の FNSKU の上の領域の中央（見た目の補正込み）。 */
  centerY: number;
  /** 下端の FNSKU（通常ウェイト・中央寄せ。バーコードは入れない）。y は行の上端。 */
  footer: { size: number; lineH: number; y: number };
}

export const EXPIRY_LINE = 1.15;
/** 日付の列の幅（em）。日付で最も長い「12月31日」（数字 4 字＋漢字 2 字）の太字の実測幅 4.36em（NotoSansJP Bold、数字は 0.59em 等幅）に、折り返し防止のゆとり（約 1%）を足した値。 */
const EXPIRY_WIDEST_LINE_EM = 4.4;
/** 縦書き見出し 1 字の行の高さ（文字サイズに対する倍率）。 */
const HEADING_LINE = 1.1;

/**
 * 期限シールの文字サイズ。左に縦書きの「期限」（日付の約 70%・日付 2 段の高さの中央）、右に年・月日の 2 段（同じ大きさ）、下端に小さく FNSKU。
 * 見出し＋日付のまとまりは「上の余白 ≥ 高さの 15%」「左右の余白 ≥ 幅の 10%」を保ち、FNSKU の行の上に収まる範囲で最大にし、その領域の中央に置く。
 */
export function computeExpiryBox(widthMm: number, heightMm: number, sheetId?: string | null): ExpiryBox {
  const t = layoutTuningFor(sheetId);
  const width = widthMm * MM;
  const height = heightMm * MM;
  const pad = Math.min(CORNER_PAD_MM * MM, Math.min(width, height) * 0.1);
  const footerSize = scaledPt(t.fnSkuSizePt, height, t);
  const footerLineH = footerSize * LINE_RATIO;
  const footerY = height - pad - footerLineH;
  const areaTop = height * t.expiryMinVMarginRatio;
  const areaBottom = footerY - footerSize * 0.3;
  const headingEm = t.expiryHeadingRatio;
  const gapEm = t.expiryGapEm * t.expiryHeadingRatio;
  const blockEm = headingEm + gapEm + EXPIRY_WIDEST_LINE_EM;
  const bigByHeight = (areaBottom - areaTop) / (2 * EXPIRY_LINE);
  const bigByWidth = (width * (1 - 2 * t.expiryMinHMarginRatio)) / blockEm;
  const bigSize = Math.max(5, Math.min(bigByHeight, bigByWidth));
  return {
    headingSize: bigSize * t.expiryHeadingRatio,
    headingLineH: bigSize * t.expiryHeadingRatio * HEADING_LINE,
    bigSize,
    headingW: bigSize * headingEm,
    gap: bigSize * gapEm,
    columnW: bigSize * EXPIRY_WIDEST_LINE_EM,
    blockW: bigSize * blockEm,
    blockH: bigSize * 2 * EXPIRY_LINE,
    centerY: Math.max(areaTop + bigSize * EXPIRY_LINE, (areaTop + areaBottom) / 2 - height * t.expiryOpticalShiftRatio),
    footer: { size: footerSize, lineH: footerLineH, y: footerY },
  };
}
