// 自前生成ラベルの描画（@react-pdf/renderer）。用紙のページ構成の中に、指定セルへラベルを描く。
// 配置・文字サイズの計算は label-layout.ts。デザインは暫定（見本に沿う）で、チューニングは label-layout.ts を触る。
import { Document, Font, Image, Page, Rect, Svg, Text, View, renderToBuffer } from '@react-pdf/renderer';
import { code128Bars } from '../code128';
import type { LabelItem } from '../label-doc';
import { computeExpiryBox, EXPIRY_LINE, computeLabelBox, nameRows, MM } from '../label-layout';
import { cellRect, type SheetDef } from '../sheets';
import { applyLabelPrintPreferences } from './print-prefs';
import { extraTexts, formatExpiry, type LabelExtraKey } from '../text';
import { createTextMeasurer, type LabelFontFiles, type TextMeasurer } from './text-measure';

// フォントの登録はフォントファイルの組ごとに 1 回（react-pdf の登録は全体で共有される）。
let registeredFonts = '';
function registerFonts(fonts: LabelFontFiles): void {
  const key = `${fonts.regular}\n${fonts.bold}`;
  if (registeredFonts === key) return;
  Font.register({
    family: 'NotoSansJP',
    fonts: [
      { src: fonts.regular, fontWeight: 'normal' },
      { src: fonts.bold, fontWeight: 'bold' },
    ],
  });
  registeredFonts = key;
}
// 折り返しは nameRows で自前で行う（react-pdf の折り返しは行末に「-」を足すため使わない）。
Font.registerHyphenationCallback((word) => [word]);

export interface DrawnLabel {
  kind: 'product' | 'expiry';
  item: LabelItem;
  /** 取得できた商品画像（JPEG）。無ければ画像なしで描く。 */
  image: Buffer | null;
}

export interface DrawnPlacement {
  page: number;
  row: number;
  col: number;
  label: DrawnLabel;
}

export interface DrawOptions {
  sheet: SheetDef;
  /** 商品画像を出すか。 */
  image: boolean;
  /** 足す追加項目（選んだ順）。 */
  extra: LabelExtraKey[];
  offsetXmm: number;
  offsetYmm: number;
  /** 文字幅の実測器（createTextMeasurer）。 */
  measurer: TextMeasurer;
}

function Barcode({ text, box }: { text: string; box: ReturnType<typeof computeLabelBox>['barcode'] }) {
  const { bars } = code128Bars(text);
  return (
    <Svg width={box.w} height={box.h} style={{ position: 'absolute', left: box.x, top: box.y }}>
      {bars.map((bar, i) => (
        <Rect key={i} x={(box.offsetModules + bar.x) * box.moduleW} y={0} width={bar.width * box.moduleW} height={box.h} fill="#000000" />
      ))}
    </Svg>
  );
}

function ProductLabel({ item, image, opts, originXmm = 0 }: { item: LabelItem; image: Buffer | null; opts: DrawOptions; originXmm?: number }) {
  const withImage = opts.image && image !== null;
  const box = computeLabelBox({
    sheetId: opts.sheet.id,
    originXmm,
    widthMm: opts.sheet.labelW,
    heightMm: opts.sheet.labelH,
    fnSku: item.fnSku,
    withImage,
    condition: item.conditionLabel ?? null,
    measure: opts.measurer.measure,
    extras: extraTexts(item, opts.extra),
  });
  const fs = box.fontSize;
  const rows = nameRows(item.productName, box.text.w, (t) => opts.measurer.measure(t, box.nameFontSize, false), box.nameLines);
  const condition = item.conditionLabel ?? '';
  const own = box.conditionOwnLine;
  return (
    <View style={{ width: box.width, height: box.height, position: 'relative' }}>
      <Barcode text={item.fnSku} box={box.barcode} />
      {box.image && image ? (
        <Image src={{ data: image, format: 'jpg' }} style={{ position: 'absolute', left: box.image.x, top: box.image.y, width: box.image.size, height: box.image.size, objectFit: 'contain' }} />
      ) : null}
      <View style={{ position: 'absolute', left: box.text.x, top: box.text.y, width: box.text.w, height: box.text.h, overflow: 'hidden' }}>
        {own || !condition ? (
          <Text style={{ fontFamily: 'NotoSansJP', fontSize: fs, lineHeight: 1.2 }} wrap={false}>{item.fnSku}</Text>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'NotoSansJP', fontSize: fs, lineHeight: 1.2 }} wrap={false}>{item.fnSku}</Text>
            <Text style={{ fontFamily: 'NotoSansJP', fontSize: box.conditionFontSize, lineHeight: 1.2 }} wrap={false}>{condition}</Text>
          </View>
        )}
        {own ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'NotoSansJP', fontSize: box.conditionFontSize, lineHeight: 1.2 }} wrap={false}>{condition}</Text>
            {box.extras[0]?.placement === 'withCondition' ? (
              <Text style={{ fontFamily: 'NotoSansJP', fontSize: box.extraFontSize, lineHeight: 1.2 }} wrap={false}>{box.extras[0].text}</Text>
            ) : null}
          </View>
        ) : null}
        {rows.map((row, i) => (
          <Text key={i} style={{ fontFamily: 'NotoSansJP', fontSize: box.nameFontSize, lineHeight: 1.2 }} wrap={false}>{row}</Text>
        ))}
        {box.extras.filter((e) => e.placement === 'row').map((e, i) => (
          <Text key={`x${i}`} style={{ fontFamily: 'NotoSansJP', fontSize: box.extraFontSize, lineHeight: 1.2 }} wrap={false}>{e.text}</Text>
        ))}
      </View>
    </View>
  );
}

