// 枠なし一覧（2026-09-22 ユーザー決定）の共通スタイル。
//
// 一覧をカード（LIST_CARD_CLASS の rounded-lg border）に入れず、本文へ直置きする作法。
// 外枠・角丸・縦罫線を持たず、行の区切りは横罫線 1 本だけ。まず入荷ページ（#533/#535）で
// 確定し、出荷ページへ広げるにあたってここへ抽出した（入荷ページ側も 2026-09-22 に差し替え済み）。
//
// 共通の LIST_CARD_CLASS 自体はここでは変更しない。枠ありのままの一覧（商品・仕入先など）が
// 残っているため、載せ替えたページだけがこの定数を使う。
//
// 使い方:
//   <div className={ADMIN_FLAT_LIST}>
//     <div className="overflow-x-auto sb-thin-scrollbar">
//       <table className={`${ADMIN_FLAT_TABLE} ${ADMIN_FLAT_TABLE_HEAD}`}>…</table>
//     </div>
//     <ListFooter … />
//   </div>

/**
 * 表本体。罫線は td の下 1 本だけ（縦罫線・外枠なし）。
 * ダーク時の罫線色は `themed-table` のフック（globals.css）が受ける。
 * border-separate + border-spacing-0 なのは、sticky なセル（先頭列・見出し帯）の罫線が
 * border-collapse だと一緒にスクロールしてしまうため。
 */
export const ADMIN_FLAT_TABLE =
  'themed-table w-full text-sm border-separate border-spacing-0 '
  + '[&_td]:border-b [&_td]:border-gray-100';

/**
 * 列見出し行（thead）を残す一覧向けの追加クラス。
 * 入荷ページは見出し行を持たない（日付帯が見出しの役目）が、出荷ページは「状態」見出しの
 * クリックが絞り込みを兼ねているため見出し行を残す。そのときの見た目はこの 1 つに揃える:
 * 背景塗りなし・13px の灰色・下罫線 1px のみ（追従はしない。追従するのは見出し帯 1 段だけ）。
 * 素の `.text-xs` などより詳細度が高いので、th 側のクラスを書き換えなくても上書きできる。
 */
export const ADMIN_FLAT_TABLE_HEAD =
  '[&>thead>tr>th]:border-b [&>thead>tr>th]:border-gray-200 '
  + '[&>thead>tr>th]:bg-transparent [&>thead>tr>th]:text-[13px] '
  + '[&>thead>tr>th]:font-medium [&>thead>tr>th]:text-gray-500';

/**
 * 一覧・空表示を包む器。枠は持たず、面色だけ本文と同じ白にする。
 * overflow は visible のまま（末尾の ListFooter は sticky なので、スクロールコンテナを
 * 作らないこと。LIST_CARD_CLASS の overflow-clip も不要）。
 */
export const ADMIN_FLAT_LIST = 'bg-white';

/**
 * 枠なし一覧のページ本文に付ける左右の相殺。
 * 共通レイアウトの #app-main-content は px-4 sm:px-6 なので、sm 以上で 8px 打ち消して
 * どの幅でも本文の左右余白を 16px に揃える（共通レイアウト側の値は変えない）。
 * `admin-page-tight-top`（トップバーとの間を 12px に詰める・globals.css）と併せて使う。
 */
export const ADMIN_FLAT_PAGE = 'admin-page-tight-top sm:-mx-2';

// ---- 商品行のセル（コード欄・名前欄・画像列）の共通寸法とクラス（v0.14.0） ----
// コード（商品コード・JAN・ASIN・SKU）は等幅フォントをやめ、本文のゴシック + tabular-nums（桁がそろう）。
// 色は var() 形で書く（amazon-app は Tailwind preset が無く `text-accent-hover` 形が使えない）。

/** 画像列の幅（px）。画像は余白を詰めてこの幅いっぱいに出す。 */
export const FLAT_IMAGE_COL_PX = 64;
/** コード欄の幅（px）。 */
export const FLAT_CODE_COL_PX = 168;

/** コード欄の上段（商品コード・ASIN）。アクセント色。 */
export const FLAT_CODE_PRIMARY_CLASS = 'text-base tabular-nums text-[var(--accent-hover)]';
/** コード欄の下段（JAN・SKU）。薄色・小さめ。 */
export const FLAT_CODE_SECONDARY_CLASS = 'text-sm tabular-nums text-[rgb(var(--ink-muted))]';
/** 名前欄の上段（商品名）。2 行まで。flex の子に直接付けると display が blockify されて clamp が効かないので、ProductNameStack は内側の div に付ける。 */
export const FLAT_NAME_PRIMARY_CLASS = 'font-medium text-[15px] line-clamp-2 break-words';
/** 名前欄の上段の既定色（`ProductNameStack` の `primaryColorClassName` で差し替え可）。 */
export const FLAT_NAME_PRIMARY_COLOR_CLASS = 'text-[rgb(var(--ink))]';
/** 名前欄の下段（システム商品名・ブランドなど）。 */
export const FLAT_NAME_SECONDARY_CLASS = 'mt-auto pt-0.5 text-[13px] truncate';
/** 名前欄の下段の既定色。 */
export const FLAT_NAME_SECONDARY_COLOR_CLASS = 'text-[rgb(var(--ink-muted))]';
