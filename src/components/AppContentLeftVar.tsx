// サイドバーを持つレイアウトが宣言する「本文領域の左端」。
//
// モーダル（Modal）は document.body へ portal するため、position:fixed の中央寄せは
// ビューポート基準になる。サイドバー（fixed・左端・14rem）はその上に重なるので、
// 見た目は「左余白ゼロ・右にサイドバー幅ぶんの余白」＝ずれて見える。
// そこで本文領域の左端を CSS 変数で配り、モーダル側がその内側で中央寄せする。
//
// - :root ではなく html:root（詳細度 0,0,2）で宣言し、宣言順に関係なく既定値へ勝たせる
// - 値は --sidebar-width をそのまま参照するので、折りたたみ・印刷時の 0px 上書きに追従する
// - サイドバーの無いレイアウト（/apply・ログイン等）はこの変数を配らないので 0px のまま
export const APP_CONTENT_LEFT_CSS = 'html:root{--app-content-left:var(--sidebar-width,0px)}';

/** サイドバーのあるレイアウト直下に置く。副作用は CSS 変数の宣言だけ。 */
export function AppContentLeftVar() {
  return <style dangerouslySetInnerHTML={{ __html: APP_CONTENT_LEFT_CSS }} />;
}
