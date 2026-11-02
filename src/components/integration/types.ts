// 連携ページ・ショップ設定の共通部品の型（v0.14.0）。登録表の中身（どの連携先があるか）はアプリ側が持つ。

/** 状態の色分け。ok=緑 / warn=琥珀 / bad=赤 / off=灰（使っていない・未接続）。 */
export type IntegrationTone = 'ok' | 'warn' | 'bad' | 'off';

/** 連携先の見分け用メタ。accentVar はロゴ地の色を持つ CSS 変数名（例 '--brand-amazon'）。未定義なら palette の accent。 */
export interface IntegrationProviderMeta {
  id: string;
  label: string;
  /** ロゴの代わりに出す短い文字（1〜2 文字）。 */
  logoText: string;
  accentVar: string;
}

export interface StatusTileModel {
  label: string;
  tone: IntegrationTone;
  /** 「正常」「失敗中」など。 */
  value: string;
  sub?: string;
  /** 最後に成功した時刻（表示用に整形済みの文字列）。sub が無いとき代わりに出す。 */
  lastSuccessAt?: string;
}

export interface ProcessToggleItem {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  saving?: boolean;
  disabled?: boolean;
  /** true のとき、スイッチを置かず「常に行います」を出す。 */
  readOnly?: boolean;
  readOnlyText?: string;
}

export type DeliveryResult = 'ok' | 'bad' | 'pending';

export interface DeliveryHistoryRow {
  id: string;
  at: string;
  ref: string;
  trackingNo: string;
  destination: string;
  result: DeliveryResult;
  resultLabel: string;
  error?: string;
}

export interface ShopMark {
  label: string;
  tone: IntegrationTone;
}

export interface ShopCardModel {
  id: string;
  meta: IntegrationProviderMeta;
  name: string;
  subtitle?: string;
  /** 状態の小さな印。多くても 3 つ（超えた分は切り捨てる）。 */
  marks?: ShopMark[];
}

export interface ProviderPickerItem {
  meta: IntegrationProviderMeta;
  description?: string;
  /** true のとき押せない（「準備中」を出す）。 */
  comingSoon?: boolean;
}
