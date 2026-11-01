'use client';
import { useCallback, useEffect, useRef, useState, type SetStateAction, type PointerEvent as ReactPointerEvent, type FocusEvent as ReactFocusEvent } from 'react';
import {
  SIDEBAR_PEEK_NEAR_PX,
  distanceToSidebarPeekRegion,
  hasSidebarPeekHold,
  isInsideSidebarPeekRegion,
  isKeyboardFocusInsideSidebarPeekRegion,
  onSidebarPeekHoldChange,
  sidebarPeekRegionProps,
} from '../lib/sidebar-peek';

// サイドバー折りたたみ状態の共通フック（useSidebarCollapsed）。
// smologi の SidebarFooter.tsx / amazon-app（a85522311）と同じ挙動を共有パッケージへ移したもの。
// 数値（80ms の動き・peek を閉じる遅延 250/80ms・SIDEBAR_TOGGLE_INSET）は変えないこと。

/** 既定の保存キー（Smologi / Seller と同じ値。アプリごとに分けたいときは options.storageKey）。 */
export const DEFAULT_SIDEBAR_STORAGE_KEY = 'handy-sidebar-collapsed-v1';
const SIDEBAR_COLLAPSED_EVENT = 'handy-sidebar-collapsed-change';
// 折りたたみ中にサイドバーへマウスオーバーすると一時的に全体を表示する「ピーク」。
// 永続状態（collapsed）とは別管理で、本文の左マージン（--sidebar-width）は折りたたみ幅のまま
// サイドバーだけを最前面に重ねて広げる（本文がガタつかないようにするため）。
const SIDEBAR_PEEK_EVENT = 'handy-sidebar-peek-change';

// ピークを閉じるまでの猶予は2段階にする。どちらも「ピーク領域（<aside>／開閉ドック／左端の
// 当たり判定／そこから開くポップオーバー。lib/sidebar-peek.ts の data-sidebar-peek-region）」
// の**外**にポインターが出てから数える。
//
// - すぐ外（領域から SIDEBAR_PEEK_NEAR_PX 以内）: 250ms。
//   ドックとポップオーバーの見た目の隙間を通るだけで閉じないようにするための猶予。
// - はっきり外（それより遠い）: 80ms。
//   本文側へマウスを振ったときはすっと閉じる。
const SIDEBAR_PEEK_CLOSE_DELAY_MS = 250;
const SIDEBAR_PEEK_LEAVE_CLOSE_DELAY_MS = 80;
// 折りたたみ中にトップバーの左へ空ける余白（開閉トグルの専有幅）。globals.css の既定は 0px。
// ドックは left-2(8px) + ボタン32px = 40px に余白を足して 3.5rem(56px)。
export const SIDEBAR_TOGGLE_INSET = '3.5rem';

// 開閉アニメーションの体系（開く／閉じる／ピークで揃える）。尺は smologi と同じ 80ms に統一する。
// Tailwind の JIT はソース中の**リテラル**しか拾えないので、必ず文字列リテラルで書くこと
// （テンプレートリテラルで組み立てるとクラスが生成されない）。
const SIDEBAR_OPEN_MOTION = 'duration-[80ms] ease-out';
const SIDEBAR_CLOSE_MOTION = 'duration-[80ms] ease-in';

/**
 * ホバーできる入力機器か（マウス／トラックパッド）。
 * タッチ端末では一時展開（ピーク）を無効にし、クリック（タップ）だけで開閉させる。
 */
function canHoverPeek() {
  if (typeof window === 'undefined') return false;
  if (typeof window.matchMedia !== 'function') return true;
  try {
    return window.matchMedia('(hover: hover)').matches;
  } catch {
    return true;
  }
}

