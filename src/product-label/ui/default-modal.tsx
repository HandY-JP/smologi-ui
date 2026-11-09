'use client';
// 印刷画面の既定のモーダル（共通パッケージの Modal。headerAside もそのまま渡す）。
// アプリが自前の Modal（headerAside を持つもの）を使うときは、ProductLabelPrintDialog の modal に渡して差し替える。
import type { ReactNode } from 'react';
import { Modal, type ModalSize } from '../../components/Modal';

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

export function ProductLabelDefaultModal(props: LabelModalProps) {
  return <Modal {...props} />;
}
