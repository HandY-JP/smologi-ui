'use client';
// トップバー第1行の「入りきらない」を吸収する実測フック（AdminTopBar / CustomerTopBar 共用）。
//
// 2026-09-22 のお客様画面載せ替えで、管理画面（AdminTopBar）に閉じていた内部フックを
// そのままここへ移した（**ロジックは 1 行も変えていない**。import 元が変わっただけ）。
// お客様画面のトップバーも「道具バー（左）／工程セグメント＋検索ピル（右）」という
// 同じ第1行の構造になったため、同じ吸収規則（検索ピルを 520→360px／それでも入らなければ
// 工程を第2行へ）を 2 つのバーで共有する。
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_TOP_BAR_FIT, type TopBarFit } from './app-chrome';

// 本番崩れ修正（2026-09-14・Opus 実物レビュー）: 第1行の「道具バー＋工程セグメント＋検索ピル」の
// 必要幅が実際の描画幅を超えると、flex-shrink-0 同士（右側グループ・左側の道具バー）は縮まず
// 工程セグメントが道具バーへ重なって隠れていた。ここで第1行の実際の描画幅（ResizeObserver 実測）
// から必要幅を計算し、(1) 検索ピルを 520px→360px まで縮める、(2) それでも入らなければ工程を
// 第2行へ回す、の2段階で吸収する。
const PILL_MIN_PX = 360;
const PILL_MAX_PX = 520;
const ROW_GAP_PX = 12; // Tailwind gap-3（右側グループ内の工程/ピル間）
// 道具バー（LEADING スロット）の右端から右側グループまでの間隔。道具バーの mr-3（12px、
// 中身が空でないときだけ付く）＋ 第1行自体の gap-3（12px、左側グループ⇔右側グループ）。
// 入荷・出荷とも道具バーは必ず何か描画する（最低でも「更新」）ため常時 24px として扱う。
const TOOLS_TO_RIGHT_GAP_PX = 24;
// 工程を第2行から第1行へ戻すときのヒステリシス余白。ぴったりの幅で戻す→また溢れる→戻す…の
// 往復（ジッタ）を防ぐ（src/lib/topbar-compaction.ts の畳み判定と同じ考え方）。
const ROW1_HYSTERESIS_PX = 40;

