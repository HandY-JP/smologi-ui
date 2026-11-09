'use client';
// 商品ラベル 1 枚の印字イメージ（SVG）。印刷（pdf/generate.tsx）と同じ配置計算（label-layout.ts）の数値（pt）を
// そのまま viewBox にして描くので、マスの大きさに合わせて拡大縮小しても印刷と同じ比率になる。
import { memo, type ReactNode } from 'react';
import { code128Bars } from '../code128';
import { cellLabelBox, nameMeasurer, type CellLabel } from '../dialog-model';
import { computeExpiryBox, EXPIRY_LINE, nameRows, MM } from '../label-layout';
import { formatExpiry, type LabelExtraKey } from '../text';

const FONT = "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif";
const INK = '#000';

export interface FaceOptions {
  /** 用紙 ID（用紙ごとのレイアウト上書きを引く）。 */
  sheetId?: string;
  labelW: number;
  labelH: number;
  image: boolean;
  extra: readonly LabelExtraKey[];
}

function Txt({ x, y, size, bold, end, children }: { x: number; y: number; size: number; bold?: boolean; end?: boolean; children: ReactNode }) {
  return (
    <text x={x} y={y} fontSize={size} fontWeight={bold ? 700 : 400} fontFamily={FONT} fill={INK} dominantBaseline="central" textAnchor={end ? 'end' : 'start'}>
      {children}
    </text>
  );
}

