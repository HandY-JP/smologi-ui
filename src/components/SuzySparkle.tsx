'use client';

/**
 * スージー（AI サポートチャット）の星アイコン。Seller・スモロジ・モバイルで共通（v0.21.0）。
 * アプリで星の SVG を手書きしない。右下の丸ボタンは SuzyLauncher、見出しの丸は SuzyOrb を使う。
 *
 * 形: 宝石のようにカットした大きな星＋小さな相棒の星（viewBox 0 0 24 24）。色は brand のグラデーション
 * （--accent → --cat-5-solid → --cat-1-solid）。tone="white" は見出しの色付き丸の上に載せる白い星。
 * 13px 以下は細かい面を省いた形に自動で切り替わる（小さくてもつぶれない）。
 *
 * state（動き）:
 * - idle      … 完全に静止。ふだんはこれ
 * - notice    … お知らせあり。大きな星に光が走り（約 2.5 秒周期）、小さな星がまたたく
 * - thinking  … スージーが考え中。光が速く続けて走る（丸ボタン側のくるくる回る輪は SuzyLauncher / SuzyOrb が足す）
 * - night     … 夜のおやすみ中。少し暗く（opacity 0.55）動かない。月マークは出さない
 * prefers-reduced-motion では動きをすべて止める（components.css）。
 * SVG の id は useId でインスタンスごとに一意。
 */
import { useId, type CSSProperties } from 'react';

export type SuzyState = 'idle' | 'notice' | 'thinking' | 'night';
export type SuzySparkleTone = 'color' | 'white';

/** この大きさ（px）以下は、面を省いた簡略形にする。 */
export const SUZY_SPARKLE_SIMPLE_MAX_SIZE = 13;

/** 4 つの頂点を持つ星（中心 cx,cy・半径 r・くびれ w）の path。 */
function star(cx: number, cy: number, r: number, w: number): string {
  return `M${cx} ${cy - r}Q${cx + w} ${cy - w} ${cx + r} ${cy}Q${cx + w} ${cy + w} ${cx} ${cy + r}Q${cx - w} ${cy + w} ${cx - r} ${cy}Q${cx - w} ${cy - w} ${cx} ${cy - r}Z`;
}

/** 宝石のカット面。右上=明るい面、左上=やわらかい明面、左下=影、右下=やわらかい影。 */
function Facets({ cx, cy, r, w, white }: { cx: number; cy: number; r: number; w: number; white: boolean }) {
  const q = (x1: number, y1: number, cxp: number, cyp: number, x2: number, y2: number, fill: string, opacity: number, key: string) =>
    opacity > 0 ? <path key={key} d={`M${x1} ${y1}Q${cxp} ${cyp} ${x2} ${y2}L${cx} ${cy}Z`} fill={fill} opacity={opacity} /> : null;
  return (
    <>
      {q(cx, cy - r, cx + w, cy - w, cx + r, cy, '#fff', white ? 0 : 0.42, 'tr')}
      {q(cx, cy - r, cx - w, cy - w, cx - r, cy, '#fff', white ? 0 : 0.16, 'tl')}
      {q(cx, cy + r, cx - w, cy + w, cx - r, cy, '#1a1033', white ? 0.14 : 0.22, 'bl')}
      {q(cx, cy + r, cx + w, cy + w, cx + r, cy, '#1a1033', white ? 0.06 : 0.08, 'br')}
    </>
  );
}

export interface SuzySparkleProps {
  /** 表示サイズ（px）。既定 22。 */
  size?: number;
  /** 'color'＝グラデーション（既定）／'white'＝白（色付きの丸の上用）。 */
  tone?: SuzySparkleTone;
  state?: SuzyState;
  /** 簡略形を強制する／しない。省略時は size <= 13 で簡略形。 */
  simplified?: boolean;
  className?: string;
  style?: CSSProperties;
  /** 読み上げ名。省略時は装飾扱い（aria-hidden）。 */
  title?: string;
}

export function SuzySparkle({ size = 22, tone = 'color', state = 'idle', simplified, className, style, title }: SuzySparkleProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `suzy-g-${uid}`;
  const glintId = `suzy-m-${uid}`;
  const clipId = `suzy-c-${uid}`;
  const white = tone === 'white';
  const simple = simplified ?? size <= SUZY_SPARKLE_SIMPLE_MAX_SIZE;
  const fill = white ? '#fff' : `url(#${gradId})`;
  const cls = ['suzy-sparkle', `suzy-sparkle--${state}`, className].filter(Boolean).join(' ');
  const a11y = title ? { role: 'img' as const, 'aria-label': title } : { 'aria-hidden': true as const };

  const gradient = white ? null : (
    <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" style={{ stopColor: 'rgb(var(--accent, 234 88 12))' }} />
      <stop offset="0.55" style={{ stopColor: 'rgb(var(--cat-5-solid, 139 92 246))' }} />
      <stop offset="1" style={{ stopColor: 'rgb(var(--cat-1-solid, 59 130 246))' }} />
    </linearGradient>
  );

  if (simple) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} className={cls} style={style} data-suzy-glyph="simple" {...a11y}>
        {gradient && <defs>{gradient}</defs>}
        <path d={star(10.6, 13.2, 10, 3)} fill={fill} />
        <path d={star(19.4, 4.6, 3.3, 0.95)} fill={fill} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={cls} style={style} data-suzy-glyph="full" {...a11y}>
      <defs>
        {gradient}
        {!white && (
          <linearGradient id={glintId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        )}
        <clipPath id={clipId}>
          <path d={star(10.6, 13.2, 9.6, 2.7)} />
        </clipPath>
      </defs>
      <g>
        <path d={star(10.6, 13.2, 9.6, 2.7)} fill={fill} />
        <Facets cx={10.6} cy={13.2} r={9.6} w={2.7} white={white} />
        {!white && (
          <>
            {/* 光の筋。ふだんは星の外（左）で待機し、notice / thinking のときだけ星を横切る */}
            <g clipPath={`url(#${clipId})`}>
              <rect className="suzy-glint" x="3.6" y="-1" width="5" height="28" fill={`url(#${glintId})`} style={{ transform: 'translateX(-14px)' }} />
            </g>
            <circle cx="8" cy="9.9" r="0.8" fill="#fff" opacity="0.9" />
          </>
        )}
      </g>
      <g>
        <path className="suzy-twinkle" d={star(19.4, 4.6, 3.1, 0.8)} fill={fill} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
      </g>
    </svg>
  );
}
