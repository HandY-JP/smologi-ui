'use client';
// 一覧の検索を「トップバーへドッキングする検索ピル」に一本化する共通部品。
//
// これまで各一覧はメイン領域の上に常設の検索バー（SearchFilterBar）を置いていた。
// 一覧が主役の画面では、その1行がスクロールで流れて使えなくなる／初期表示が
// ごちゃつく、という2つの問題があった。ここでは商品マスタ（ProductsView）で
// 先に作った「トップバーの検索ドック」を部品化し、次の二段構えで出す:
//
//   1. 一覧ヘッダーの虫眼鏡を押す  → ピルが出て即フォーカス（発注の仕入先ヘッダーと同じ流儀）
//   2. 一覧を少しスクロールする    → ピルが自動で出る（スクロールしてから探さなくてよい）
//
// 畳む条件は「検索語が空」のときだけ。語が入っている間は何で絞られているかの
// 手掛かりが消えるので、フォーカスを外しても最上部へ戻しても畳まない
// （常時ドックの `alwaysDocked` は例外。下記の使い分けを参照）。
//
// ★ 使い分けの原則（画面ごとに勝手に変えないこと。実装は全部この1ファイルに寄せる）:
//   - 検索が唯一の主操作で、一覧の直上に他のタブ列を持たない画面（商品マスタ）＝
//     **常時ドック**（`alwaysDocked: true`）。スクロールや虫眼鏡クリックで出し入れせず、
//     ページを開いた瞬間からトップバーに検索ピルを固定で出す。一覧側には常設バーを置かない
//     （保存ビュー・絞り込みはピル右端のアイコンにする）ので、一覧の表示領域を広く保てる。
//   - 一覧を眺めるのが主で検索は時々、という画面（入荷・受注/出荷・返品・発注）＝
//     常設バーを置かず、**ヘッダーの虫眼鏡＋スクロールの二段構え**（既定）。
//     こちらは常設バーが無いぶん、語が入っている間はピルを出したままにする
//     （畳むと何で絞られているかの手掛かりが画面から消えるため）。
//
// トップバーではタブ列と場所を取り合うため、既定ではドックが出ている間はタブ列を隠す
// （globals.css の `#customer-topbar-dock:not(:empty) ~ .topbar-tabs-lane`）。
// タブ列は横スクロールコンテナの中にあり、ドックのスロットはその外側にあるので、
// 絞り込みパネルが縦に切られることもない。
// 画面が十分広い（呼び出し元が判定する）ときは `coexistWithTabs` でこの排他を解除し、
// タブ列とドックを横並びで共存させられる（globals.css の `:not(:has(.topbar-dock-coexist))` 例外）。
import {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
  type CSSProperties, type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { FilterChipsHostProvider, CollapsedFilterTriggerProvider } from './FilterPopover';
import { topbarDockSlotIds } from '../lib/topbar-slots';

/**
 * 検索バーの外（テーブルヘッダーなど）に置くアイコンにも SearchFilterBar と同じ
 * アクセント変数を配る（未定義だと color 指定が無効値になり色が付かない）。
 */
export const SEARCH_ACCENT_STYLE = {
  '--search-accent': 'var(--sb-accent-bg)',
  '--search-accent-light': 'var(--accent-subtle)',
} as CSSProperties;

const SEARCH_ICON_PATH = 'm21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z';

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
export function useTopbarSearchDock(
  value: string,
  { alwaysDocked = false, slotOverrideId }: TopbarSearchDockOptions = {},
): TopbarSearchDockController {
  const hasValue = value.length > 0;
  // ヘッダーの虫眼鏡で開いた状態。スクロール由来（pastTop）とは別に持つ。
  const [manualOpen, setManualOpen] = useState(false);
  // 一覧の直上に置いた番兵がトップバーの下へ隠れた＝一覧をスクロールした。
  const [pastTop, setPastTop] = useState(false);
  // 入力中に畳まない（最上部へ戻った瞬間にフォーカスが飛ぶ事故を防ぐ）。
  const [focused, setFocused] = useState(false);
  // 「畳んでよいか」の判定は effect の外から参照するため ref でも持つ（deps に入れると
  // フォーカスのたびに畳み判定が走ってしまう）。
  const focusedRef = useRef(false);
  // ドックの DOM は state で受ける（ref オブジェクトを controller に載せないため。
  // 載せると「描画中に ref を読んだ」と静的解析に見なされる）。
  const [dockNode, setDockNode] = useState<HTMLDivElement | null>(null);
  const [inputNode, setInputNode] = useState<HTMLInputElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  // 出したあとにフォーカスを入れるための合図（ピルは出た後でないと DOM に無い）。
  //
  // ★ 意図（虫眼鏡を押した）は ref、effect を起こすきっかけは state、と役割を分ける。
  //   合図を state だけで持って deps に inputNode を入れると、スクロールでピルが
  //   マウントし直されるたびに focus() が再発火する＝勝手にフォーカスを奪い、
  //   focused が立ったまま docked が降りず、最上部へ戻してもタブ列が戻らなくなる。
  //   ref を「1回だけ消費するフラグ」にして、inputNode の変化では発火させない。
  const focusRequestRef = useRef(false);
  const [focusRequest, setFocusRequest] = useState(0);

  const docked = alwaysDocked ? true : (manualOpen || pastTop || hasValue || focused);

  // 番兵はタブ切替・空状態でマウントし直されるので、effect ではなく callback ref で観測する。
  const observeSentinel = useCallback((node: HTMLElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setPastTop(false);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => setPastTop(!(entries[entries.length - 1]?.isIntersecting ?? true)),
      // 高さ64pxのトップバーに隠れている分は「見えていない」と扱う（バーが本文に重なるため）。
      { rootMargin: '-64px 0px 0px 0px', threshold: 0 },
    );
    observer.observe(node);
    observerRef.current = observer;
  }, []);
  useEffect(() => () => observerRef.current?.disconnect(), []);

  // お客様画面（CustomerTopBar）と admin 画面（AdminTopBar）で別スロット id を使う。
  // AdminTopBar は layout 側で <Suspense> に包まれており初回判定時にまだ居ないことがあるため、
  // 見つかるまで数フレーム再試行する（最大 ~1.5s）。
  useLayoutEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const resolve = () => {
      if (cancelled) return;
      const found = (slotOverrideId ? document.getElementById(slotOverrideId) : null)
        ?? topbarDockSlotIds()
          .map((id) => document.getElementById(id))
          .find((el): el is HTMLElement => el != null)
        ?? null;
      setSlot(found);
      if (!found && attempts < 30) {
        attempts += 1;
        window.setTimeout(resolve, 50);
      }
    };
    resolve();
    return () => { cancelled = true; };
  }, [slotOverrideId]);

  // 最上部へ戻って検索語も空なら、ヘッダーから開いた状態も解いてタブ列へ復帰する。
  // 入力中（focusedRef）は畳まない＝打っている最中にピルが消える事故を防ぐ。
  useEffect(() => {
    if (pastTop || hasValue || focusedRef.current) return;
    setManualOpen(false);
  }, [pastTop, hasValue]);

  // ピルが出た直後にフォーカスを入れる（虫眼鏡を押してそのまま打てるように）。
  // 押した回数（focusRequest）と、ピルが生えたこと（inputNode）のどちらでも起きるが、
  // 実際に focus するのは ref が立っている1回だけ。入力欄がまだ無ければフラグは
  // 立てたまま次（＝ピルがマウントされた回）へ持ち越す。
  useLayoutEffect(() => {
    if (!focusRequestRef.current || !inputNode) return;
    focusRequestRef.current = false;
    inputNode.focus();
  }, [focusRequest, inputNode]);

  const blurDock = useCallback(() => {
    const active = typeof document === 'undefined' ? null : document.activeElement;
    if (active instanceof HTMLElement && dockNode?.contains(active)) active.blur();
    // 未消化の「フォーカスを入れたい」予約も捨てる。残しておくと、後でスクロールで
    // ピルが生えた瞬間に消化されて勝手にフォーカスを奪う。
    focusRequestRef.current = false;
    focusedRef.current = false;
    setFocused(false);
  }, [dockNode]);

  // 「押したのでフォーカスを入れたい」を1回ぶんだけ予約する。
  const requestFocus = useCallback(() => {
    focusRequestRef.current = true;
    setFocusRequest((n) => n + 1);
  }, []);

  const toggleFromHeader = useCallback(() => {
    if (!docked) {
      setManualOpen(true);
      requestFocus();
      return;
    }
    // 出ている間に押されたら、入力済み・スクロール由来ならフォーカスを戻すだけ。
    if (hasValue || pastTop) {
      requestFocus();
      return;
    }
    blurDock();
    setManualOpen(false);
  }, [docked, hasValue, pastTop, blurDock, requestFocus]);

  const onFocus = useCallback(() => { focusedRef.current = true; setFocused(true); }, []);
  const onBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    focusedRef.current = false;
    setFocused(false);
    // 空のままドックから離れたら畳む（語が残っていれば手掛かりとして出したまま）。
    if (!hasValue) setManualOpen(false);
  }, [hasValue]);
  const onEscape = useCallback(() => {
    if (hasValue) return; // 入力済みなら閉じない（Esc は「空で開いた欄を閉じる」だけ）
    blurDock();
    setManualOpen(false);
  }, [hasValue, blurDock]);

  return {
    docked,
    toggleFromHeader,
    observeSentinel,
    internal: { slot, setDockNode, setInputNode, onFocus, onBlur, handlesEscape: !alwaysDocked, onEscape },
  };
}

