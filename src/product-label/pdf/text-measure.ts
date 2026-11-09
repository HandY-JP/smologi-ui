// 描画に使うフォント（NotoSansJP）の実測幅。コンディションを FNSKU と同じ行に置けるかの判定に使う。
// fontkit は読み込み時ではなく初めて使うときに動的 import する。読めなかったときは visualLength ベースの
// 多めの見積もりに倒す（＝コンディションは別の行になるだけで、印刷全体は落とさない）。
// フォントファイルの場所はアプリが決める（process.cwd() などの前提はこのパッケージに置かない）。
import { visualLength } from '../text';

/** 描画に使うフォントファイル（NotoSansJP の OTF）の絶対パス。 */
export interface LabelFontFiles {
  regular: string;
  bold: string;
}

export interface TextMeasurer {
  /** 文字列の幅（pt）。advance width の合計（カーニングなしの上限寄り）。読み込み失敗時は多めの見積もり。 */
  measure: (text: string, fontSize: number, bold: boolean) => number;
  /** 通常ウェイト・1pt あたりの幅。プレビュー用の実測値（toPreviewItem）に渡す。 */
  measureEm: (text: string) => number;
}

type Face = { unitsPerEm: number; layout: (text: string) => { glyphs: { advanceWidth: number }[] } };
type FontkitLike = { openSync: (p: string) => unknown };

let fontkitPromise: Promise<FontkitLike | null> | null = null;

function loadFontkit(): Promise<FontkitLike | null> {
  if (!fontkitPromise) {
    fontkitPromise = (async () => {
      try {
        const mod = (await import('fontkit')) as unknown as FontkitLike & { default?: FontkitLike };
        return typeof mod.openSync === 'function' ? mod : (mod.default ?? null);
      } catch (error) {
        console.error('[product-label] fontkit load failed; falling back to estimated widths', error instanceof Error ? error.message : error);
        return null;
      }
    })();
  }
  return fontkitPromise;
}

const measurers = new Map<string, Promise<TextMeasurer>>();

/**
 * フォントの実測器を作る（同じフォントの組なら使い回す）。描画の前に 1 回 await する。失敗しても投げない
 * （読めなかったときは見積もりの幅を返す）。
 */
export function createTextMeasurer(fonts: LabelFontFiles): Promise<TextMeasurer> {
  const key = `${fonts.regular}\n${fonts.bold}`;
  let hit = measurers.get(key);
  if (!hit) {
    hit = (async () => {
      const fontkit = await loadFontkit();
      const faces = new Map<string, Face>();
      let failed = fontkit === null;
      const face = (bold: boolean): Face | null => {
        if (failed || !fontkit) return null;
        const file = bold ? fonts.bold : fonts.regular;
        let f = faces.get(file);
        if (!f) {
          try {
            f = fontkit.openSync(file) as unknown as Face;
          } catch (error) {
            console.error('[product-label] font open failed; falling back to estimated widths', error instanceof Error ? error.message : error);
            failed = true;
            return null;
          }
          faces.set(file, f);
        }
        return f;
      };
      const measure = (text: string, fontSize: number, bold: boolean): number => {
        const f = face(bold);
        if (!f) return visualLength(text) * fontSize * 1.2;
        const w = f.layout(text).glyphs.reduce((sum, g) => sum + g.advanceWidth, 0);
        return (w / f.unitsPerEm) * fontSize;
      };
      return { measure, measureEm: (text: string) => measure(text, 1, false) };
    })();
    measurers.set(key, hit);
  }
  return hit;
}
