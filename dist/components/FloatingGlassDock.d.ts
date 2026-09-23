import { type ReactNode, type RefObject } from 'react';
import { type TopToolItem, type TopToolSettingsLink } from './TopToolCapsule';
import { type ProcessStage } from './ProcessSegment';
export interface FloatingFilterChip {
    id: string;
    /** 項目名（「入荷予定日」「検索語」など）。値だけでは何の条件か分からないので前に出す。 */
    field?: string;
    label: string;
    onRemove?: () => void;
}
export declare function FloatingGlassDock({ visible, tools, 
/** 道具カプセル末尾の「▾」（全ツール一覧）を出すか。設定モードは項目が少ないので出さない。 */
toolsListPanel, 
/** 道具の「▾」一覧の末尾に出す「関連する設定」。通常時（TopToolCapsule）と同じものを渡す。 */
toolsSettingsLinks, toolsAriaLabel, processAriaLabel, leadLabel, stages, currentStage, onSelectStage, historyLabel, onHistoryClick, historyActive, leading, searchValue, onSearchChange, onSearchSubmit, searchPlaceholder, searchAriaLabel, searchInputRef, 
/** 実際の FilterPopover/ShipmentFilterMenu を渡す（collapsed 表示で件数バッジ付きの
 *  じょうごトリガーになる）。呼び出し側の renderXxxFilter(true) をそのまま渡せばよい。 */
filterControl, filterChips, processTrailing, showProcess, showSearch, }: {
    visible: boolean;
    tools: TopToolItem[];
    toolsListPanel?: boolean;
    toolsSettingsLinks?: TopToolSettingsLink[];
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
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    onSearchSubmit?: () => void;
    searchPlaceholder?: string;
    searchAriaLabel?: string;
    searchInputRef?: RefObject<HTMLInputElement | null>;
    filterControl?: ReactNode;
    filterChips?: FloatingFilterChip[];
    /** 工程（セグメント）カプセルの中、ピル列の直後に置く追加要素（商品マスタの保存ビュー「▾」）。 */
    processTrailing?: ReactNode;
    /**
     * 工程セグメントのカプセルを出すか（既定 true）。工程が無い画面（商品の新規登録など）で
     * 空のカプセルだけが浮くのを避けるために false にする。
     */
    showProcess?: boolean;
    /**
     * 検索ピルを出すか（既定 true）。検索の無い画面（商品詳細）では false にする
     * ＝畳み時の右側は工程セグメントだけになる（仕様書の「右＝空 or 検索」）。
     */
    showSearch?: boolean;
}): ReactNode;
//# sourceMappingURL=FloatingGlassDock.d.ts.map