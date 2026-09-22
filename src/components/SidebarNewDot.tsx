'use client';

/**
 * サイドバーの「新着あり」を示す赤い丸ドット（管理画面・お客様画面で共通）。
 *
 * サイドバーでは件数を出さない。数字は画面を開けば分かるうえ、ナビでの数字は
 * 「今いくつ？」を常時気にさせてしまうため、「新着があるか無いか」だけを示す。
 * （管理画面の出荷にあった実装を正として切り出したもの。）
 *
 * - placement="inline": 展開中の行の右端に並べる
 * - placement="corner": 折りたたみ中のアイコン右上／開閉トグルの右上に重ねる
 */
export function SidebarNewDot({
  placement = 'inline',
  onAccent = false,
  muted = false,
  ringColor,
  label = '新着あり',
  tone = 'red',
}: {
  placement?: 'inline' | 'corner';
  /** 選択中の行（濃い背景）に載るときは白丸にして潰れないようにする。 */
  onAccent?: boolean;
  /** 件数取得中は薄く出す（確定値に見せない）。 */
  muted?: boolean;
  /** 背景から浮かせるための縁取り色（開閉トグルの上に重ねるときに使う）。 */
  ringColor?: string;
  /** 読み上げラベル。null にすると装飾扱い（親側の aria-label に含める場合）。 */
  label?: string | null;
  /**
   * 色調。'red'（既定）＝要対応・新着あり。'blue'＝静かな未読（要対応ではない完了報告等）。
   * onAccent=true のときは色調に関わらず白丸になる（濃い背景での視認性優先）。
   */
  tone?: 'red' | 'blue';
}) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label ?? undefined}
      aria-hidden={label ? undefined : true}
      title={label ?? undefined}
      className={`h-2 w-2 rounded-full ${
        placement === 'corner'
          ? 'pointer-events-none absolute right-1 top-1'
          : 'ml-1 inline-block flex-shrink-0'
      } ${muted ? 'opacity-60' : ''} ${onAccent ? 'bg-white' : tone === 'blue' ? 'bg-blue-500' : 'bg-red-500'}`}
      style={ringColor ? { boxShadow: `0 0 0 2px ${ringColor}` } : undefined}
    />
  );
}
