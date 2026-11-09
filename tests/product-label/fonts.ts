// テスト用のフォント。本物の NotoSansJP から、テストで使う文字だけを切り出したもの（幅は本物と同じ）。
// 本物のフォントで確かめたいときは LABEL_FONT_DIR に NotoSansJP-Regular.otf / NotoSansJP-Bold.otf のあるフォルダを指す。
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTextMeasurer, type LabelFontFiles } from '../../src/product-label/pdf/text-measure';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = process.env.LABEL_FONT_DIR;

export const TEST_FONTS: LabelFontFiles = dir
  ? { regular: path.join(dir, 'NotoSansJP-Regular.otf'), bold: path.join(dir, 'NotoSansJP-Bold.otf') }
  : {
      regular: path.join(here, '../fixtures/NotoSansJP-Regular.subset.otf'),
      bold: path.join(here, '../fixtures/NotoSansJP-Bold.subset.otf'),
    };

export const textMeasurer = await createTextMeasurer(TEST_FONTS);
export const measureTextWidth = textMeasurer.measure;
export async function loadTextMeasurer(): Promise<void> {
  // 読み込みはこのファイルの先頭で済んでいる
}
