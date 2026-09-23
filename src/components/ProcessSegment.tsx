'use client';
// トップバー再設計（2026-09-14 最終決定）:
//   - 工程タブ本体（入荷=予定/滞留、出荷=依頼中/作業中/確定）は「上段右側グループの中、検索ピルの
//     左に12px空けて（連結しない）」。variant="center" が通常時（AdminTopBar 第1行右側グループの
//     専用スロット。呼称は歴史的経緯で "center" のままだが、実際の配置は右寄せグループ内）、
//     variant="compact" が畳み時（FloatingGlassDock の右カプセル内）で、どちらも同じピル
//     （sb-glass-stage）を使う「見た目の連続性」＝ compact は center の見た目に glass
//     （半透明+blur）を足しただけ、という関係にしてある。
//   - グループチップ・絞り込みチップ・履歴リンクは第2行（variant="normal"）。stages を渡さなければ
//     （空配列）工程タブ無しでグループ/絞り込み/履歴だけの行になる（入荷・出荷はこちらの使い方）。
//     中身（groups/trailing）が無いときは履歴リンクだけの32px、あれば44px に自身で切り替える。
import { useLayoutEffect, useRef, useState } from 'react';
import { computeChipOverflow, type OverflowChip } from '../lib/topbar-compaction';

export interface ProcessStage {
  key: string;
  label: string;
  /**
   * 件数バッジ。省略（undefined/null）すると件数を出さない。
   * 商品マスタの「保存ビュー」のように、そもそも件数の概念が無いセグメントで使う。
   */
  count?: number | null;
  /** 滞留など要対応の工程はローズ系の強調にする。 */
  tone?: 'default' | 'danger';
  /**
   * ピルに付けるツールチップ。ラベルを詰めて表示する用途（商品マスタの保存ビューは
   * 8文字までに切り詰める）でフル名称を補うために使う。
   * disabled のときは「なぜ押せないか」をここに書く（請求の「お客様を選ぶと開けます」）。
   */
  title?: string;
  /**
   * いまは選べない工程（請求の「締め」「内訳」はお客様を選ぶまで開けない）。
   * 消さずに disabled にして、理由は title のツールチップで出す（位置が動かないように）。
   */
  disabled?: boolean;
}

export interface FilterChipItem {
  id: string;
  /** 項目名（「入荷予定日」「検索語」など）。値だけでは何の条件か分からないので前に出す。 */
  field?: string;
  label: string;
  onRemove?: () => void;
}

// 「項目名: 値 ×」で出す（2026-09-22 ユーザー決定。値だけだと「2026-09-15〜指定なし」のように
// 何の条件なのか読み取れなかった）。項目名は控えめ（gray-500）、値をはっきり（gray-800）。
function FilterChipPill({ c, chipRef }: { c: FilterChipItem; chipRef?: (node: HTMLSpanElement | null) => void }) {
  const full = c.field ? `${c.field}: ${c.label}` : c.label;
  return (
    <span ref={chipRef} className="sb-group-chip" title={full}>
      {c.field && <span className="text-gray-500">{c.field}: </span>}
      <span className="text-gray-800">{c.label}</span>
      {c.onRemove && (
        <button type="button" onClick={c.onRemove} aria-label={`${full}の条件を解除`} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
      )}
    </span>
  );
}

/**
 * 第2行の絞り込みチップ列。入り切る分だけ表示し、あふれたら「＋n」に畳む（折り返さない）。
 *
 * Opus レビュー指摘: 折り返し（flex-wrap）のままだと、親（ProcessSegment の normal 行）が
 * overflow-hidden・固定高さ（h-8/h-11）なので、2行目にあふれたチップが見切れて消えてしまう。
 * nowrap にして、入り切らない分は「計測専用の非表示コンテナで実寸を測り、
 * 表示側は配列を絞り込む」方式（hidden 属性は使わない＝一度隠れても幅を見失わない）で
 * 「＋n」に畳む。
 */
