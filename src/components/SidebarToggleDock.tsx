'use client';
import type { HTMLAttributes, ReactNode } from 'react';
import { SidebarNewDot } from './SidebarNewDot';
import { WorkspaceSwitch } from './WorkspaceSwitch';
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
export function SidebarToggleDock({
  collapsed,
  persistedCollapsed,
  onToggle,
  hoverHandlers,
  hasNews = false,
  newsReason,
  home,
  workspaceSwitch,
  allPages,
  renderLink,
  activeClassName = 'sb-nav-active !shadow-none',
  newDotClassName,
}: {
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
}) {
  // collapsed は見た目の状態なので、ピーク（一時展開）中は false ＝ドットを出さない
  // （展開中はサイドバーの各行のドットが見えているため）。
  const showNewsDot = hasNews && collapsed;
  const base = persistedCollapsed ? 'サイドバーを開く' : 'サイドバーを閉じる';
  const newsDotReason = newsReason ?? '要対応あり';
  const label = showNewsDot ? `${base}（${newsDotReason}）` : base;
  const hint = persistedCollapsed
    ? 'サイドバーを開く（マウスを重ねると一時的に表示）'
    : 'サイドバーを折りたたむ';

  return (
    <>
      <div
        // #382で折りたたみ時の白ピル背景は廃止（素のアイコン）。開閉で色が変わる分は
        // アニメで繋ぐ（パッと切り替わらないように）。
        // 折りたたみ時（collapsed）は ▶ だけ（幅2rem=32px）。浮遊カプセルの道具バーと
        // 重ならないようにするため（詳細はファイル先頭のコメント）。展開時は ▶・ホーム・すべてのページを横並び。
        //
        // ピーク用ハンドラ（hoverHandlers）は**この行（ドック全体）**に付ける。
        // 2026-09-22 まで ▶ ボタン1つにしか付いていなかったため、一時展開（ピーク）中に
        // ▶ からホーム／画面切替へマウスを動かすと「サイドバーの外へ出た」と判定されて
        // 引っ込み、アイコンを押せなかった。畳み時の中身は ▶ だけなので当たり判定は変わらない。
        {...hoverHandlers}
        className="fixed left-2 top-4 z-[70] flex h-8 flex-row items-center gap-1 rounded-md transition-colors duration-150 motion-reduce:transition-none print:hidden"
        style={
          collapsed
            ? undefined
            : {
                backgroundColor: 'var(--sb-bg)',
                // ドック幅をサイドバー幅いっぱいに広げ、右端の画面切替（ml-auto、下記）を
                // サイドバー本体の右余白（px-2 = 0.5rem、拠点セレクタ等と同じ）に揃える。
                // left-2（0.5rem）ぶんを引いた上で右にも同じ 0.5rem を残す＝差し引き 1rem。
                // 折りたたみ中（▶だけ）は広げない（ホバー領域が無駄に伸びるのを防ぐ）。
                width: 'calc(var(--sidebar-visual-width) - 1rem)',
              }
        }
      >
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={persistedCollapsed}
          aria-label={label}
          title={showNewsDot ? `${hint} / ${newsDotReason}` : hint}
          className={`relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-accent-bg)] ${
            collapsed
              // 明るいトップバーの上に素で載るので、既定の字面を gray-600 まで濃くして視認性を確保する。
              ? 'text-ink-muted hover:bg-surface-subtle hover:text-ink'
              : 'text-[var(--sb-text)] hover:bg-[var(--sb-hover)]'
          }`}
        >
          {/* パネル型アイコン＋開き方向の山括弧。閉じているときは「→（開く）」、開いているときは「←（閉じる）」。 */}
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path strokeLinecap="round" d="M9 3v18" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={persistedCollapsed ? 'M13.75 9.5 16.25 12l-2.5 2.5' : 'M16.25 9.5 13.75 12l2.5 2.5'}
            />
          </svg>
          {/* 折りたたみ中にサイドバー内のどれかに要対応があるとき、アイコン右上に重ねる。
              展開中は各項目の赤丸が見えているので出さない（冗長になるため）。
              クリック判定は邪魔しない（pointer-events-none）。読み上げはボタンの aria-label に含める。 */}
          {showNewsDot && <SidebarNewDot placement="corner" label={null} ringColor="#ffffff" colorClassName={newDotClassName} />}
        </button>
        {/* ホーム・画面切替は**展開中だけ**出す（ピーク中も展開扱い）。
            折りたたみ中に出すと、本文の上へ浮く道具バーのカプセルと重なるため（2026-09-15 修正）。 */}
        {!collapsed && (
          <>
            {home && (
              (() => {
                const linkProps: SidebarDockLinkProps = {
                  href: home.href,
                  'aria-label': 'ダッシュボード',
                  'aria-current': home.active ? 'page' : undefined,
                  title: home.dot && home.dotTitle ? `ダッシュボード（${home.dotTitle}）` : 'ダッシュボード',
                  onMouseEnter: () => home.intent?.enter(home.href),
                  onMouseLeave: () => home.intent?.leave(home.href),
                  onFocus: () => home.intent?.enter(home.href),
                  onBlur: () => home.intent?.leave(home.href),
                  onPointerDown: () => home.intent?.commit(home.href),
                  className: `relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-accent-bg)] ${
                    home.active ? activeClassName : 'text-[var(--sb-text)] hover:bg-[var(--sb-hover)]'
                  }`,
                  children: (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {home.dot && <SidebarNewDot placement="corner" label={null} colorClassName={newDotClassName} />}
                    </>
                  ),
                };
                return renderLink ? renderLink(linkProps) : <a {...linkProps} />;
              })()
            )}
            {/* すべてのページ（サイトマップ）。押すとサイドバーの右側に一覧のパネルが開く。 */}
            {allPages}
            {/* 倉庫画面 ⇄ お客様画面（自社）の2分割トグル。ml-auto でドックの右端まで
                右詰めにする（▶／ホーム／すべてのページ の並びは動かさない。ドック自体の幅は上のstyleで
                サイドバー幅いっぱいに広げてあるので、ml-auto の押し出し先がある）。
                折りたたみ中は出さない。2026-09-23: 以前はここも他ボタンと同じ横並びの
                延長でドックの内容量ぶんの位置に出ていたが、サイドバー右端に寄せる決定により変更。 */}
            {workspaceSwitch && (
              <div className="ml-auto flex-shrink-0">
                <WorkspaceSwitch
                  current={workspaceSwitch.current}
                  onSwitch={workspaceSwitch.onSwitch}
                  onPrefetch={workspaceSwitch.onPrefetch}
                  disabled={workspaceSwitch.disabled}
                  pendingTarget={workspaceSwitch.pendingTarget}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
