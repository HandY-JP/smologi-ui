import type { HTMLAttributes, ReactNode } from 'react';
import type { WorkspaceKind } from '../lib/workspace';
/** ホームリンクの先読み（hover-intent）ハンドラ群。Smologi の IntentPrefetchHandlers と同じ形。 */
export type SidebarDockIntentHandlers = {
    enter: (href: string) => void;
    leave: (href: string) => void;
    commit: (href: string) => void;
};
/** renderLink に渡す、ホームリンクへ付けるべき属性一式。 */
export type SidebarDockLinkProps = {
    href: string;
    'aria-label': string;
    'aria-current'?: 'page';
    title: string;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    onPointerDown: () => void;
    className: string;
    children: ReactNode;
};
/**
 * サイドバーの開閉トグルを載せる固定ドック（管理画面・お客様画面で共用）。
 *
 * 置き場所の決まりごと:
 * - <aside> の**外**に固定で置く。サイドバーは折りたたむと幅 0（+overflow-hidden）になるため、
 *   中に置くとトグルごと消えて開き直せなくなる。
 * - 折りたたみ中はトップバーのタブ列と横に並ぶので、トップバー側が
 *   --sidebar-toggle-inset ぶん左 padding を空ける（重ね順ではなくレイアウトで場所を確保する）。
 * - 縦位置はトップバー（h-16）の中央に合わせる。サイドバー側も同じ高さの余白を先頭に取るので、
 *   開いていても閉じていてもアイコンの位置は動かない。
 *
 * 見た目:
 * - 展開中はサイドバーの上に載るのでサイドバーの配色（--sb-bg / --sb-text）。
 * - 折りたたみ中は枠なしの素のアイコン（白ピル・影・リングは出さない）。検索アイコンと同じ
 *   ghost ボタンの流儀で、ホバーのときだけ薄い背景を出して押せると分かるようにする。
 * - ボタンは ▶（開閉）／ホーム（ダッシュボードへ）／すべてのページの3つ・常にこの順（DOM順）。
 *   展開中（ホバーでの一時展開＝ピーク中も含む）は横並び（flex-row）で3つとも出す。
 *   ホームは `home` が渡されたときだけ出す（権限・契約でダッシュボードが無い人には出さない）。
 *   （?（ヘルプ）ボタンは 2026-10 に廃止した。質問の入口は AI チャット（スージー）に一本化。
 *   その位置にホームを置き、サイドバーの項目一覧からはダッシュボードを外した。）
 *   （🔔 通知ベルは 2026-09-22 に廃止した。詳細は下の「通知ベルの廃止」を参照。）
 *   **折りたたみ中は ▶（開閉）だけにする**（2026-09-15 本番不具合の修正）。
 *   経緯: 当時4つあったボタンを縦積み（#456）→ 2列×2行（#516）と並びを変えてきたが、どちらも
 *   左上を 68〜140px 占有するため、畳み時に本文の上へ浮く道具バーのカプセル
 *   （FloatingGlassDock の gf-left）と重なってアイコンがぐちゃぐちゃになる不具合が本番で出た。
 *   折りたたみ中に左上へ常駐させるのは「サイドバーを開き直す ▶」だけで十分ため、
 *   ドックの専有幅を 1 ボタンぶん（SIDEBAR_TOGGLE_INSET = 3.5rem）まで戻して重なりを断つ。
 *   ▶ ボタンの位置（left-2 top-4）はどの並びでも変わらないので、ホバーでピークが開いて
 *   横並びに切り替わってもクリック事故は起きない。ホバー（peek）ハンドラはドックの
 *   **外枠 div** に付ける（畳み時の中身は ▶ だけなので当たり判定は ▶ の32pxと変わらず、
 *   ピーク中は3つ＋画面切替ぶんに自然に広がる。2026-09-22 の修正。以前は ▶ ボタンだけに
 *   付いていたため、ピーク中に隣のアイコンへマウスを動かすとサイドバーが引っ込んでいた）。
 *
 * アプリ切替（2026-10）: ドックの ⋮⋮⋮ は廃止した。ダッシュボードの一番上のアプリ列
 *   （DashboardAppRow）へ移した。
 *
 * 通知ベルの廃止（2026-09-22）:
 * - 🔔 とそのドロワー（NotificationDrawer）は廃止した。7/23 の通知見直し以降ほとんど何も出ず
 *   （直近30日は job-failed 6件・全未読）、逆に 6〜8 月は溢れて誰も読まなかった＝
 *   「1か所に全部集める」やり方が機能しなかったため。
 * - 代わりに **サイドバーの項目 → 画面のタブ／区画 → 該当行** と段階的にたどる「要対応ドット」で
 *   知らせる。このドックの ▶ に出る集約ドット（hasNews）はその第1段で、
 *   「サイドバーのどれかに要対応がある」だけを示す。内訳は newsReason（ホバーの title）。
 * - サーバーの Notification テーブル自体は残す（モバイルアプリの受信トレイ・Web Push・
 *   メール送信の記録を兼ねているため）。詳細は /api/notifications のコメント。
 *
 * ダークモード切替（☾/☀）はこのドックには置かない。プロフィールメニュー
 * （SidebarAccountMenu、ログアウトの直前）に統合済み（2026-09）。理由は2つ:
 * 開閉ドックはボタンの出し消しで隣のボタン位置が動くと誤爆しやすい（#455の教訓）のに対し、
 * メニュー内は縦一列で追加しても他項目の位置が動くだけで誤爆しにくいこと。加えて折りたたみ中
 * （collapsed）はドックが唯一の導線になってしまうが、プロフィールメニューは折りたたみ中でも
 * サイドバー最下部から常に開けるため、導線を一本化できる。
 */