export function useSidebarCollapsed(
  expandedWidth = '14rem',
  collapsedWidth = '3.5rem',
  options: { storageKey?: string; syncDockInset?: boolean } = {},
) {
  const storageKey = options.storageKey ?? DEFAULT_SIDEBAR_STORAGE_KEY;
  const syncDockInset = options.syncDockInset ?? false;
  // collapsed = ユーザーが選んだ永続状態。peek = ホバー中の一時展開。
  const [collapsed, setCollapsed] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [peek, setPeek] = useState(false);
  const pointerInsideRef = useRef(false);
  const pointerDownInsideRef = useRef(false);
  const peekCloseTimerRef = useRef<number | null>(null);
  // 予約済みの「閉じる時刻」。より早い時刻の予約だけが上書きする（＝常に最短の猶予が勝つ）。
  const peekCloseDeadlineRef = useRef(Number.POSITIVE_INFINITY);
  // 最後に観測したポインター座標。タイマーが起きた時点で「まだ領域の中か」を測り直すのに使う
  // （pointerenter/leave だけだと、要素をまたいだ瞬間に外扱いされてしまうため）。
  const peekPointerRef = useRef<{ x: number; y: number } | null>(null);
  // サイドバー内のボタンで折りたたんだ直後、同じポインター位置を
  // hover として拾い直して即座に再展開しないよう、離脱までピークを抑止する。
  const peekSuppressedUntilPointerLeaveRef = useRef(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        setCollapsed(window.localStorage.getItem(storageKey) === '1');
      } catch {
        // ignore
      } finally {
        setStorageReady(true);
      }
    }, 0);
    const onChanged = (event: Event) => {
      const detail = (event as CustomEvent<boolean>).detail;
      if (typeof detail === 'boolean') setCollapsed(detail);
    };
    const onPeek = (event: Event) => {
      const detail = (event as CustomEvent<boolean>).detail;
      if (typeof detail === 'boolean') setPeek(detail);
    };
    window.addEventListener(SIDEBAR_COLLAPSED_EVENT, onChanged);
    window.addEventListener(SIDEBAR_PEEK_EVENT, onPeek);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, onChanged);
      window.removeEventListener(SIDEBAR_PEEK_EVENT, onPeek);
    };
  }, [storageKey]);

  // 本文マージン用の幅は永続状態に従う（ピーク中もずらさない＝サイドバーが重なる）。
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? collapsedWidth : expandedWidth);
    // 折りたたみ中は左上に開閉トグルだけが残る。トップバーのタブ列と重ならないよう、
    // その専有ぶんを CSS 変数で配り、トップバー側が左 padding として実際に空ける
    // （重ね順で誤魔化さず、レイアウトで場所を確保する）。ピーク中は動かさない
    // ＝ホバーのたびにタブ列が横に飛ぶのを防ぐため、永続状態だけを見る。
    document.documentElement.style.setProperty('--sidebar-toggle-inset', collapsed ? SIDEBAR_TOGGLE_INSET : '0px');
    if (!storageReady) return;
    try {
      window.localStorage.setItem(storageKey, collapsed ? '1' : '0');
    } catch {
      // ignore
    }
  }, [collapsed, collapsedWidth, expandedWidth, storageKey, storageReady]);

  const displayCollapsed = collapsed && !peek;
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-visual-width', displayCollapsed ? collapsedWidth : expandedWidth);
    // 畳み時に本文の上へ浮くカプセルが左上の開閉ドックと重ならないための専有幅（smologi の --sidebar-dock-inset）。
    // --sidebar-toggle-inset と違い、ピーク中は 0。options.syncDockInset を付けたアプリだけが受け取る。
    if (syncDockInset) {
      document.documentElement.style.setProperty('--sidebar-dock-inset', displayCollapsed ? SIDEBAR_TOGGLE_INSET : '0px');
    }
  }, [collapsedWidth, displayCollapsed, expandedWidth, syncDockInset]);

  const updateCollapsed = useCallback((next: SetStateAction<boolean>) => {
    setCollapsed((prev) => {
      const value = typeof next === 'function' ? (next as (value: boolean) => boolean)(prev) : next;
      peekSuppressedUntilPointerLeaveRef.current = value && pointerInsideRef.current;
      window.setTimeout(() => {
        if (value) {
          window.dispatchEvent(new CustomEvent(SIDEBAR_PEEK_EVENT, { detail: false }));
        }
        window.dispatchEvent(new CustomEvent(SIDEBAR_COLLAPSED_EVENT, { detail: value }));
      }, 0);
      return value;
    });
  }, []);

  // ピークは全インスタンス（サイドバー本体＋フッター）で同期したいのでイベントで配る。
  const updatePeek = useCallback((value: boolean) => {
    window.dispatchEvent(new CustomEvent(SIDEBAR_PEEK_EVENT, { detail: value }));
  }, []);

  const cancelPeekClose = useCallback(() => {
    peekCloseDeadlineRef.current = Number.POSITIVE_INFINITY;
    if (peekCloseTimerRef.current === null) return;
    window.clearTimeout(peekCloseTimerRef.current);
    peekCloseTimerRef.current = null;
  }, []);

  // 「まだ開けておくべきか」の一本化した判定。閉じるのはこれが false のときだけ。
  // ポインター・フォーカスが**どれか1つのピーク領域**（<aside>／開閉ドック／左端の当たり判定／
  // そこから開くポップオーバー）にあるか、明示的な保持（ドロワーを開いている等）があれば開いたまま。
  const shouldKeepPeekOpen = useCallback(() => {
    if (pointerDownInsideRef.current) return true;
    // ポップオーバーやアカウントメニューを開いている間は、ポインターがどこにあっても閉じない。
    if (hasSidebarPeekHold()) return true;
    // キーボードで Tab 移動してきたとき（サイドバー内・ドック・ポップオーバーのどれでも）。
    // マウスでリンクを押した直後に残るフォーカスは対象外（:focus-visible で見分ける）。
    if (isKeyboardFocusInsideSidebarPeekRegion()) return true;
    const point = peekPointerRef.current;
    if (point && distanceToSidebarPeekRegion(point.x, point.y) === 0) return true;
    return pointerInsideRef.current;
  }, []);

  // 開くのは即時。閉じかけ（猶予タイマー）は必ず取り消してから開く。
  const openPeekIfCollapsed = useCallback(() => {
    cancelPeekClose();
    if (collapsed && !peekSuppressedUntilPointerLeaveRef.current) updatePeek(true);
  }, [cancelPeekClose, collapsed, updatePeek]);

  // ホバー由来の一時展開。タッチ端末（hover 非対応）では何もしない＝タップ操作を壊さない。
  const openPeekOnHover = useCallback(() => {
    if (!canHoverPeek()) return;
    openPeekIfCollapsed();
  }, [openPeekIfCollapsed]);

  useEffect(() => cancelPeekClose, [cancelPeekClose]);

  // 閉じるのは少し待ってから。ドック（サイドバー外の別要素）とサイドバー本体の行き来や、
  // portal で開くポップオーバーとの隙間で一瞬ポインターが抜ける経路でも閉じないようにするため。
  // 予約は常に「最も早い時刻」が勝つ（領域のすぐ外→遠くへ抜けたら短い猶予へ切り替わる）。
  const closePeekWhenIdle = useCallback((delay = SIDEBAR_PEEK_CLOSE_DELAY_MS) => {
    if (pointerDownInsideRef.current) return;
    const deadline = Date.now() + delay;
    if (peekCloseTimerRef.current !== null && peekCloseDeadlineRef.current <= deadline) return;
    cancelPeekClose();
    peekCloseDeadlineRef.current = deadline;
    peekCloseTimerRef.current = window.setTimeout(() => {
      peekCloseTimerRef.current = null;
      peekCloseDeadlineRef.current = Number.POSITIVE_INFINITY;
      // 猶予中にサイドバー／ドック／ポップオーバーへ戻っていたら閉じない。
      if (shouldKeepPeekOpen()) return;
      updatePeek(false);
    }, delay);
  }, [cancelPeekClose, shouldKeepPeekOpen, updatePeek]);

  // ピーク中はポインターの位置そのものを見て開閉を決める（要素の出入りイベントだけに頼らない）。
  // <aside> と開閉ドックは別々の fixed 要素で親子関係が無いため、「▶ から ⋮⋮⋮ へ動かす」だけで
  // pointerleave が起き、そこで閉じてしまう問題への対処（smologi と同じ）。
  useEffect(() => {
    if (!peek) return;
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      peekPointerRef.current = { x: event.clientX, y: event.clientY };
      const distance = isInsideSidebarPeekRegion(event.target as Node | null)
        ? 0
        : distanceToSidebarPeekRegion(event.clientX, event.clientY);
      pointerInsideRef.current = distance === 0;
      if (distance === 0) {
        cancelPeekClose();
        return;
      }
      closePeekWhenIdle(
        distance > SIDEBAR_PEEK_NEAR_PX
          ? SIDEBAR_PEEK_LEAVE_CLOSE_DELAY_MS
          : SIDEBAR_PEEK_CLOSE_DELAY_MS,
      );
    };
    document.addEventListener('pointermove', onPointerMove, { capture: true, passive: true });
    return () => {
      document.removeEventListener('pointermove', onPointerMove, { capture: true });
    };
  }, [peek, cancelPeekClose, closePeekWhenIdle]);

  // 保持（ドロワー・ポップオーバー）が外れた瞬間に閉じ判定をやり直す。
  // 外れた時点でポインターが領域の外なら、通常どおり猶予つきで閉じる。
  useEffect(() => {
    if (!peek) return;
    return onSidebarPeekHoldChange(() => {
      if (hasSidebarPeekHold()) {
        cancelPeekClose();
        return;
      }
      closePeekWhenIdle();
    });
  }, [peek, cancelPeekClose, closePeekWhenIdle]);

  useEffect(() => {
    const releasePointer = () => {
      pointerDownInsideRef.current = false;
      if (!shouldKeepPeekOpen()) closePeekWhenIdle();
    };
    window.addEventListener('pointerup', releasePointer);
    window.addEventListener('pointercancel', releasePointer);
    window.addEventListener('mouseup', releasePointer);
    return () => {
      window.removeEventListener('pointerup', releasePointer);
      window.removeEventListener('pointercancel', releasePointer);
      window.removeEventListener('mouseup', releasePointer);
    };
  }, [closePeekWhenIdle, shouldKeepPeekOpen]);

  // サイドバー <aside>・開閉トグルのドックにそのまま spread するピーク用ハンドラ。
  // - data-sidebar-peek-region が付くので、spread した要素は自動的に「ピーク領域」になる
  //   （＝そこにポインター・フォーカスがある限り閉じない。領域どうしは DOM 上で別々でよい）。
  // - 開く（hover/フォーカス進入）は折りたたみ中のみ・即時。タッチ操作では開かない。
  // - 閉じる（離脱/フォーカス離脱）は猶予つき。クリック中のリンク対象がずれないよう押下中は保留する。
  // - onFocus/onBlur でキーボード操作でもラベルが読めるようにする。
  const peekHandlers = {
    ...sidebarPeekRegionProps,
    onPointerEnter: (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType === 'touch') return;
      pointerInsideRef.current = true;
      openPeekOnHover();
    },
    onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType === 'touch') return;
      // 離脱した座標を覚えておく（猶予タイマーが起きた時点で領域内かを測り直すため）。
      peekPointerRef.current = { x: event.clientX, y: event.clientY };
      pointerInsideRef.current = false;
      peekSuppressedUntilPointerLeaveRef.current = false;
      // 隣のピーク領域（ドック・ポップオーバー）へ移っただけなら、判定側が開いたままにする。
      closePeekWhenIdle();
    },
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType === 'touch') return;
      pointerDownInsideRef.current = true;
      openPeekOnHover();
    },
    onMouseEnter: () => {
      pointerInsideRef.current = true;
      openPeekOnHover();
    },
    onMouseLeave: () => {
      pointerInsideRef.current = false;
      peekSuppressedUntilPointerLeaveRef.current = false;
      closePeekWhenIdle();
    },
    onMouseDown: () => {
      pointerDownInsideRef.current = true;
      openPeekOnHover();
    },
    onFocus: () => { openPeekIfCollapsed(); },
    onBlur: (event: ReactFocusEvent<HTMLElement>) => {
      // 子要素間のフォーカス移動では閉じない（aside の外へ出たときだけ閉じる）
      const next = event.relatedTarget;
      if (next && event.currentTarget.contains(next)) return;
      // Tab でサイドバー → ドック → ポップオーバーと渡り歩く間も開いたままにする
      // （別々の要素だが、どれもピーク領域なので1つの塊として扱う）。
      if (isInsideSidebarPeekRegion(next)) return;
      closePeekWhenIdle();
    },
  };

  // 幅（と影）のアニメーションに当てるクラス。閉じ側は displayCollapsed が true になった
  // レンダリングで評価されるので、閉じ始めから閉じ用の値が効く。
  const widthMotionClass = displayCollapsed ? SIDEBAR_CLOSE_MOTION : SIDEBAR_OPEN_MOTION;

  return {
    collapsed: displayCollapsed,
    persistedCollapsed: collapsed,
    peeking: collapsed && peek,
    widthMotionClass,
    setCollapsed: updateCollapsed,
    openPeek: openPeekIfCollapsed,
    // 画面左端の細い当たり判定用。ホバーした瞬間に開く（待ち時間は入れない）。
    // ここもピーク領域にしておく（ピーク中は pointer-events-none だが、座標での判定には効く
    // ＝開いた直後にポインターが帯の上に留まっていても「外」と判定されない）。
    edgeTriggerHandlers: {
      ...sidebarPeekRegionProps,
      onPointerEnter: openPeekOnHover,
      onFocus: openPeekIfCollapsed,
    },
    peekHandlers,
  };
}