function productFace(label: CellLabel, o: FaceOptions) {
  const box = cellLabelBox(label, { labelW: o.labelW, labelH: o.labelH, id: o.sheetId }, o);
  const fnSku = label.fnSku ?? '';
  const condition = label.conditionLabel ?? '';
  const fs = box.fontSize;
  const lh = box.lineHeight;
  const { bars } = code128Bars(fnSku);
  const withCond = box.extras.find((e) => e.placement === 'withCondition');
  const nameLines = nameRows(label.name ?? '', box.text.w, nameMeasurer(label.nameCharEm, box.nameFontSize), box.nameLines);
  const tx = box.text.x;
  let y = box.text.y;
  const rows: ReactNode[] = [];
  const mid = (h: number) => y + h / 2;
  if (box.conditionOwnLine || !condition) {
    rows.push(<Txt key="f" x={tx} y={mid(lh)} size={fs}>{fnSku}</Txt>);
  } else {
    rows.push(<Txt key="f" x={tx} y={mid(lh)} size={fs}>{fnSku}</Txt>);
    rows.push(<Txt key="c" x={tx + box.text.w} y={mid(lh)} size={box.conditionFontSize} end>{condition}</Txt>);
  }
  y += lh;
  if (box.conditionOwnLine) {
    const rowH = Math.max(box.conditionFontSize, withCond ? box.extraFontSize : 0) * 1.2;
    rows.push(<Txt key="c2" x={tx} y={mid(rowH)} size={box.conditionFontSize}>{condition}</Txt>);
    if (withCond) rows.push(<Txt key="e2" x={tx + box.text.w} y={mid(rowH)} size={box.extraFontSize} end>{withCond.text}</Txt>);
    y += rowH;
  }
  nameLines.forEach((line, i) => {
    rows.push(<Txt key={`n${i}`} x={tx} y={mid(box.nameFontSize * 1.2)} size={box.nameFontSize}>{line}</Txt>);
    y += box.nameFontSize * 1.2;
  });
  box.extras.filter((e) => e.placement === 'row').forEach((e, i) => {
    rows.push(<Txt key={`e${i}`} x={tx} y={mid(box.extraFontSize * 1.2)} size={box.extraFontSize}>{e.text}</Txt>);
    y += box.extraFontSize * 1.2;
  });
  const b = box.barcode;
  return (
    <svg viewBox={`0 0 ${box.width} ${box.height}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden style={{ display: 'block' }}>
      {bars.map((bar, i) => (
        <rect key={i} x={b.x + (b.offsetModules + bar.x) * b.moduleW} y={b.y} width={bar.width * b.moduleW} height={b.h} fill={INK} />
      ))}
      {box.image && (
        <g>
          <rect x={box.image.x} y={box.image.y} width={box.image.size} height={box.image.size} fill="#e5e5e5" stroke="#bdbdbd" strokeWidth={0.4} />
          <path
            d={`M${box.image.x + box.image.size * 0.2} ${box.image.y + box.image.size * 0.72} L${box.image.x + box.image.size * 0.42} ${box.image.y + box.image.size * 0.45} L${box.image.x + box.image.size * 0.58} ${box.image.y + box.image.size * 0.62} L${box.image.x + box.image.size * 0.68} ${box.image.y + box.image.size * 0.52} L${box.image.x + box.image.size * 0.8} ${box.image.y + box.image.size * 0.72} Z`}
            fill="#bdbdbd"
          />
        </g>
      )}
      {/* 文字は印刷と同じく本文の領域でクリップする（入りきらない分は切れる）。座標は元のまま viewBox で合わせる */}
      <svg x={box.text.x} y={box.text.y} width={box.text.w} height={box.text.h} viewBox={`${box.text.x} ${box.text.y} ${box.text.w} ${box.text.h}`} overflow="hidden">
        {rows}
      </svg>
    </svg>
  );
}

function expiryFace(label: CellLabel, o: FaceOptions) {
  const parts = formatExpiry(label.expiration);
  const box = computeExpiryBox(o.labelW, o.labelH, o.sheetId);
  const w = o.labelW * MM;
  const h = o.labelH * MM;
  const x0 = (w - box.blockW) / 2;
  const cy = box.centerY;
  const lineH = box.bigSize * EXPIRY_LINE;
  const headX = x0 + box.headingW / 2;
  const colX = x0 + box.headingW + box.gap + box.columnW / 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden style={{ display: 'block' }}>
      <g textAnchor="middle" fontSize={box.headingSize} fontFamily={FONT} fill={INK} dominantBaseline="central">
        <text x={headX} y={cy - box.headingLineH / 2}>期</text>
        <text x={headX} y={cy + box.headingLineH / 2}>限</text>
      </g>
      <g textAnchor="middle">
        <text x={colX} y={cy - lineH / 2} fontSize={box.bigSize} fontWeight={700} fontFamily={FONT} fill={INK} dominantBaseline="central">{parts?.year ?? ''}</text>
        <text x={colX} y={cy + lineH / 2} fontSize={box.bigSize} fontWeight={700} fontFamily={FONT} fill={INK} dominantBaseline="central">{parts?.monthDay ?? ''}</text>
      </g>
      <text x={w / 2} y={box.footer.y + box.footer.lineH / 2} fontSize={box.footer.size} fontFamily={FONT} fill={INK} dominantBaseline="central" textAnchor="middle">{label.fnSku ?? ''}</text>
    </svg>
  );
}

const cache = new Map<string, ReactNode>();

function ProductLabelFaceBase({ label, options }: { label: CellLabel; options: FaceOptions }) {
  // 同じ品目・同じ設定のマスは同じ SVG を使い回す
  const key = [
    label.kind, label.fnSku, label.name, label.expiration, label.sellerSku, label.conditionLabel, label.fnSkuEm, label.conditionEm, label.skuEm, label.hasImage, label.unitsPerSet, label.expiryManaged, JSON.stringify(label.extraEm ?? null),
    options.sheetId, options.labelW, options.labelH, options.image, options.extra.join(','),
  ].join('\u0001');
  let node = cache.get(key);
  if (!node) {
    node = label.kind === 'expiry' ? expiryFace(label, options) : productFace(label, options);
    if (cache.size > 300) cache.clear();
    cache.set(key, node);
  }
  return <>{node}</>;
}

export const ProductLabelFace = memo(
  ProductLabelFaceBase,
  (a, b) =>
    a.label === b.label ||
    (a.label.kind === b.label.kind &&
      a.label.fnSku === b.label.fnSku &&
      a.label.name === b.label.name &&
      a.label.expiration === b.label.expiration &&
      a.label.sellerSku === b.label.sellerSku &&
      a.label.conditionLabel === b.label.conditionLabel &&
      a.label.hasImage === b.label.hasImage &&
      a.options.sheetId === b.options.sheetId &&
      a.options.labelW === b.options.labelW &&
      a.options.labelH === b.options.labelH &&
      a.options.image === b.options.image &&
      a.label.unitsPerSet === b.label.unitsPerSet &&
      a.label.expiryManaged === b.label.expiryManaged &&
      a.options.extra.join(',') === b.options.extra.join(',')),
);
