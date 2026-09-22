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
export declare function SidebarNewDot({ placement, onAccent, muted, ringColor, label, tone, }: {
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
}): import("react").JSX.Element;
//# sourceMappingURL=SidebarNewDot.d.ts.map