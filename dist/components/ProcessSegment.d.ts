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
/**
 * 第2行の絞り込みチップ列。入り切る分だけ表示し、あふれたら「＋n」に畳む（折り返さない）。
 *
 * Opus レビュー指摘: 折り返し（flex-wrap）のままだと、親（ProcessSegment の normal 行）が
 * overflow-hidden・固定高さ（h-8/h-11）なので、2行目にあふれたチップが見切れて消えてしまう。
 * nowrap にして、入り切らない分は「計測専用の非表示コンテナで実寸を測り、
 * 表示側は配列を絞り込む」方式（hidden 属性は使わない＝一度隠れても幅を見失わない）で
 * 「＋n」に畳む。
 */
export declare function FilterChipRow({ chips }: {
    chips: FilterChipItem[];
}): import("react").JSX.Element | null;
export declare function ProcessSegment({ ariaLabel, leadLabel, stages, currentStage, onSelectStage, historyHref, historyLabel, onHistoryClick, historyActive, variant, dataTour, trailing, segmentTrailing, dense, }: {
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
}): import("react").JSX.Element | null;
//# sourceMappingURL=ProcessSegment.d.ts.map