export function useTopBarFit(setTopBarFit: React.Dispatch<React.SetStateAction<TopBarFit>>) {
  const rowRef = useRef<HTMLDivElement>(null);
  // 本番崩れ修正: 当初は左側グループ（flex-1 のラッパー）を測っていたが、flex-1 は
  // 「中身の実サイズ」ではなく「割り当てられた残り幅」を返す（＝右側グループの幅を逆算した
  // 自己参照値になり、必要幅の計算が破綻していた）。道具バー本体（LEADING スロット、
  // flex-shrink-0）を直接測る。
  const toolsSlotRef = useRef<HTMLDivElement>(null);
  const centerSlotRef = useRef<HTMLDivElement>(null);
  const [rowContentWidth, setRowContentWidth] = useState(0);
  const [toolsWidth, setToolsWidth] = useState(0);
  const [centerWidth, setCenterWidth] = useState(0);
  // 出荷確定・出荷済みタブ（ShipmentActionsSidebar のレール）が開いているときだけ、
  // --chrome-left-panel-width が #app-main の margin-left と、トップバー内の左側グループの
  // margin-left の両方に効き、二重にオフセットされる（AdminTopBar は #app-main の内側にいる
  // ため #app-main 側だけで十分なはずが、旧実装のレイアウト内マージンが残っていた）。
  // 実測で吸収する: 道具バー本体の左端が「行の中身が本来始まる位置」からどれだけ余分に
  // ズレているかを直接測り、必要幅の計算に加える（原因が何であっても実際のズレをそのまま拾える）。
  const [toolsLeftExtraOffset, setToolsLeftExtraOffset] = useState(0);
  // 工程が第2行へ回った直後は第1行の中央スロットが空になり実測できなくなるため、
  // 直近の実測値を覚えておいて「戻せるか」の判定に使う（工程の幅はタブが変わっても
  // 概ね安定しているため、多少古い値でも実害はない）。
  const lastKnownCenterWidthRef = useRef(0);
  const [processInRow2, setProcessInRow2] = useState(false);

  // ResizeObserver の contentRect は padding を除いた「中身」の幅。初回の同期読み取りは
  // getBoundingClientRect（border-box、padding を含む）だと値がズレるため、同じ意味の値に揃える
  // （padding の無い要素では両者は一致するので実害はないが、row（pl/pr を持つ）では必須）。
  const measureContentWidth = (el: HTMLElement) => {
    const cs = getComputedStyle(el);
    return el.clientWidth - parseFloat(cs.paddingLeft || '0') - parseFloat(cs.paddingRight || '0');
  };

  // 3つとも同じパターン。道具バー・工程セグメントはページ側（兄弟コンポーネント）が portal で
  // 流し込む中身のため、(a) AdminTopBar 自身の初回コミット時点ではまだ空（幅0）で読めてしまう、
  // (b) タブ切替で道具バーのボタン数が変わる（例: 出荷依頼中だけ「＋伝票用受注」が増える）等、
  // portal 先の中身が入れ替わる。ResizeObserver 単体（＋マウント時の同期読み取り）だと、
  // 「初回は0のまま」「タブ切替後の幅変化を拾えない」の両方が実機で確認できたため、
  // ResizeObserver に加えて (1) MutationObserver（portal 先の子要素の増減を直接検知）と
  // (2) 軽量な定期ポーリング（前2つが何らかの理由で取りこぼしても最終的に必ず追従する保険）を
  // 三重に重ねる。3つとも同じ setWidth を呼ぶだけなので、同じ値が続く限り React 側の
  // setState は実質ノーオップ（Object.is 比較で再レンダーされない）。
  function useSlotWidth(ref: React.RefObject<HTMLElement | null>, setWidth: (w: number) => void) {
    useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const measure = () => setWidth(measureContentWidth(el));
      measure();
      const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
      ro?.observe(el);
      const mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(measure) : null;
      mo?.observe(el, { childList: true, subtree: true, characterData: true });
      const intervalId = window.setInterval(measure, 400);
      return () => {
        ro?.disconnect();
        mo?.disconnect();
        window.clearInterval(intervalId);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  }

  useSlotWidth(rowRef, setRowContentWidth);
  useSlotWidth(toolsSlotRef, setToolsWidth);
  useSlotWidth(centerSlotRef, setCenterWidth);

  useEffect(() => {
    const measureOffset = () => {
      const rowEl = rowRef.current;
      const toolsEl = toolsSlotRef.current;
      if (!rowEl || !toolsEl) return;
      const rowPaddingLeft = parseFloat(getComputedStyle(rowEl).paddingLeft || '0');
      const contentLeft = rowEl.getBoundingClientRect().left + rowPaddingLeft;
      const extra = Math.max(0, toolsEl.getBoundingClientRect().left - contentLeft);
      setToolsLeftExtraOffset(extra);
    };
    measureOffset();
    const intervalId = window.setInterval(measureOffset, 400);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measureOffset) : null;
    if (rowRef.current) ro?.observe(rowRef.current);
    return () => { window.clearInterval(intervalId); ro?.disconnect(); };
  }, []);

  // 中央スロット（工程）は「一度でも実測できたか」を state で持つ（ref だけだと変化しても
  // 再レンダーされず、下の判定 effect が古い centerWidth=0 のまま計算してしまう）。
  // 初回描画は tools/row の ResizeObserver 実測より前に center の実測が終わっていないことがあり、
  // その一瞬だけ「工程の幅は0」という誤った前提で必要幅を計算すると、検索ピルが実際より
  // 広く（既定の clamp 上限まで）確定してしまい、後から centerWidth が届いても解消されない
  // ケースがあった（実機で確認：pillWidthPx が 520 に固定されたまま、道具バーへ工程が重なる）。
  // 一度も工程を実測していない（＝ processInRow2 が確定済みでもない）うちは、判定・確定の
  // どちらも見送り、既定の TopBarFit（ページ側の安全な clamp フォールバック）のままにする。
  const [hasMeasuredCenter, setHasMeasuredCenter] = useState(false);
  useEffect(() => {
    if (centerWidth > 0) {
      lastKnownCenterWidthRef.current = centerWidth;
      setHasMeasuredCenter(true);
    }
  }, [centerWidth]);

  const canDecide = rowContentWidth > 0 && toolsWidth > 0 && (hasMeasuredCenter || processInRow2);

  useEffect(() => {
    if (!canDecide) return; // 計測前は判定しない（既定どおり第1行のまま）。
    const processWidth = centerWidth > 0 ? centerWidth : lastKnownCenterWidthRef.current;
    const availableForRight = rowContentWidth - toolsLeftExtraOffset - toolsWidth - TOOLS_TO_RIGHT_GAP_PX;
    const fitsWithMinPill = availableForRight >= processWidth + ROW_GAP_PX + PILL_MIN_PX;
    const fitsWithMaxPillPlusMargin = availableForRight >= processWidth + ROW_GAP_PX + PILL_MAX_PX + ROW1_HYSTERESIS_PX;
    setProcessInRow2((prev) => {
      if (!prev && !fitsWithMinPill) return true;
      if (prev && fitsWithMaxPillPlusMargin) return false;
      return prev;
    });
  }, [canDecide, rowContentWidth, toolsWidth, toolsLeftExtraOffset, centerWidth]);

  // 一度でも確定できたか。商品マスタ（ProductsView）は畳み時にページ側が道具バー・工程の
  // portal をやめる（一覧コンテナがスクローラーなのでトップバー自体は画面に残るため）。
  // その瞬間 toolsWidth/centerWidth が 0 に落ちて canDecide が false になるが、ここで
  // DEFAULT（pillWidthPx=null）へ戻してしまうと、畳み時の浮遊カプセル側が通常時と同じ
  // 検索ピル幅を再現できなくなる。一度確定した後は直近の値を保つ（行幅が変われば
  // ResizeObserver がまた測り直すので、古い値のまま固まることはない）。
  const hasDecidedOnceRef = useRef(false);

  useEffect(() => {
    if (!canDecide) {
      if (!hasDecidedOnceRef.current) setTopBarFit(DEFAULT_TOP_BAR_FIT);
      return;
    }
    hasDecidedOnceRef.current = true;
    const availableForRight = rowContentWidth - toolsLeftExtraOffset - toolsWidth - TOOLS_TO_RIGHT_GAP_PX;
    const processWidth = centerWidth > 0 ? centerWidth : lastKnownCenterWidthRef.current;
    const pillBudget = processInRow2 ? availableForRight : availableForRight - processWidth - ROW_GAP_PX;
    const pillWidthPx = Math.round(Math.max(PILL_MIN_PX, Math.min(PILL_MAX_PX, pillBudget)));
    setTopBarFit({ pillWidthPx, processInRow2 });
  }, [canDecide, rowContentWidth, toolsWidth, toolsLeftExtraOffset, centerWidth, processInRow2, setTopBarFit]);

  return { rowRef, toolsSlotRef, centerSlotRef };
}

