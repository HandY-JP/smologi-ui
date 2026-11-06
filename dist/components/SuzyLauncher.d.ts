/**
 * スージーの起動ボタン（画面の右下に浮く丸）。Seller・スモロジ・モバイルで共通（v0.21.0）。
 *
 * - 44px のガラスの丸＋星 22px。位置・下部バー（`data-bottom-bar`）のよけ方は従来のウィジェットと同じ
 *   （<html> の --bottom-bar-h を bottom に足す。測るのは useBottomBarHeightVar）
 * - state: idle（静止）／notice（光が走り小さな星がまたたく）／thinking（丸のふちを色の線が回る）／night（暗く止まる・月なし）
 * - showLabel: 「スージーに質問」と文字を添えたピルにする（まだスージーに質問したことのない人向け）
 * - badge: 右上の件数バッジ（文字列。空なら出さない）
 * - bubble / bounce: 「スージーからお知らせ」の吹き出しと一度だけの弾み（任意）
 * - placement="inline": 固定配置にせず、ボタンだけを返す（モバイルのように置き場所を自前で持つアプリ用。className はボタンに付く）
 * - hidden: 見えなくする（チャットを開いている間など。レイアウトは保つ）
 * 昔の「初回だけ光る輪（intro pulse）」は廃止した。
 */
import type { ButtonHTMLAttributes } from 'react';
import { type SuzyState } from './SuzySparkle';
export declare const SUZY_LAUNCHER_LABEL = "\u30B9\u30FC\u30B8\u30FC\u306B\u8CEA\u554F";
export interface SuzyLauncherProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    state?: SuzyState;
    /** 文字つきのピルにする。 */
    showLabel?: boolean;
    /** ピルの文字。既定「スージーに質問」。 */
    label?: string;
    /** 右上のバッジの文字（例 '2'・'3+'）。空・未指定なら出さない。 */
    badge?: string;
    badgeTestId?: string;
    /** チャットが開いているか（aria-expanded と星の向きに使う）。 */
    open?: boolean;
    /** 見えなくする（クリックも通さない）。 */
    hidden?: boolean;
    /** 吹き出し（role=status）。 */
    bubble?: string;
    /** 一度だけ弾ませる。 */
    bounce?: boolean;
    placement?: 'fixed' | 'inline';
    /** placement="fixed" のとき、外側の固定ボックスに付けるクラス。 */
    wrapClassName?: string;
}
export declare function SuzyLauncher({ state, showLabel, label, badge, badgeTestId, open, hidden, bubble, bounce, placement, wrapClassName, className, title, type, 'aria-label': ariaLabel, ...rest }: SuzyLauncherProps): import("react").JSX.Element;
//# sourceMappingURL=SuzyLauncher.d.ts.map