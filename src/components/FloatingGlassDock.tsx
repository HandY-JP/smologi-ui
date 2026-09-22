'use client';
// トップバー再設計（2026-09）: スクロールで畳んだときに本文の上へ浮かぶ、リキッドガラスの
// 3カプセル（左=道具バー／中央=工程セグメント／右=絞り込みチップ＋検索ピル）。
// fixed 配置で document.body へ portal する（AdminTopBar 側は position を sticky⇔static で
// 切り替えるだけで高さは変えない。詳しくは AdminTopBar.tsx のコメント参照）。
// 出現/復帰は opacity・translateY の 180ms（globals.css の .sb-glass-float）。
//
// 2026-09-22 ユーザー決定「通常時と畳み時で部品のサイズを変えない」: 道具バー 42px・工程 40px・
// 検索ピル 44px ＋ 検索ピルの幅（AdminTopBar の実測 topBarFit.pillWidthPx）を通常時から
// そのまま持ち込む（高さは globals.css 側、幅はこのファイルの inline style）。
// 狭くて左右のカプセルが重なる幅でだけ、検索ピルを 320px へ縮める（collapsedTier）。
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { computeChipOverflow, type OverflowChip } from '../lib/topbar-compaction';
import { useChromeOptional, DEFAULT_TOP_BAR_FIT } from './app-chrome';
import { CollapsedFilterTriggerProvider, FilterChipsHostProvider } from './FilterPopover';
import { TopToolCapsule, type TopToolItem } from './TopToolCapsule';
import { ProcessSegment, type ProcessStage } from './ProcessSegment';

/** 検索カプセル幅の下限（px）。通常時の実測（topBarFit.pillWidthPx）が使えないときの
 *  フォールバック兼・下限として使う。2026-09-22 以降、畳んだからといってここまで縮めることはない。 */
const GLASS_PILL_MIN_PX = 320;

export interface FloatingFilterChip {
  id: string;
  /** 項目名（「入荷予定日」「検索語」など）。値だけでは何の条件か分からないので前に出す。 */
  field?: string;
  label: string;
  onRemove?: () => void;
}

// 「項目名: 値」で出す（2026-09-22 ユーザー決定。値だけだと「2026-09-15〜指定なし」のように
// 何の条件か読み取れなかった）。畳み時は幅が無いので行頭の「絞り込み」ラベルは付けない。
function FilterChipPill({ c, chipRef }: { c: FloatingFilterChip; chipRef?: (node: HTMLSpanElement | null) => void }) {
  const full = c.field ? `${c.field}: ${c.label}` : c.label;
  return (
    <span ref={chipRef} className="sb-group-chip sb-filter-mini-chip" title={full}>
      {c.field && <span className="opacity-70">{c.field}: </span>}
      {c.label}
      {c.onRemove && (
        <button type="button" onClick={c.onRemove} aria-label={`${full}の条件を解除`} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
      )}
    </span>
  );
}

/**
 * 絞り込みチップ（畳み時・独立カプセル）の溢れ計算。
 *
 * Opus レビュー指摘（重要）: 以前は表示中のチップへ hidden 属性を付けて隠していたため、
 * 一度 display:none になったチップは次の計測で幅0を返し自己矛盾的に縮み続けるバグがあった。
 * ProcessSegment の GroupChipRow と同じく、画面外の visibility:hidden な計測専用コンテナに
 * 全候補を常時描画して測り、表示側は計測結果で配列そのものを絞り込む。
 */