export declare function SidebarToggleDock({ collapsed, persistedCollapsed, onToggle, hoverHandlers, hasNews, newsReason, home, workspaceSwitch, allPages, renderLink, activeClassName, newDotClassName, }: {
    /** 見た目の状態（折りたたみ中でも一時展開＝ピーク中は false）。 */
    collapsed: boolean;
    /** 保存された状態。クリックで切り替わるのはこちら。 */
    persistedCollapsed: boolean;
    onToggle: () => void;
    /**
     * ホバーでの一時展開（ピーク）用ハンドラ。useSidebarCollapsed の peekHandlers を渡す。
     * ドックの外枠 div に spread する（2026-09-22 まで ▶ ボタンに直接 spread していた名残で、
     * 要素を限定しない HTMLAttributes<HTMLElement> のままにしてある）。
     * これを spread した要素は data-sidebar-peek-region が付いてピーク領域になる
     * （ポインター・フォーカスがこの中にある限りサイドバーは閉じない）。
     */
    hoverHandlers?: HTMLAttributes<HTMLElement>;
    /**
     * サイドバーのどれかの項目に新着があるか。
     * 赤丸を出すのは「メニューが見えていない」＝折りたたみ中だけ。展開中（ホバーでの一時展開も含む）は
     * 各項目の赤丸が見えているので、トグル側に出すと冗長になる。
     */
    hasNews?: boolean;
    /**
     * hasNews の内訳（ホバーの title に出す一文。例「要対応: 仕入先からの連絡 2件」）。
     * 点の意味は「要対応があるか」だけなので、件数はこの title でだけ見せる。
     */
    newsReason?: string;
    /**
     * ホーム（ダッシュボードへ移動する家アイコン）。▶ の右隣に出す（展開中のみ）。
     * 出す条件（権限・契約）は呼び出し側が持ち、出さないときは undefined を渡す。
     */
    home?: {
        href: string;
        /** ダッシュボードを開いているか（選択中の見た目にする）。 */
        active: boolean;
        /** 要対応ドット（ダッシュボード項目にあったもの）。 */
        dot?: boolean;
        dotTitle?: string;
        /** 先読みの hover-intent。 */
        intent?: SidebarDockIntentHandlers;
    };
    /**
     * 「倉庫画面 ⇄ お客様画面（自社）」の2分割トグル（ドックの右端）。
     * 出す条件（両方の権限を持つ社内ユーザーか）と実際の切替処理は呼び出し側が持ち、
     * 出さないときは undefined を渡す。折りたたみ中は ▶ だけにする決まりなので、
     * 渡されていてもここでは描画しない。
     */
    workspaceSwitch?: {
        current: WorkspaceKind;
        onSwitch: (target: WorkspaceKind) => void;
        /** ホバー・フォーカスでの先読み（use-workspace-switch が返す）。 */
        onPrefetch?: (target: WorkspaceKind) => void;
        disabled?: boolean;
        /** 切り替え中の行き先。押した瞬間に選択側を反転させるために渡す。 */
        pendingTarget?: WorkspaceKind | null;
    };
    /**
     * 「すべてのページ」ボタン（AllPagesDockButton）。▶・ホームの右に出す（展開中のみ）。
     * 開閉の状態・パネルはアプリが持つので、ボタンごと渡す。省略すると出さない。
     */
    allPages?: ReactNode;
    /**
     * ホームリンクの差し替え（next/link 等）。省略時は <a>。
     * props には href・aria・title・イベントハンドラ・className・children が全部入っているので、そのまま展開して渡す。
     */
    renderLink?: (props: SidebarDockLinkProps) => ReactNode;
    /**
     * ホームが選択中のときの className。既定は 'sb-nav-active !shadow-none'（サイドバーの選択中と同じ見た目。
     * Smologi と同じ CSS クラスをアプリ側の CSS が持つ前提）。変数で代用するとダーク・お客様画面の色がずれるため、
     * アプリごとのクラス名で渡す。
     */
    activeClassName?: string;
    /** 要対応ドットの色クラスの差し替え（SidebarNewDot の colorClassName）。省略時は既定の赤。 */
    newDotClassName?: string;
}): import("react").JSX.Element;
//# sourceMappingURL=SidebarToggleDock.d.ts.map