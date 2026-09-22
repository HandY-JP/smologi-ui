import { type ReactNode } from 'react';
export interface FilterChip {
    key: string;
    /** 条件名（「依頼種別」など） */
    label: string;
    /** 選択値（「FBA」など） */
    valueLabel: string;
    onClear: () => void;
}
/**
 * 適用中の絞り込みをツールバーに常時表示するチップ（×で個別解除）。
 * ポップオーバーを開かないと条件が見えない問題への対処。未適用なら何も描画しない。
 */
export declare function ActiveFilterChips({ chips, onClearAll, }: {
    chips: FilterChip[];
    onClearAll?: () => void;
}): import("react").JSX.Element | null;
export declare function FilterChipsHostProvider({ host, children }: {
    host: HTMLElement | null;
    children: ReactNode;
}): import("react").JSX.Element;
export declare function CollapsedFilterTriggerProvider({ collapsed, children }: {
    collapsed: boolean;
    children: ReactNode;
}): import("react").JSX.Element;
export interface FilterPopoverTabs {
    items: {
        key: string;
        label: string;
    }[];
    active: string;
    onChange: (key: string) => void;
}
/**
 * 「絞り込み」トリガーのピル。FilterPopover が使うほか、パネルを自前で持つ画面
 * （商品ピッカーのインライン詳細パネルなど）からも同じ見た目で使えるように公開する。
 * 畳んだ検索バーの中では、ピルではなく枠なしのじょうごアイコンになる。
 */
export declare function FilterTriggerButton({ label, activeCount, open, onToggle, title, ariaControls, }: {
    label?: string;
    activeCount: number;
    open: boolean;
    onToggle: () => void;
    title?: string;
    ariaControls?: string;
}): import("react").JSX.Element;
export declare function FilterPopover({ activeCount, onClearAll, chips, children, footer, tabs, title, description, triggerLabel, panelWidthClass, columns, align, triggerTitle, panelPortal, }: {
    /** 適用中の条件数（検索語も含めること） */
    activeCount: number;
    onClearAll?: () => void;
    /** 適用中チップ。SearchFilterBar 配下なら検索バーの下段へ自動で出る */
    chips?: FilterChip[];
    children: ReactNode;
    /** パネル下部の操作（「初期表示に保存」など） */
    footer?: ReactNode;
    /** パネル内タブ（出荷一覧の 絞り込み / 表示設定） */
    tabs?: FilterPopoverTabs;
    title?: string;
    description?: string;
    triggerLabel?: string;
    /** 幅を明示的に指定するとき用（未指定なら columns から決める）。 */
    panelWidthClass?: string;
    /**
     * 本文のレイアウト。既定は 1（従来どおり縦積み・幅 w-80）。
     * 条件が多い画面（出荷一覧の絞り込みタブなど）だけ 2 を指定すると、
     * 幅 w-[44rem] の2列グリッドになる（FilterField の span・FilterDateRange の
     * sm:col-span-2 はこのときだけ意味を持つ）。単一のラッパー子を渡す画面
     * （返品の商品ピッカー・NE商品登録など）で 2 を指定すると中身が半幅に潰れるので使わないこと。
     */
    columns?: 1 | 2;
    align?: 'left' | 'right';
    triggerTitle?: string;
    /**
     * パネルを body へ portal して fixed 配置する。
     * テーブルのヘッダーセルのように overflow（overflow-x-auto など）で切られる場所に
     * トリガーを置くとき用。既定は false ＝従来どおりトリガーの直下に absolute 配置。
     */
    panelPortal?: boolean;
}): import("react").JSX.Element;
/**
 * パネル内の見出し付きグループ（「基本」「在庫・保管」など）。
 *
 * 既定は従来どおり「見出し＋縦積み」。条件が多い画面（商品マスタ）だけが
 * active（見出し横の「適用中」ドット）と columns={2}（区画の中を2列に）を使う。
 * 既定値は変えないこと＝入荷・出荷・NE商品登録の見た目は据え置き。
 */
export declare function FilterSection({ title, first, active, columns, children, }: {
    title: string;
    /** 先頭セクションは上罫線を引かない */
    first?: boolean;
    /** この区画に適用中の条件があるとき true。見出しの右に小さな青い点を出す。 */
    active?: boolean;
    /**
     * 区画の中身のレイアウト。1（既定）は従来どおり縦積み。
     * 2 は「入るだけ2列・狭ければ1列」の自動折返しグリッド（auto-fit）。
     * ビューポートの sm: ではなく**パネルの実寸**で折り返すので、
     * サイドバーで狭くなった管理画面でも中身が潰れない。全幅にしたい項目は
     * 子側に col-span-full を付ける。
     */
    columns?: 1 | 2;
    children: ReactNode;
}): import("react").JSX.Element;
/**
 * ON/OFF のチップ（押すと塗り）。複数同時に押せる条件（「バーコードあり」「画像なし」など）を
 * 1行に並べて、ラベル＋セレクトの縦積みより縦を詰めるための部品。
 * 排他の2〜3択は従来どおりセグメント（ピル）を使うこと。
 */
export declare function FilterChipToggle({ label, pressed, onToggle, title, }: {
    label: string;
    pressed: boolean;
    onToggle: () => void;
    title?: string;
}): import("react").JSX.Element;
/** FilterChipToggle を並べる行（任意の見出し付き）。 */
export declare function FilterChipGroup({ label, children, ariaLabel, }: {
    label?: string;
    children: ReactNode;
    ariaLabel?: string;
}): import("react").JSX.Element;
/** ラベル＋任意のコントロール（SearchableSelect などを差し込む）。 */
export declare function FilterField({ label, hint, children, span, }: {
    label: string;
    hint?: string;
    children: ReactNode;
    /** パネルが2列のとき、幅の要る項目（チェックボックス群・検索欄など）は 2 を指定して全幅にする。 */
    span?: 1 | 2;
}): import("react").JSX.Element;
/** パネル内の共通 <select>（ラベル付き）。 */
export declare function FilterSelect({ label, value, onChange, options, }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: {
        value: string;
        label: string;
    }[];
}): import("react").JSX.Element;
/** パネル内の共通チェックボックス（「CSV未出力のみ」など）。 */
export declare function FilterCheckbox({ label, checked, onChange, tone, }: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    tone?: 'accent' | 'rose' | 'gray';
}): import("react").JSX.Element;
/**
 * 期間フィルタ（開始日／終了日）。from > to のときはその場でエラーを出す
 * （商品マスタだけが持っていた検証を全画面へ引き上げたもの）。
 */
export declare function FilterDateRange({ label, from, to, onChangeFrom, onChangeTo, fromLabel, toLabel, }: {
    /** 「入荷予定日の期間」など。省略時は見出しなし */
    label?: string;
    from: string;
    to: string;
    onChangeFrom: (value: string) => void;
    onChangeTo: (value: string) => void;
    fromLabel?: string;
    toLabel?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=FilterPopover.d.ts.map