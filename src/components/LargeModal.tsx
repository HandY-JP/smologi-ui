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
  size = 'default',
  layer = 'base',
  dismissable = true,
  closeOnBackdrop = false,
  dirty = false,
  showCloseButton,
  compactHeader,
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
  /**
   * 横幅。既定は min(1100px,92vw)。
   * 'wide' = min(1280px,94vw)（2026-09-23 ユーザー決定）。3 カラムになる作成モーダル
   * （出荷依頼作成＝できること 200px ＋ 基本情報 300px ＋ 商品、入荷予定作成）だけに使う。
   * 高さ・角丸・背景は変えない。
   */
  size?: 'default' | 'wide';
  layer?: ModalLayer;
  /** 処理中（送信・取込など）は false を渡して Escape/背景クリックを止める。 */
  dismissable?: boolean;
  /**
   * 背景クリックで閉じるか。既定は false（フォーム系の作業モーダルなので誤爆を避ける）。
   * 「外を押したら閉じる」にしたいときは true を渡す（スモロジ本体の既定）。
   */
  closeOnBackdrop?: boolean;
  /** 入力途中かどうか。true の間は背景クリック・Escape の前に確認バーを挟む。 */
  dirty?: boolean;
  /** 右上の × を出すか。省略時は Modal の既定（閉じられるときは出す）のまま。 */
  showCloseButton?: boolean;
  /** ヘッダーを薄くする（Modal の compactHeader）。既定 false。 */
  compactHeader?: boolean;
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
      dirty={dirty}
      showCloseButton={showCloseButton}
      compactHeader={compactHeader}
      size="4xl"
      panelClassName={`${size === 'wide' ? '!max-w-[min(1280px,94vw)]' : '!max-w-[min(1100px,92vw)]'} h-[min(820px,90vh)] !rounded-2xl`}
      panelMaxHeightClassName="!max-h-[min(820px,90vh)]"
      overlayClassName="!bg-[rgba(15,23,42,0.35)] backdrop-blur-[4px]"
      bodyClassName={bodyClassName}
      footer={footer}
    >
      {children}
    </Modal>
  );
}
