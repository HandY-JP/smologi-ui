import type { ReactNode } from 'react';
import { type ModalSize } from '../../components/Modal';
export interface LabelModalProps {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    /** タイトルのすぐ右（同じ行）に並べる補足（枚数の要約など）。 */
    headerAside?: ReactNode;
    headerRight?: ReactNode;
    showCloseButton?: boolean;
    size?: ModalSize;
    ariaLabel?: string;
    panelClassName?: string;
    panelMaxHeightClassName?: string;
    bodyClassName?: string;
    children?: ReactNode;
}
export declare function ProductLabelDefaultModal(props: LabelModalProps): import("react").JSX.Element;
//# sourceMappingURL=default-modal.d.ts.map