/**
 * トップバーの検索ピル本体。ドックが出ている間だけスロットへ portal する。
 * 見た目は SearchFilterBar と同じ「1つの丸ピルの中に 検索入力｜絞り込み」構図
 * （絞り込みをピルの外に置くと、ピルの右端が閉じずに継ぎ目のように見える）。
 */
export function TopbarSearchDock({
  controller,
  value,
  onValueChange,
  onSearch,
  onCleared,
  placeholder,
  inputAriaLabel,
  loading = false,
  dirty = false,
  disabled = false,
  leadingControl,
  viewControl,
  filterControl,
  widthClass = 'w-[min(26rem,42vw)]',
  widthPx,
  coexistWithTabs = false,
  slashKeycap = false,
}: {
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
}) {
  const { docked, internal } = controller;
  const { slot, setDockNode, setInputNode, onFocus, onBlur, handlesEscape, onEscape } = internal;
  if (!slot || !docked) return null;

  const runSearch = () => { if (!disabled && !loading) onSearch(); };
  const searchTitle = loading ? '検索中' : dirty ? '変更した条件で再検索' : '検索';

  const pill = (
    // topbar-dock-fade: タブ列と入れ替わるときのフェード。ラッパーは必ず flex にする
    // （素の div は display:block になり、中のタブ／ピルが縦に積まれてバーが崩れる）。
    // topbar-dock-coexist: globals.css の `:has()` 例外にヒットさせて、タブ列を隠す排他を解除する。
    <div className={`topbar-dock-fade flex min-w-0 items-center${coexistWithTabs ? ' topbar-dock-coexist' : ''}`}>
      <div
        ref={setDockNode}
        className="flex min-w-0 items-center"
        style={SEARCH_ACCENT_STYLE}
        onFocusCapture={onFocus}
        onBlurCapture={onBlur}
        // 常設バーがある画面（handlesEscape=false）は Escape を横取りしない
        // ＝ドックはスクロールだけで出入りし、Escape は中の絞り込みパネル等に任せる。
        onKeyDown={handlesEscape ? (event) => {
          if (event.key !== 'Escape' || event.nativeEvent.isComposing) return;
          event.stopPropagation();
          onEscape();
        } : undefined}
      >
        {/* themed-search-pill: ダークで input の一括指定（背景 #0f172a）がピルの丸い面に
            四角く乗るのを防ぐフック（globals.css）。面はこのピル側だけが持つ。 */}
        <div
          style={typeof widthPx === 'number' ? { width: widthPx } : undefined}
          className={`group themed-search-pill relative flex h-11 ${widthClass} items-center rounded-full border bg-gray-50 pr-1.5 transition-colors focus-within:bg-white focus-within:ring-2 ${
            dirty
              ? 'border-amber-400 focus-within:border-amber-500 focus-within:ring-amber-500/15'
              : 'themed-search-box border-gray-300 focus-within:border-[var(--search-accent)] focus-within:ring-[var(--accent-ring)]'
          }`}
        >
          {leadingControl && (
            <>
              <div className="flex h-full shrink-0 items-center pl-3 pr-1">
                {leadingControl}
              </div>
              <span aria-hidden className="h-5 w-px shrink-0 bg-gray-300" />
            </>
          )}
          <button
            type="button"
            onClick={runSearch}
            disabled={disabled || loading}
            title={searchTitle}
            aria-label={searchTitle}
            className={`flex h-full w-10 shrink-0 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${leadingControl ? '' : 'rounded-l-full'} ${
              dirty ? 'text-amber-600' : 'text-gray-400 hover:text-[var(--search-accent)]'
            }`}
          >
            {loading ? (
              <span className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
            ) : (
              <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d={SEARCH_ICON_PATH} />
              </svg>
            )}
          </button>
          <input
            ref={setInputNode}
            type="search"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            lang="ja"
            aria-label={inputAriaLabel ?? placeholder}
            value={value}
            onChange={(event) => {
              const next = event.target.value.replace(/\r?\n/g, ' ');
              onValueChange(next);
              // 空になったらその場で「空の検索」を適用する。ブラウザ標準の × は
              // change しか起こさないので、ここで拾わないと一覧が絞られたまま残る。
              // 打ち直しの途中でも1回だけ空適用が走るが、空適用＝全件表示なので害はなく、
              // × の期待動作（押したら絞り込みが解ける）を優先する。
              if (next.length === 0 && value.length > 0) onCleared?.();
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
              event.preventDefault();
              event.stopPropagation();
              runSearch();
            }}
            placeholder={placeholder}
            className="h-full min-w-0 flex-1 border-0 bg-transparent pr-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
          {slashKeycap && (
            <kbd
              aria-hidden="true"
              className="mr-1.5 flex h-[18px] w-5 shrink-0 items-center justify-center rounded border border-gray-300 text-[11px] font-medium text-gray-400 group-focus-within:hidden"
            >
              /
            </kbd>
          )}
          {viewControl}
          {/* 適用中チップは一覧側（ヘッダーの絞り込み）が出す。ドックの絞り込みからは出さない
              ＝トップバー内にチップ行が生えてバーが二段になるのを防ぐ。 */}
          <FilterChipsHostProvider host={null}>
            <CollapsedFilterTriggerProvider collapsed>
              {filterControl}
            </CollapsedFilterTriggerProvider>
          </FilterChipsHostProvider>
        </div>
      </div>
    </div>
  );

  return createPortal(pill, slot);
}