function ExpiryLabel({ item, opts }: { item: LabelItem; opts: DrawOptions }) {
  const parts = formatExpiry(item.expiration);
  const box = computeExpiryBox(opts.sheet.labelW, opts.sheet.labelH, opts.sheet.id);
  const w = opts.sheet.labelW * MM;
  const h = opts.sheet.labelH * MM;
  const big = { fontFamily: 'NotoSansJP', fontSize: box.bigSize, lineHeight: EXPIRY_LINE, fontWeight: 'bold' as const };
  const head = { fontFamily: 'NotoSansJP', fontSize: box.headingSize, lineHeight: 1, height: box.headingLineH, textAlign: 'center' as const };
  const left = (w - box.blockW) / 2;
  return (
    <View style={{ width: w, height: h, position: 'relative' }}>
      <View style={{ position: 'absolute', left, top: box.centerY - box.blockH / 2, height: box.blockH, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: box.headingW, marginRight: box.gap }}>
          <Text style={head} wrap={false}>期</Text>
          <Text style={head} wrap={false}>限</Text>
        </View>
        <View style={{ width: box.columnW, alignItems: 'center' }}>
          <Text style={big} wrap={false}>{parts?.year ?? ''}</Text>
          <Text style={big} wrap={false}>{parts?.monthDay ?? ''}</Text>
        </View>
      </View>
      <Text style={{ position: 'absolute', left: 0, width: w, top: box.footer.y, textAlign: 'center', fontFamily: 'NotoSansJP', fontSize: box.footer.size, lineHeight: 1.2 }} wrap={false}>{item.fnSku}</Text>
    </View>
  );
}

/** 配置どおりに描いた PDF を返す。ラベルの無い用紙は空白ページ。 */
export async function renderDrawnPdf(placements: DrawnPlacement[], pageCount: number, input: Omit<DrawOptions, 'measurer'>, fonts: LabelFontFiles): Promise<Buffer> {
  registerFonts(fonts);
  const opts: DrawOptions = { ...input, measurer: await createTextMeasurer(fonts) };
  const { sheet } = opts;
  const pageSize: [number, number] = [sheet.pageW * MM, sheet.pageH * MM];
  const byPage = new Map<number, DrawnPlacement[]>();
  for (const p of placements) {
    const list = byPage.get(p.page) ?? [];
    list.push(p);
    byPage.set(p.page, list);
  }
  const pages = Array.from({ length: Math.max(1, pageCount) }, (_, i) => i);
  const raw = await renderToBuffer(
    <Document title="商品ラベル">
      {pages.map((pageIndex) => (
        <Page key={pageIndex} size={pageSize} style={{ position: 'relative' }}>
          {(byPage.get(pageIndex) ?? []).map((p, i) => {
            const rect = cellRect(sheet, p.row, p.col, opts.offsetXmm, opts.offsetYmm);
            return (
              <View key={i} style={{ position: 'absolute', left: rect.x * MM, top: rect.y * MM, width: rect.w * MM, height: rect.h * MM }}>
                {p.label.kind === 'product'
                  ? <ProductLabel item={p.label.item} image={p.label.image} opts={opts} originXmm={rect.x} />
                  : <ExpiryLabel item={p.label.item} opts={opts} />}
              </View>
            );
          })}
        </Page>
      ))}
    </Document>,
  );
  return applyLabelPrintPreferences(raw);
}

/**
 * 画面の見本用: ラベル 1 枚＝1 ページ（ページの寸法＝ラベルの寸法）の PDF。印刷と同じ ProductLabel / ExpiryLabel で描くので、
 * これを画像にすれば印刷と同じ字形・幅になる。位置の微調整は紙上の位置の話なのでここでは使わない。
 */
export async function renderFacesPdf(labels: DrawnLabel[], input: Omit<DrawOptions, 'offsetXmm' | 'offsetYmm' | 'measurer'>, fonts: LabelFontFiles): Promise<Buffer> {
  registerFonts(fonts);
  const opts = input;
  const full: DrawOptions = { ...opts, offsetXmm: 0, offsetYmm: 0, measurer: await createTextMeasurer(fonts) };
  const pageSize: [number, number] = [opts.sheet.labelW * MM, opts.sheet.labelH * MM];
  return renderToBuffer(
    <Document title="商品ラベル見本">
      {labels.map((label, i) => (
        <Page key={i} size={pageSize} style={{ position: 'relative' }} wrap={false}>
          {label.kind === 'product'
            ? <ProductLabel item={label.item} image={label.image} opts={full} />
            : <ExpiryLabel item={label.item} opts={full} />}
        </Page>
      ))}
    </Document>,
  );
}
