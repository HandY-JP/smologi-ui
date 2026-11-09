import { type FaceOptions } from './ProductLabelFace';
import { type CellLabel, type PreviewTarget } from '../dialog-model';
import { type FaceSettings, type FaceSource } from './face-render';
export type FaceStatus = 'idle' | 'loading' | 'done' | 'failed';
export interface LabelFaces {
    map: Map<string, string>;
    status: FaceStatus;
}
/** 見本画像の一覧（faceKey → data URL）。対象や用紙・画像・SKU・期限シールの設定が変わったら 300ms 待って取り直す（前の取得は中断）。 */
export declare function useLabelFaces(targets: PreviewTarget[] | null, settings: FaceSettings, source: FaceSource): LabelFaces;
/**
 * 見本 1 枚。画像があれば画像。画像ができるまでは placeholder（skeleton＝枠の骨組み / svg＝簡易表示を薄く）。
 * 取れなかったとき・画像の対象でないときは簡易表示。
 */
export declare function LabelFace({ label, faces, options, placeholder }: {
    label: CellLabel;
    faces: LabelFaces;
    options: FaceOptions;
    placeholder?: 'svg' | 'skeleton';
}): import("react").JSX.Element;
//# sourceMappingURL=LabelFaceImage.d.ts.map