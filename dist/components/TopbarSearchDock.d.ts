import { type CSSProperties, type ReactNode } from 'react';
/**
 * 検索バーの外（テーブルヘッダーなど）に置くアイコンにも SearchFilterBar と同じ
 * アクセント変数を配る（未定義だと color 指定が無効値になり色が付かない）。
 */
export declare const SEARCH_ACCENT_STYLE: CSSProperties;
export interface TopbarSearchDockController {
    /** いまトップバーにピルを出しているか（タブ列と排他）。 */
    docked: boolean;
    /** 一覧ヘッダーの虫眼鏡から呼ぶ。出す＋フォーカス／空なら畳む、をひとつのボタンで担う。 */
    toggleFromHeader: () => void;
    /** スクロール判定用の番兵へ渡す callback ref。一覧の直上に置く空要素。 */
    observeSentinel: (node: HTMLElement | null) => void;
    /**
     * 内部用（TopbarSearchDock が使う）。ref オブジェクトは持たせず callback ref だけを配る
     * ＝実際に描画中へ ref.current を読み出す箇所は作らない。
     *
     * ただし react-hooks/refs の lint は「controller という ref 由来の値を JSX の props へ
     * 渡している」だけで警告を出す（呼び出し元5画面で実際に出ている）。設計上そこは通す形なので、
     * この警告は許容する（`next build` は eslint をブロッキングにしていないので落ちない）。
     * 消したい場合は controller を props で配るのをやめて Context 経由にする必要があり、
     * ドックとヘッダーアイコンを別ツリーに置ける今の構成を壊すので、そこまではやっていない。
     */
    internal: {
        slot: HTMLElement | null;
        setDockNode: (node: HTMLDivElement | null) => void;
        setInputNode: (node: HTMLInputElement | null) => void;
        onFocus: () => void;
        onBlur: (event: React.FocusEvent<HTMLDivElement>) => void;
        /** Escape で畳む画面か（常設バーがある画面は Escape を横取りしない）。 */
        handlesEscape: boolean;
        onEscape: () => void;
    };
}
export interface TopbarSearchDockOptions {
    /**
     * 検索が唯一の主操作の画面（商品マスタ）向け。スクロール・虫眼鏡クリックに関係なく、
     * 常にトップバーへ検索ピルを出したままにする。一覧側には常設バーもヘッダーの虫眼鏡も
     * 置かない前提（`observeSentinel` / `toggleFromHeader` は呼ばれない）。
     */
    alwaysDocked?: boolean;
    /**
     * ピルの差し込み先を既定（configureTopbarDockSlots で登録した ID）から差し替える。
     * トップバー再設計（2026-09、入荷・出荷）: 検索ピルを右端固定スロット
     * （ADMIN_TOPBAR_ACTIONS_SLOT_ID）へ出すために使う。未指定なら従来どおり。
     */
    slotOverrideId?: string;
}
/**
 * トップバー検索ドックの出し入れ。`value` は検索語（空かどうかだけを見る）。
 *
 * 既定（常設バー無しの画面）:
 *   出す条件: ヘッダーの虫眼鏡を押した / 一覧をスクロールした / 検索語がある / 入力中
 *   畳む条件: 上のどれでもなくなったとき（＝空のままフォーカスを外す・最上部へ戻る）
 * `alwaysDocked: true`（商品マスタ）:
 *   常に出したまま。スクロール判定・虫眼鏡クリック・Escape はいずれも関与しない。
 */
export declare function useTopbarSearchDock(value: string, { alwaysDocked, slotOverrideId }?: TopbarSearchDockOptions): TopbarSearchDockController;
/**
 * トップバーの検索ピル本体。ドックが出ている間だけスロットへ portal する。
 * 見た目は SearchFilterBar と同じ「1つの丸ピルの中に 検索入力｜絞り込み」構図
 * （絞り込みをピルの外に置くと、ピルの右端が閉じずに継ぎ目のように見える）。
 */
