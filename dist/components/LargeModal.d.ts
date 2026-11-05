import type { ReactNode } from 'react';
import { type ModalLayer } from './Modal';
export declare function LargeModal({ open, onClose, title, subtitle, headerRight, size, layer, dismissable, closeOnBackdrop, dirty, showCloseButton, compactHeader, footer, bodyClassName, children, }: {
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
}): import("react").JSX.Element | null;
//# sourceMappingURL=LargeModal.d.ts.map