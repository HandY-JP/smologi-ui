'use client';
// トップバー再設計（2026-09）: 入荷作成・出荷作成など「大きめの作業」を、右ドロワー
// （CustomerToolsRail/CustomerToolsDrawerFrame）の代わりに画面中央のポップアップで行うための器。
// 既存の共通モーダルシェル（Modal）に、決定済みの寸法・見た目（幅 min(1100px,92vw)・
// 高さ min(820px,90vh)・角丸16px・背景 rgba(15,23,42,.35)+blur(4px)）を固定して被せるだけの薄いラッパー。
//
// 中身の型（ヘッダー／本文＝左 基本情報320px・右 商品行／フッター右寄せ主操作）はページごとに
// 異なる（入荷作成・出荷作成でフォームの中身が違う）ため、ここでは共通の「外枠」だけを提供し、
// 左ペイン・本体・フッターは呼び出し側の children で組み立てる。
import type { ReactNode } from 'react';
import { Modal, type ModalLayer } from './Modal';

export function LargeModal({
  open,
  onClose,
  title,
  subtitle,
  headerRight,
  layer = 'base',
  dismissable = true,
  closeOnBackdrop = false,
  footer,
  bodyClassName = 'p-0',
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** ヘッダー右（× の手前）に並べる操作。入荷作成のお客様セレクタなど。 */
  headerRight?: ReactNode;
  layer?: ModalLayer;
  /** フォーム系の作業モーダルなので、既定では Escape/× のみ閉じられる（背景クリックでは閉じない）。 */
  dismissable?: boolean;
  closeOnBackdrop?: boolean;
  footer?: ReactNode;
  bodyClassName?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      headerRight={headerRight}
      layer={layer}
      dismissable={dismissable}
      closeOnBackdrop={closeOnBackdrop}
      size="4xl"
      panelClassName="!max-w-[min(1100px,92vw)] h-[min(820px,90vh)] !rounded-2xl"
      panelMaxHeightClassName="!max-h-[min(820px,90vh)]"
      overlayClassName="!bg-[rgba(15,23,42,0.35)] backdrop-blur-[4px]"
      bodyClassName={bodyClassName}
      footer={footer}
    >
      {children}
    </Modal>
  );
}