/**
 * 一覧ヘッダーのアイコンボタン共通クラス。
 * hover は透過なしの hover:bg-gray-200（ヘッダーの bg-gray-50 に対してライトでも
 * 十分見え、globals.css のダーク上書きも効く階調）。
 * trailing に足すアイコン（更新など）もこれを使って大きさ・階調を揃える。
 */
export const LIST_HEADER_ICON_BUTTON =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--search-accent)] disabled:cursor-wait disabled:opacity-60';

/**
 * 一覧ヘッダー（テーブルの見出しセル）へ置く 虫眼鏡＋じょうご のアイコン組。
 * 虫眼鏡はトップバーのピルを開き、じょうごはその場で絞り込みパネルを開く（#386 と同じ流儀）。
 * 見出しのソートなどとは独立したクリック領域にするため、必ずボタンとして置く。
 */
export function ListHeaderSearchIcons({
  controller,
  searchLabel,
  filterControl,
  trailing,
  align = 'end',
}: {
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
}) {
  return (
    <span
      className={align === 'start' ? '-my-2 flex items-center gap-0.5' : '-my-2 ml-auto flex items-center gap-0.5'}
      style={SEARCH_ACCENT_STYLE}
    >
      <button
        type="button"
        // 押してもピルの入力からフォーカスを奪わない（奪うと blur で畳んでから
        // クリックで開き直す形になり、閉じるつもりの操作が効かなくなる）。
        onMouseDown={(event) => event.preventDefault()}
        onClick={controller.toggleFromHeader}
        aria-expanded={controller.docked}
        aria-label={searchLabel}
        title={searchLabel}
        // hover は透過なしの hover:bg-gray-200（ヘッダーの bg-gray-50 に対してライトでも
        // 十分見え、globals.css のダーク上書きも効く階調）。
        className={LIST_HEADER_ICON_BUTTON}
      >
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d={SEARCH_ICON_PATH} />
        </svg>
      </button>
      {filterControl && (
        // 畳んだ検索バーと同じ「じょうごアイコン＋適用中は赤ドット」。
        <CollapsedFilterTriggerProvider collapsed>
          {filterControl}
        </CollapsedFilterTriggerProvider>
      )}
      {trailing}
    </span>
  );
}
