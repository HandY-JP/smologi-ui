import { type CellLabel } from '../dialog-model';
import { type LabelExtraKey } from '../text';
export interface FaceOptions {
    /** 用紙 ID（用紙ごとのレイアウト上書きを引く）。 */
    sheetId?: string;
    labelW: number;
    labelH: number;
    image: boolean;
    extra: readonly LabelExtraKey[];
}
declare function ProductLabelFaceBase({ label, options }: {
    label: CellLabel;
    options: FaceOptions;
}): import("react").JSX.Element;
export declare const ProductLabelFace: import("react").MemoExoticComponent<typeof ProductLabelFaceBase>;
export {};
//# sourceMappingURL=ProductLabelFace.d.ts.map