export function FilterChipRow({ chips }: { chips: FilterChipItem[] }) {
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
        widthPx: (chipMeasureRefs.current.get(c.id)?.getBoundingClientRect().width ?? 0) + 6,
      }));
      const moreWidth = (moreMeasureRef.current?.getBoundingClientRect().width ?? 60) + 6;
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
    <div className="relative flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden" aria-label="絞り込み条件">
      {/* 計測専用（画面外・visibility:hidden）。常に全候補ぶんの実寸を持つ。 */}
      <div aria-hidden className="sb-measure-layer pointer-events-none invisible fixed left-0 top-0 z-[-1] flex gap-1.5">
        {chips.map((c) => (
          <FilterChipPill key={c.id} c={c} chipRef={(node) => { if (node) chipMeasureRefs.current.set(c.id, node); else chipMeasureRefs.current.delete(c.id); }} />
        ))}
        <span ref={moreMeasureRef} className="sb-group-chip sb-group-chip-more">＋99</span>
      </div>
      {/* 行頭に「じょうご＋絞り込み」を1回だけ（2026-09-22 ユーザー決定）。何の行なのかを示す。 */}
      <span className="flex shrink-0 items-center gap-1" aria-hidden>
        <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5h16.5l-6.6 7.7v4.55l-3.3 1.65v-6.2L3.75 4.5z" />
        </svg>
        <span className="text-xs text-gray-500">絞り込み</span>
      </span>
      {/* 表示側: nowrap（折り返さない）。計測結果で絞り込んだ配列だけを描画する。
          溢れ計算の基準（利用できる幅）は、行頭ラベルと「すべて解除」を除いた**この箱**の幅。 */}
      <div ref={containerRef} className="flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-hidden">
        {visibleChips.map((c) => <FilterChipPill key={c.id} c={c} />)}
        {hiddenCount > 0 && (
          <span className="sb-group-chip sb-group-chip-more" title={`他${hiddenCount}件の絞り込み条件`}>
            {visibleChips.length === 0 ? `絞り込み ${hiddenCount}` : `＋${hiddenCount}`}
          </span>
        )}
      </div>
      {/* 2件以上のときだけ「すべて解除」。各チップの解除を順に呼ぶので、画面ごとの
          clear 関数を新たに渡さなくても全画面で同じように効く（setState はまとめて反映される）。 */}
      {chips.length >= 2 && (
        <button
          type="button"
          onClick={() => { for (const c of chips) c.onRemove?.(); }}
          className="shrink-0 text-xs text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
        >
          すべて解除
        </button>
      )}
    </div>
  );
}