function MiniFilterChips({ chips }: { chips: FloatingFilterChip[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const moreMeasureRef = useRef<HTMLSpanElement | null>(null);
  const chipMeasureRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const [shownIds, setShownIds] = useState<string[] | null>(null);
  const [hiddenCount, setHiddenCount] = useState(0);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const available = el.clientWidth;
      const items: OverflowChip[] = chips.map((c) => ({
        id: c.id,
        widthPx: (chipMeasureRefs.current.get(c.id)?.getBoundingClientRect().width ?? 0) + 3,
      }));
      const moreWidth = (moreMeasureRef.current?.getBoundingClientRect().width ?? 40) + 3;
      const result = computeChipOverflow(items, available, moreWidth);
      setShownIds(result.collapsedToCount ? [] : result.shownIds);
      setHiddenCount(result.hiddenCount);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [chips]);

  if (chips.length === 0) return null;
  const shownSet = new Set(shownIds ?? chips.map((c) => c.id));
  const visibleChips = chips.filter((c) => shownSet.has(c.id));

  return (
    <div ref={containerRef} className="sb-glass sb-glass-chips" aria-label="絞り込み条件">
      {/* 計測専用（画面外・visibility:hidden）。常に全候補ぶんの実寸を持つ。
          sb-measure-layer: 親の `.sb-glass > *`（position:relative）に負けて通常フローへ
          戻らないようにする目印（globals.css。2026-09-22 の本番崩れの原因だった）。 */}
      <div aria-hidden className="sb-measure-layer pointer-events-none invisible fixed left-0 top-0 z-[-1] flex gap-1">
        {chips.map((c) => (
          <FilterChipPill key={c.id} c={c} chipRef={(node) => { if (node) chipMeasureRefs.current.set(c.id, node); else chipMeasureRefs.current.delete(c.id); }} />
        ))}
        <span ref={moreMeasureRef} className="sb-group-chip sb-group-chip-more">＋99</span>
      </div>
      {visibleChips.map((c) => <FilterChipPill key={c.id} c={c} />)}
      {hiddenCount > 0 && (
        <span className="sb-group-chip sb-group-chip-more" title={`他${hiddenCount}件の絞り込み条件`}>
          {visibleChips.length === 0 ? `絞り込み ${hiddenCount}` : `＋${hiddenCount}`}
        </span>
      )}
    </div>
  );
}

export function FloatingGlassDock({
  visible,
  tools,
  toolsAriaLabel,
  processAriaLabel,
  leadLabel,
  stages,
  currentStage,
  onSelectStage,
  historyLabel,
  onHistoryClick,
  historyActive,
  leading,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder,
  searchAriaLabel,
  searchInputRef,
  /** 実際の FilterPopover/ShipmentFilterMenu を渡す（collapsed 表示で件数バッジ付きの
   *  じょうごトリガーになる）。呼び出し側の renderXxxFilter(true) をそのまま渡せばよい。 */
  filterControl,
  filterChips = [],
  processTrailing,
}: {
  visible: boolean;
  tools: TopToolItem[];
  toolsAriaLabel: string;
  processAriaLabel: string;
  leadLabel?: string;
  stages: ProcessStage[];
  currentStage: string;
  onSelectStage: (key: string) => void;
  /** 工程カプセル末尾の「履歴」（2026-09-22 ユーザー決定）。畳んだままでも履歴へ行ける。
   *  履歴の概念が無い画面（商品マスタ）は渡さない＝何も出ない。 */
  historyLabel?: string;
  onHistoryClick?: () => void;
  historyActive?: boolean;
  /**
   * 検索カプセル左端に置く追加コントロール（例: お客様セレクタ）。
   * 「現在の1顧客」という概念が無い一覧（入荷・出荷の管理一覧は多顧客横断）では省略してよい。
   */
  leading?: ReactNode;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  searchPlaceholder: string;
  searchAriaLabel?: string;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  filterControl?: ReactNode;
  filterChips?: FloatingFilterChip[];
  /** 工程（セグメント）カプセルの中、ピル列の直後に置く追加要素（商品マスタの保存ビュー「▾」）。 */
  processTrailing?: ReactNode;
}): ReactNode {
  // 一度も畳んだことが無いページ（最上部を出たり入ったりしていない）では DOM 自体を作らない
  // （Opus レビュー指摘: 常時 portal しているとタブ順・アクセシビリティツリーが二重になる）。
  // 一度でも畳んだら、以降は opacity/translate のトランジションを保つためマウントし続ける
  // （非表示時は aria-hidden + pointer-events:none）。
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  useEffect(() => { if (visible) setHasBeenVisible(true); }, [visible]);

  // 2026-09-22 ユーザー決定「通常時と畳み時で部品のサイズを変えない」:
  // 検索ピルの幅は、通常時（AdminTopBar 第1行）とまったく同じ値を使う。
  //  - AdminTopBar の実測（useAdminTopBarFit → topBarFit.pillWidthPx）があればそれ。
  //  - ただし processInRow2（＝通常時は工程を第2行へ逃がすほど狭い）のときは、畳み時には
  //    第2行が無く工程カプセルも同じ行に並ぶため、その実測値（工程ぶんの空きを含む）は使えない。
  //    その場合と未計測のときだけ、下限値（GLASS_PILL_MIN_PX）を使う。
  // 2026-09-22 ユーザー決定: 狭いときでもピルは縮めない（tier で幅を変えない）。
  const chrome = useChromeOptional();
  const topBarFit = chrome?.topBarFit ?? DEFAULT_TOP_BAR_FIT;
  const desiredPillPx = (!topBarFit.processInRow2 && topBarFit.pillWidthPx != null)
    ? Math.max(GLASS_PILL_MIN_PX, topBarFit.pillWidthPx)
    : GLASS_PILL_MIN_PX;

  // 本番崩れ修正（2026-09-14・Opus 実物レビュー仕様）: gf-left（道具バー）／gf-right（工程＋検索）は
  // どちらも position:fixed の独立カプセルなので、狭い幅では左右の間隔が詰まって重なりうる。
  // 実際の描画位置（getBoundingClientRect）を見て、tier を 1 段ずつ上げて退避する。
  //   0 = 通常時と同じ（検索ピル＝desiredPillPx、工程は件数・見出し付き、絞り込みチップあり）
  //   1 = 工程を件数無し・詰め表示（dense）にする
  //   2 = さらに絞り込みチップのカプセルを隠す（件数は検索ピルのじょうごバッジで分かる）
  // 2026-09-22 ユーザー決定:
  //   - 旧 tier 1「検索ピルを 320px へ縮める」は廃止。畳んでもピルの幅は通常時と同じままにする
  //     （PC 幅では tier はそもそも上がらないので、実質いつも tier 0）。
  //   - 旧 tier 2 の「工程カプセルごと省略」も廃止（工程は畳み時も必ず出す）。
  const glassLeftRef = useRef<HTMLDivElement>(null);
  const glassRightRef = useRef<HTMLDivElement>(null);
  const [collapsedTier, setCollapsedTier] = useState<0 | 1 | 2>(0);
  // tier ごとの gf-right 実測幅。tier を下げると gf-right は必ず広がるので、「広がるぶん」を
  // 実測から知り、それを足しても余白が残るときだけ下げる（ヒステリシス）。固定値（旧 MARGIN*3）
  // のままだと、検索ピルの伸縮幅が 200px 近くある今は 上げ→下げ→上げ の往復になりうる。
  const rightWidthByTierRef = useRef<Partial<Record<0 | 1 | 2, number>>>({});
  useEffect(() => {
    if (!visible || typeof ResizeObserver === 'undefined') return;
    const MARGIN = 16;
    const measure = () => {
      const leftEl = glassLeftRef.current;
      const rightEl = glassRightRef.current;
      if (!leftEl || !rightEl) return;
      // 反映待ちの測定を弾く（重要）: ResizeObserver は tier 変更の再レンダーが DOM へ反映される
      // 前にも続けて発火しうる。その「古い幅」で判定すると、1 回の狭まりで tier が 2 段一気に
      // 上がったうえ、下の rightWidthByTierRef に誤った幅が記録され、戻れなくなる（実機で確認）。
      // いまの tier で検索ピルが取るはずの幅と実際の幅が食い違う間は、何もせず次の発火を待つ。
      // 検索ピルの幅は tier で変えなくなったが、desiredPillPx（通常時の実測）自体は
      // サイドバー開閉などで変わるので、反映待ちを弾くガードはそのまま残す。
      const pillEl = rightEl.querySelector('.sb-glass-search');
      if (pillEl && Math.abs(pillEl.getBoundingClientRect().width - desiredPillPx) > 1) return;
      const rightRect = rightEl.getBoundingClientRect();
      rightWidthByTierRef.current[collapsedTier] = rightRect.width;
      const gap = rightRect.left - leftEl.getBoundingClientRect().right;
      setCollapsedTier((prev) => {
        if (gap < MARGIN && prev < 2) return (prev + 1) as 0 | 1 | 2;
        if (prev > 0) {
          const widthHere = rightWidthByTierRef.current[prev];
          const widthBelow = rightWidthByTierRef.current[(prev - 1) as 0 | 1];
          const needed = (widthHere != null && widthBelow != null)
            ? MARGIN * 2 + Math.max(0, widthBelow - widthHere)
            : MARGIN * 3; // まだ下の tier を測っていないときは従来どおりの安全側
          if (gap >= needed) return (prev - 1) as 0 | 1 | 2;
        }
        return prev;
      });
    };
    const ro = new ResizeObserver(measure);
    if (glassLeftRef.current) ro.observe(glassLeftRef.current);
    if (glassRightRef.current) ro.observe(glassRightRef.current);
    window.addEventListener('resize', measure);
    measure();
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
    // collapsedTier 自体を依存に含め、tier 変化で gf-right の幅が変わった後にもう一度判定する。
  }, [visible, collapsedTier, stages, filterChips, leadLabel, desiredPillPx, historyLabel, historyActive]);

  if (typeof document === 'undefined' || !hasBeenVisible) return null;

  const dock = (
    <div className="sb-glass-layer" aria-hidden={!visible}>
      <div ref={glassLeftRef} className={`sb-glass-float gf-left${visible ? ' is-visible' : ''}`}>
        {/* 2026-09-22 ユーザー決定: 末尾の「上へ戻る（↑）」ボタンは撤去した（区切り線ごと）。
            末尾に残すのは道具の一覧ハンドル「▾」だけ。 */}
        <TopToolCapsule
          ariaLabel={toolsAriaLabel}
          items={tools}
          variant="compact"
        />
      </div>

      {/* 2026-09-14 最終決定: 中央カプセルは廃止。右側に「工程セグメント／絞り込みチップ／検索」を
          まとめる（通常時の「右側グループに12px空けて並べる」と同じ並び・見た目の連続性）。
          狭い幅（collapsedTier）: 1=工程を件数無し・詰め表示、2=さらに絞り込みチップを隠す。
          検索ピルは畳んでも縮めない・工程カプセルは畳み時も必ず出す（2026-09-22 ユーザー決定）。 */}
      <div ref={glassRightRef} className={`sb-glass-float gf-right${visible ? ' is-visible' : ''}`}>
        <ProcessSegment
          ariaLabel={processAriaLabel}
          leadLabel={collapsedTier >= 1 ? undefined : leadLabel}
          stages={stages}
          currentStage={currentStage}
          onSelectStage={onSelectStage}
          historyLabel={historyLabel}
          onHistoryClick={onHistoryClick}
          historyActive={historyActive}
          variant="compact"
          dense={collapsedTier >= 1}
          segmentTrailing={processTrailing}
        />
        {/* 2026-09-15: 絞り込みチップはモック（v8 の gf-right）どおり**検索ピルのすぐ左**に置く
            （以前は工程セグメントより左にあり、条件と検索欄が離れていた）。 */}
        {collapsedTier < 2 && <MiniFilterChips chips={filterChips} />}
        {/* 幅は常に通常時の検索ピルと同値（実測 pillWidthPx）。狭いときも縮めない。 */}
        <div className="sb-glass sb-glass-search" style={{ width: desiredPillPx }}>
          {leading && (
            <>
              {leading}
              <span className="sb-glass-div" aria-hidden />
            </>
          )}
          <span className="flex items-center text-gray-400" aria-hidden>
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
            </svg>
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSearchSubmit(); }}
            placeholder={searchPlaceholder}
            aria-label={searchAriaLabel ?? searchPlaceholder}
          />
          {/* 適用中チップは一覧側（ヘッダーの絞り込み）が出す。ここからは出さない
              ＝畳み時の検索カプセルに絞り込みチップが二重表示されるのを防ぐ
              （TopbarSearchDock.tsx と同じ流儀）。 */}
          {filterControl && (
            <FilterChipsHostProvider host={null}>
              <CollapsedFilterTriggerProvider collapsed>
                {filterControl}
              </CollapsedFilterTriggerProvider>
            </FilterChipsHostProvider>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(dock, document.body);
}
