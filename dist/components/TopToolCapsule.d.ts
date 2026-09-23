import { type ReactNode } from 'react';
import { type TopToolPlacement } from '../lib/top-tool-placement';
export interface TopToolMenuItem {
    key: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    /**
     * 一言説明（20文字前後）。帯の右端の「▾」で開く一覧パネル（ToolListPanel）でのみ出す。
     * ドロップダウン（ToolMenu）と吹き出しは従来どおり label だけ。
     */
    description?: string;
    /** 直前に区切り線を入れる（同じメニュー内で毛色の違う項目を分けるとき。先頭では無視）。 */
    separatorBefore?: boolean;
}
/**
 * その画面に紐づく設定への導線（2026-09-23 ユーザー決定）。
 * 帯（カプセル）には絶対に出さず、右端の「▾」で開く一覧パネル（ToolListPanel）の**末尾**に
 * 区切り線＋「関連する設定」見出しでまとめて出す。道具が無い画面と同じ扱い＝渡さなければ何も出ない。
 */
export interface TopToolSettingsLink {
    label: string;
    /** 一言説明（20文字前後）。道具の一覧の他の行と同じ体裁。 */
    description?: string;
    /** 遷移先。router.push で移動する（onClick を渡した場合はそちらを優先）。 */
    href?: string;
    onClick?: () => void;
}
export interface TopToolItem {
    key: string;
    label: string;
    icon: ReactNode;
    /** menuItems が無いときのクリック動作。menuItems がある場合はクリックでメニューを開閉する
     *  （onClick は無視する。両方渡さないこと）。 */
    onClick?: () => void;
    /**
     * 渡すと単発クリックの代わりにドロップダウン（ポップオーバー）を開くボタンになる
     * （CSV▾／PDF▾ のような、複数の書き出し先を持つボタン向け）。
     * Escape・外側クリックで閉じる。`aria-haspopup="menu"` を持つ。
     */
    menuItems?: TopToolMenuItem[];
    /**
     * 一言説明（20文字前後）。帯の右端の「▾」で開く一覧パネル（ToolListPanel）でのみ出す。
     * 帯のボタン自体の吹き出し（ToolTooltip）は従来どおり label を出す。
     */
    description?: string;
    /**
     * 2026-09-22 ユーザー決定: 帯（カプセル）にワンクリックで出す道具は「新規（primary の ＋）」
     * 「更新」＋あと最大3個まで。それ以外は帯に出さず、右端の「▾」で開く一覧
     * パネルからだけ実行する。'list' を指定した道具は帯に描画しない（一覧には常に全部出る）。
     * 2026-09-23 ユーザー決定: 帯・一覧の並びは常に「＋新規→更新→その他」（orderToolItems）。
     */
    placement?: TopToolPlacement;
    primary?: boolean;
    /**
     * ON/OFF のトグルボタン（商品マスタの「編集モード」）で、いま ON であることを示す。
     * アンバーで点灯し `aria-pressed` を持つ（primary との併用は想定しない）。
     */
    active?: boolean;
    disabled?: boolean;
    /** このボタンの前に区切り線を入れる（グループ分け）。 */
    separatorBefore?: boolean;
    status?: 'idle' | 'progress' | 'done' | 'failed';
    /** 非同期ジョブの進捗（0-100）。指定するとボタン下辺に 2px の進捗バーを出す。 */
    progressPercent?: number | null;
    /** 進行中アニメの種類。'paper'（PDF・印刷）は紙が上下する小さめの振れ幅にする。 */
    progressMotion?: 'default' | 'paper';
    /** status="done" のときの右上バッジに出す件数（例: CSVダウンロード件数）。 */
    doneCount?: number;
    /** status="failed" のときにツールチップへ出す理由。 */
    statusMessage?: string;
    /** disabled=true のときにツールチップへ出す理由（例:「出荷作業中でのみ利用できます」）。 */
    disabledReason?: string;
    /** status バッジ自体をクリックしたときの処理（ダウンロード一覧を開く等）。渡さなければボタン本体の onClick を使う。 */
    onStatusClick?: () => void;
}
export declare function TopToolCapsule({ ariaLabel, items, settingsLinks, variant, dataTour, listPanel, maxBarItems, }: {
    ariaLabel: string;
    items: TopToolItem[];
    /**
     * その画面に紐づく設定への導線（2026-09-23 ユーザー決定）。帯には出さず、「▾」一覧の末尾に
     * 「関連する設定」としてまとめて出す。無い画面では何も出ない。
     */
    settingsLinks?: TopToolSettingsLink[];
    variant?: 'normal' | 'compact';
    dataTour?: string;
    /** 帯の右端に「▾」（全ツールの縦一覧）を出すか。既定 true。 */
    listPanel?: boolean;
    /** 帯に出す道具の上限。既定 5（新規＋更新＋3）。超えた分は一覧パネルのみへ回す。 */
    maxBarItems?: number;
}): import("react").JSX.Element;
//# sourceMappingURL=TopToolCapsule.d.ts.map