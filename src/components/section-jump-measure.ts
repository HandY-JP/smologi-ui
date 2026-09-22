'use client';
// セクション見出しのジャンプ一覧（SectionJumpNav）の「入り切る分だけ表示する」計算に使う実寸測定。
//
// 本番不具合（2026-09-15「200件表示でスクロールすると一覧が揺れる」）の一因への対処:
// 見出しはセクションの数だけ並ぶ（入荷を200件表示すると日付見出しが数十個）。以前は
// **見出しごとに**「全候補を描画した計測専用コンテナ」を持っていたため、計測用のボタンだけで
// N×N 個の DOM ができ、ResizeObserver も N 個、実寸読み取り（getBoundingClientRect）も
// N×N 回走っていた。スクロール中の再レイアウトが重くなり、長いフレームの原因になる。
//
// ここでは画面全体で**1つだけ**の隠しコンテナ（body 直下・visibility:hidden・フローに影響しない
// 位置）を使い、同じ「ラベル＋件数＋ドットの有無」なら一度測った幅を使い回す。
// 見た目のクラス（.sb-section-jump / .sb-section-jump-dot / .sb-section-jump-label）は
// SectionJumpNav の描画とまったく同じものを使うので、実際のボタンと同じ幅が得られる。

import type { SectionJumpItem } from './SectionJumpNav';

const MORE_SAMPLE_LABEL = '＋99 ▾';
const FALLBACK_MORE_WIDTH_PX = 44;

let host: HTMLDivElement | null = null;
const widthCache = new Map<string, number>();
let moreWidthPx: number | null = null;

function cacheKey(item: SectionJumpItem): string {
  const count = item.count > 999 ? '999+' : String(item.count);
  return `${item.label}\u001f${count}\u001f${item.dotClassName ? '1' : '0'}`;
}

function ensureHost(): HTMLDivElement | null {
  if (typeof document === 'undefined') return null;
  if (host && host.isConnected) return host;
  host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  // 画面外に置かず「見えないだけ」にする（display:none だと幅が 0 になって測れない）。
  host.style.cssText = 'position:fixed;left:0;top:0;z-index:-1;visibility:hidden;pointer-events:none;display:flex;gap:3px;white-space:nowrap;';
  document.body.appendChild(host);
  return host;
}

function buildButton(item: SectionJumpItem | null): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'sb-section-jump';
  if (!item) {
    button.textContent = MORE_SAMPLE_LABEL;
    return button;
  }
  if (item.dotClassName) {
    const dot = document.createElement('span');
    dot.className = `sb-section-jump-dot ${item.dotClassName}`;
    button.appendChild(dot);
  }
  const label = document.createElement('span');
  label.className = 'sb-section-jump-label';
  label.textContent = item.label;
  button.appendChild(label);
  const count = document.createElement('b');
  count.textContent = item.count > 999 ? '999+' : String(item.count);
  button.appendChild(count);
  return button;
}

export interface SectionJumpMeasurement {
  /** item.key → ボタンの実寸（px）。 */
  widths: Map<string, number>;
  /** 「＋n ▾」ボタンの実寸（px）。 */
  moreWidthPx: number;
}

/**
 * ジャンプ一覧の各ボタンの実寸を返す。測ったことのある組み合わせはキャッシュから返すので、
 * 見出しが何個あっても実際の測定は「新しいラベル×件数」の分だけしか起きない。
 */
export function measureSectionJumpWidths(items: SectionJumpItem[]): SectionJumpMeasurement {
  const widths = new Map<string, number>();
  const missing = items.filter((item) => !widthCache.has(cacheKey(item)));
  const needMore = moreWidthPx == null;

  if (missing.length > 0 || needMore) {
    const container = ensureHost();
    if (container) {
      container.textContent = '';
      const nodes = missing.map((item) => {
        const node = buildButton(item);
        container.appendChild(node);
        return node;
      });
      const moreNode = needMore ? container.appendChild(buildButton(null)) : null;
      // 追加し終えてからまとめて読む（1要素ごとに書いて読むとレイアウトが何度も走る）。
      missing.forEach((item, index) => {
        widthCache.set(cacheKey(item), nodes[index].getBoundingClientRect().width);
      });
      if (moreNode) moreWidthPx = moreNode.getBoundingClientRect().width;
      container.textContent = '';
    }
  }

  for (const item of items) widths.set(item.key, widthCache.get(cacheKey(item)) ?? 0);
  return { widths, moreWidthPx: moreWidthPx ?? FALLBACK_MORE_WIDTH_PX };
}
