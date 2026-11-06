'use client';

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
import { SuzySparkle, type SuzyState } from './SuzySparkle';
import { useBottomBarHeightVar } from '../lib/use-bottom-bar-height-var';

export const SUZY_LAUNCHER_LABEL = 'スージーに質問';

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

export function SuzyLauncher({
  state = 'idle',
  showLabel = false,
  label = SUZY_LAUNCHER_LABEL,
  badge,
  badgeTestId,
  open = false,
  hidden = false,
  bubble,
  bounce = false,
  placement = 'fixed',
  wrapClassName,
  className,
  title,
  type = 'button',
  'aria-label': ariaLabel,
  ...rest
}: SuzyLauncherProps) {
  // 固定配置のときだけ下部バーの高さを測る（inline は置き場所を持つアプリ側の責任）。
  useBottomBarHeightVar(placement === 'fixed');

  const button = (
    <button
      type={type}
      aria-label={ariaLabel ?? label}
      aria-expanded={open}
      title={title ?? label}
      data-state={state}
      className={[
        'suzy-launcher',
        showLabel ? 'suzy-launcher--label' : '',
        bounce ? 'suzy-launcher--bounce' : '',
        open ? 'is-open' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      <SuzySparkle size={22} state={state} className="suzy-launcher__star" />
      {showLabel && <span className="suzy-launcher__label">{label}</span>}
      {state === 'thinking' && <span className="suzy-ring" aria-hidden="true" data-testid="suzy-ring" />}
      {badge ? (
        <span data-testid={badgeTestId} aria-hidden="true" className="suzy-launcher__badge">
          {badge}
        </span>
      ) : null}
    </button>
  );

  if (placement === 'inline') return button;

  return (
    <div className={['suzy-launcher-wrap', wrapClassName].filter(Boolean).join(' ')} data-hidden={hidden ? 'true' : undefined}>
      {button}
      {bubble ? (
        <span role="status" className="suzy-launcher__bubble">
          {bubble}
        </span>
      ) : null}
    </div>
  );
}
