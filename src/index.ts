// @handy/smologi-ui — 公開 API
//
// 方針: ここに出すのは「アプリの事情を知らない純 UI」だけ。
// 通知・ヘルプ・権限・セッション・お客様キャッシュに触れる部品はアプリ側に残す
// （AdminTopBar / CustomerTopBar / SidebarFooter / use-notification-badge など）。
// それらはこのパッケージの部品を組み合わせて各アプリで組み立てる。

// ---- トークン / クラス定数 ----
export * from './lib/theme';
export * from './lib/palette';
export * from './lib/flat-table';
export * from './lib/list-card';
export * from './lib/list-page-size';
export * from './lib/workspace';

// ---- レイアウト計算（純関数・テスト済み） ----
export * from './lib/top-tool-placement';
export * from './lib/topbar-compaction';
export * from './lib/filter-controls';
export * from './lib/topbar-slots';

// ---- アプリシェル（コンテキスト・CSS 変数の配線） ----
export * from './components/app-chrome';
export * from './components/AppContentLeftVar';
export * from './components/AppMainTopVar';

// ---- トップバー（新デザインの中核） ----
export * from './components/TopToolCapsule';
export * from './components/ProcessSegment';
export * from './components/FloatingGlassDock';
export * from './components/TopbarSearchDock';
export * from './components/useTopbarCompaction';
export * from './components/useTopBarFit';

// ---- 一覧（見出し・表・ページャ・一括選択） ----
export * from './components/StickySectionHeader';
export * from './components/SectionJumpNav';
export * from './components/section-jump-measure';
export * from './components/useLastStuckSection';
export * from './components/GroupSelectCheckbox';
export * from './components/BulkActionPill';
export * from './components/ListFooter';
export * from './components/Pagination';

// ---- 設定画面（区画・フォーム行・検索） ----
export * from './lib/settings-search-store';
export * from './components/SettingsSection';
export * from './components/SettingsRow';

// ---- 絞り込み ----
export * from './components/FilterPopover';
export * from './components/SearchFilterBar';
export * from './components/SearchableSelect';

// ---- モーダル ----
export * from './components/Modal';
export * from './components/LargeModal';
export * from './components/ConfirmDialog';

// ---- 小物 ----
export * from './components/Toast';
export * from './components/Tooltip';
export * from './components/CellPopover';
export * from './components/GuideTour';
export * from './components/SummaryTile';
export * from './components/EmptyState';
export * from './components/ErrorBanner';
export * from './components/SortIndicator';
export * from './components/Skeleton';
export * from './components/ProductThumb';
export * from './components/ThemeIcon';
export * from './components/AppSwitcherIcon';
export * from './components/SidebarNewDot';
export * from './components/WorkspaceSwitch';
