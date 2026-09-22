/**
 * ワークスペース種別。smologi 本体では `@/lib/workspace-switch-routes` が持つが、
 * ルーティング（遷移先 URL の解決）はアプリ固有なのでパッケージには型だけを置く。
 * 遷移は `WorkspaceSwitch` の `onSwitch` prop でアプリ側が受ける。
 */
export type WorkspaceKind = 'logistics' | 'customer';