export declare function TopbarSearchDock({ controller, value, onValueChange, onSearch, onCleared, placeholder, inputAriaLabel, loading, dirty, disabled, leadingControl, viewControl, filterControl, widthClass, widthPx, coexistWithTabs, slashKeycap, }: {
    controller: TopbarSearchDockController;
    value: string;
    onValueChange: (value: string) => void;
    onSearch: () => void;
    /**
     * 入力が空になった瞬間に呼ぶ（`type="search"` のブラウザ標準の × を押した／文字を全部消した）。
     *
     * ★ Enter で確定する画面（適用済み検索を別 state に持つ画面）は必ず渡すこと。
     *   渡さないと「× で文字は消えたのに一覧は絞られたまま・URLの ?q= も残る」になる（本番不具合）。
     *   実装は「入力欄と適用済みの両方を空にする」＝ 一覧のクリアと同じ処理でよい。
     *   ここで onSearch() を代用してはいけない（onSearch は更新前の state を読むため空が反映されない）。
     *   入力しながら即時に絞り込む画面（デバウンス含む）は勝手に追随するので渡さなくてよい。
     */
    onCleared?: () => void;
    placeholder: string;
    inputAriaLabel?: string;
    loading?: boolean;
    dirty?: boolean;
    disabled?: boolean;
    /**
     * ピル左端（虫眼鏡ボタンより前）に埋め込む追加コントロール（商品マスタ admin の
     * お客様セレクタなど）。指定時は虫眼鏡ボタン側の左端の丸みを外し、leadingControl の
     * 右に挟む縦線が区切り線を担う（丸みはピル本体が持つ）。未指定なら現行どおり虫眼鏡が左端になる。
     */
    leadingControl?: ReactNode;
    /** ピル右端、絞り込みの手前に埋め込む追加トリガー（保存ビューのアイコン版など）。 */
    viewControl?: ReactNode;
    /** ピル右端に埋め込む絞り込みトリガー（FilterPopover など）。 */
    filterControl?: ReactNode;
    widthClass?: string;
    /**
     * 本番崩れ修正（2026-09-14）: 実測に基づいて確定した幅（px）。指定すると widthClass の
     * 幅ユーティリティ（w-[...]）を上書きする（インラインスタイルはクラスより詳細度が高い）。
     * 実測前（未計測）は渡さない＝widthClass の既定 clamp のまま初期描画する。
     */
    widthPx?: number;
    /**
     * true のとき、globals.css の「ドックが出ている間はタブ列を隠す」排他を解除し、
     * トップバーのタブ列と横並びで共存させる（呼び出し元が画面幅を判定して渡す）。
     * 商品マスタの常時ドック（alwaysDocked）を、十分広い画面でだけタブ列と共存させる用途。
     */
    coexistWithTabs?: boolean;
    /**
     * ピル右端（入力欄のすぐ右）に「/」キーキャップのヒントを出す（20×18px・枠線1px・11px・薄いグレー）。
     * 入荷・出荷など、ページ側が「/」ショートカット（useTopbarShortcuts）で検索へフォーカスできる
     * 画面だけが渡す（商品マスタ等の常時ドック画面は不変のため既定 false）。
     * フォーカス中は消す（:focus-within）。畳み時（呼び出し元が渡さない／false にする）も出さない。
     */
    slashKeycap?: boolean;
}): import("react").ReactPortal | null;
/**
 * 一覧ヘッダーのアイコンボタン共通クラス。
 * hover は透過なしの hover:bg-gray-200（ヘッダーの bg-gray-50 に対してライトでも
 * 十分見え、globals.css のダーク上書きも効く階調）。
 * trailing に足すアイコン（更新など）もこれを使って大きさ・階調を揃える。
 */
export declare const LIST_HEADER_ICON_BUTTON = "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--search-accent)] disabled:cursor-wait disabled:opacity-60";
/**
 * 一覧ヘッダー（テーブルの見出しセル）へ置く 虫眼鏡＋じょうご のアイコン組。
 * 虫眼鏡はトップバーのピルを開き、じょうごはその場で絞り込みパネルを開く（#386 と同じ流儀）。
 * 見出しのソートなどとは独立したクリック領域にするため、必ずボタンとして置く。
 */
export declare function ListHeaderSearchIcons({ controller, searchLabel, filterControl, trailing, align, }: {
    controller: TopbarSearchDockController;
    /** 虫眼鏡の title / aria-label（「商品コード・JANで検索」など）。 */
    searchLabel: string;
    /** じょうご（FilterPopover）。panelPortal を付けて表の overflow に切られないようにすること。 */
    filterControl?: ReactNode;
    /**
     * じょうごの右へ並べる追加アイコン（入荷一覧の「更新」など）。
     * 見た目を揃えるため LIST_HEADER_ICON_BUTTON を使ったボタンを渡すこと。
     */
    trailing?: ReactNode;
    /**
     * 'end'（既定）は ml-auto で右端寄せ（空状態のバーやツールバー向け）。
     * 表ヘッダーの最左セルへ置くときは 'start' を指定して左端に寄せる。
     */
    align?: 'start' | 'end';
}): import("react").JSX.Element;
//# sourceMappingURL=TopbarSearchDock.d.ts.map