export function ProcessSegment({
  ariaLabel,
  leadLabel,
  stages,
  currentStage,
  onSelectStage,
  historyHref,
  historyLabel = '履歴',
  onHistoryClick,
  historyActive,
  variant = 'normal',
  dataTour,
  trailing,
  segmentTrailing,
  dense = false,
}: {
  ariaLabel: string;
  /** 畳み時（compact）だけ左に出す接頭ラベル（「入荷」「出荷」）。通常時はタブ自体が語るので出さない（旧 AdminTopBarFlow は撤去済み）。 */
  leadLabel?: string;
  stages: ProcessStage[];
  currentStage: string;
  onSelectStage: (key: string) => void;
  historyHref?: string;
  historyLabel?: string;
  onHistoryClick?: () => void;
  /** 履歴（タブ）を表示中か。true のとき履歴リンクに aria-current と選択トーンを付ける。 */
  historyActive?: boolean;
  variant?: 'normal' | 'compact' | 'center';
  dataTour?: string;
  /** 絞り込みチップなど、工程の後ろ・履歴リンクの前に置く追加要素（通常時のみ想定）。 */
  trailing?: React.ReactNode;
  /**
   * カプセル（center/compact）の**中**、ピル列の直後に置く追加要素。
   * 商品マスタの保存ビューセグメント末尾に付ける「▾」（保存・名前変更・削除）用。
   */
  segmentTrailing?: React.ReactNode;
  /**
   * 本番崩れ修正（2026-09-14）: compact（畳み時の浮遊カプセル）専用。狭い幅で道具バー側の
   * カプセルと重なりそうなとき、件数バッジを省き詰め幅にする（ラベル文字自体は変えない＝
   * データを増やさず CSS だけで縮める）。center/normal では無視する。
   */
  dense?: boolean;
}) {
  // stages 部分の中身（ラベル＋件数バッジ）は center（通常時・第1行中央）と compact（畳み時・
  // 浮遊ガラス）で完全に同じマークアップ（sb-glass-stage）を使う。違いは外枠に glass を
  // 足すかどうかだけ＝スクロールで畳んだときにピルの形・幅が変わらず連続して見える。
  // 工程間は「›」区切り（旧 AdminTopBarFlow と同じ書式・撤去済み。Opus レビュー指摘:
  // 区切り無しだと工程の進行順が読み取りづらい）。先頭の前には出さない。
  const stagePills = (
    <>
      {leadLabel && <span className="sb-glass-lead">{leadLabel}</span>}
      {stages.map((s, i) => (
        <span key={s.key} className="flex items-center">
          {i > 0 && <span className="sb-glass-chevron" aria-hidden>›</span>}
          <button
            type="button"
            onClick={() => onSelectStage(s.key)}
            aria-current={currentStage === s.key ? 'step' : undefined}
            disabled={s.disabled}
            title={s.title}
            className={`sb-glass-stage${currentStage === s.key ? ' on' : ''}${s.tone === 'danger' ? ' danger' : ''}${dense ? ' dense' : ''}${s.disabled ? ' is-disabled' : ''}`}
          >
            {s.label}
            {!dense && s.count != null && <b>{s.count > 999 ? '999+' : s.count}</b>}
          </button>
        </span>
      ))}
    </>
  );

  // 2026-09-22 ユーザー決定: 「履歴」は第2行の右端ではなく、工程セグメントのカプセル内・
  // 最後の工程の後ろに縦の区切り線を挟んで置く（アイコンは付けずテキストのみ）。
  // 見た目は工程ピルと同じ土台（.sb-glass-stage）だが、塗りつぶし無し・薄いグレー文字
  // （.sb-glass-history）にして工程と区別する。履歴タブを表示中は工程の選択状態（.on）と同じ。
  const historyClass = `sb-glass-stage sb-glass-history${historyActive ? ' on' : ''}${dense ? ' dense' : ''}`;
  const historyEntry = (historyHref || onHistoryClick) ? (
    <>
      <span className="sb-glass-div" aria-hidden />
      {historyHref ? (
        <a href={historyHref} onClick={onHistoryClick} aria-current={historyActive ? 'page' : undefined} className={historyClass}>
          {historyLabel}
        </a>
      ) : (
        <button type="button" onClick={onHistoryClick} aria-current={historyActive ? 'page' : undefined} className={historyClass}>
          {historyLabel}
        </button>
      )}
    </>
  ) : null;

  if (variant === 'compact') {
    return (
      <div className={`sb-glass sb-glass-center${dense ? ' dense' : ''}`} role="group" aria-label={ariaLabel} data-tour={dataTour}>
        {stagePills}
        {segmentTrailing}
        {historyEntry}
      </div>
    );
  }

  if (variant === 'center') {
    // 通常時・第1行（2026-09-14 決定 → 2026-09-15 修正）。
    // 本番崩れ修正: モック v8（.tabs）どおり、通常時も**道具バー・検索ピルと同じカプセル**
    // （.sb-tool-capsule＝--cap-* 相当の白カプセル＋内側リム＋外枠＋影）に入れる。
    // 以前は枠を一切持たず、文字と件数バッジがページ背景へ直置きになっていた
    // （帯を廃止したトップバーでは「浮いている部品」に見えず、畳み時のガラスカプセルとも
    // 形が繋がらなかった）。畳み時（compact）は同じ形のまま .sb-glass（半透明+blur）に
    // 差し替わるので、スクロールで畳んでも同じ部品が浮いたように見える。
    return (
      <div className="sb-tool-capsule sb-glass-center" role="group" aria-label={ariaLabel} data-tour={dataTour}>
        {stagePills}
        {segmentTrailing}
        {historyEntry}
      </div>
    );
  }

  // normal: 第2行（グループチップ・絞り込みチップ・履歴リンク）。stages を渡さない使い方が既定
  // （入荷・出荷は工程タブを center 側へ渡すため、ここでは空配列＝工程タブ無しで使う）。
  // グループチップは呼び出し側が trailing 経由で渡す（出荷は既存 shippingSegment をそのまま流用、
  // 入荷は使わない）。ProcessSegment 自身の groups/onSelectGroup props は使われていなかったため
  // 撤去した（Opus レビュー指摘: 未使用の GroupChipRow/OverflowGroupMenu を削除）。
  //
  // 2026-09-22 ユーザー決定: 「履歴だけの 32px 行」は廃止。チップ等（trailing）も工程も無い
  // ときは行そのものを描画しない（＝ #admin-topbar-page-row が :empty になり高さ0）。
  // 履歴リンクは工程セグメントのカプセル側（center/compact）へ移したので、この行に単独で
  // 出すことはもう無い。狭い幅で工程がこの行へ回ったとき（processInRow2）だけ、工程と一緒に
  // 履歴も連れてくる。
  const hasRowContent = !!trailing;
  const hasStagesHere = stages.length > 0;
  if (!hasRowContent && !hasStagesHere) return null;
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-3 overflow-hidden transition-[height] duration-150 ${hasRowContent ? 'h-11' : 'h-8'}`}
      data-tour={dataTour}
    >
      {hasStagesHere && (
        <nav aria-label={ariaLabel} className="flex flex-shrink-0 items-center gap-1">
          {stages.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => onSelectStage(s.key)}
              aria-current={currentStage === s.key ? 'step' : undefined}
              title={s.title}
              className={`sb-stage-tab${currentStage === s.key ? ' current' : ''}${s.tone === 'danger' ? ' danger' : ''}`}
            >
              {s.label}
              {s.count != null && <span className="sb-stage-badge">{s.count > 999 ? '999+' : s.count}</span>}
            </button>
          ))}
          {/* 狭い幅で工程（＝商品マスタの保存ビュー）が第2行へ回ったときも、末尾の「▾」
              （保存・名前変更・削除）を失わないよう一緒に連れてくる。 */}
          {segmentTrailing}
          {/* 工程がこの行へ回っているときだけ、履歴も同じ並びの末尾に置く
              （工程が第1行のカプセルにいるときは、履歴もそちらのカプセル末尾にいる）。 */}
          {historyEntry}
        </nav>
      )}

      {trailing}
    </div>
  );
}
