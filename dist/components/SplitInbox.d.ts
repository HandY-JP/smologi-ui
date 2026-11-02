import type { ReactNode } from 'react';
export declare function SplitInbox({ list, detail, aside, selected, onBack, backLabel, emptyDetail, listWidth, asideWidth, className, }: {
    list: ReactNode;
    detail: ReactNode;
    /** 補助列（注文情報など）。lg 以上で右に出す。省略すれば 2 列。 */
    aside?: ReactNode;
    /** 詳細を開いているか。狭い幅の画面切替に使う。 */
    selected: boolean;
    /** 狭い幅の戻るボタン。 */
    onBack: () => void;
    backLabel?: string;
    /** PC で未選択のときの詳細欄の中身。 */
    emptyDetail?: ReactNode;
    /** 一覧列の幅クラス（PC）。 */
    listWidth?: string;
    /** 補助列の幅クラス。 */
    asideWidth?: string;
    className?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=SplitInbox.d.ts.map