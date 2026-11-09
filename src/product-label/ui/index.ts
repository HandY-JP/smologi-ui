// クライアント: 商品ラベルの印刷画面と、ラベル 1 枚の見本。PDF を作る部分は '../pdf'（サーバー専用）。
// 使う側の Tailwind の content に dist を入れ、'@handy-jp/smologi-ui/product-label.css'（ラベルの紙の色）を読み込むこと。
export * from './LabelFaceImage';
export * from './ProductLabelFace';
export * from './ProductLabelPrintDialog';
export * from './attachment-print';
export * from './default-modal';
export * from './face-render';
export * from './pdf-printer';
export { InlineActionSpinner, SkeletonBlock } from './parts';
