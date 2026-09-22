import type { WorkspaceKind } from '../lib/workspace';
/**
 * 「倉庫画面 ⇄ お客様画面（自社）」の2分割セグメントトグル。
 *
 * 置き場所: サイドバー最上部のドック（SidebarToggleDock）の**右端**。
 * ▶（開閉）／🔔（通知）／?（ヘルプ）／⋮⋮⋮（アプリ一覧）の後ろに並ぶ。
 *
 * 見た目:
 * - 2つのアイコンボタンが1つの角丸ピル（高さ32px＝ドックの他アイコンと同じ）に入り、
 *   選択側だけアクセント色で塗る（Claude アプリのセグメントトグルの流儀）。
 * - 地色は --sb-hover（サイドバー上に載るので周囲と馴染む）。選択側は --sb-accent-bg ＋
 *   --accent-on。--sb-heading を使うと暗色テーマで「白地に白アイコン」になるため使わない。
 *
 * 出す条件・折りたたみ時の扱いは呼び出し側（SidebarToggleDock）が持つ。
 * ここは「押されたら onSwitch(target) を呼ぶだけ」の見た目部品にしておく
 * （遷移や憑依の張り替えはサイドバー側の責務）。
 *
 * アクセシビリティ: role="radiogroup" ＋ 2つの role="radio"。矢印キーでの移動は
 * ブラウザ既定の Tab 移動で足りる（項目が2つだけ・どちらも常に押せる）ため足していない。
 */
export declare function WorkspaceSwitch({ current, onSwitch, onPrefetch, disabled, pendingTarget, }: {
    /** いまどちらのワークスペースにいるか。 */
    current: WorkspaceKind;
    /** 押された側（= 切替先）。すでに現在地なら呼ばれない。 */
    onSwitch: (target: WorkspaceKind) => void;
    /** ホバー・フォーカスで呼ぶ先読み（遷移先のコード/RSCを温める）。 */
    onPrefetch?: (target: WorkspaceKind) => void;
    /** 切替処理の実行中など、両方押せなくするとき。 */
    disabled?: boolean;
    /**
     * 切り替え中の行き先。指定すると、遷移が終わる前でも**押した側を選択済みに見せる**
     * （楽観的表示）。待っている間に「押したのに何も変わらない」と感じさせないための仕掛け。
     */
    pendingTarget?: WorkspaceKind | null;
}): import("react").JSX.Element;
//# sourceMappingURL=WorkspaceSwitch.d.ts.map