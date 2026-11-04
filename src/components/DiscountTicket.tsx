'use client';

// 割引券の見た目（大きい数字＋小さい単位）。左右にミシン目の切り欠き。
// 切り欠きの色は載せる面の色に合わせる（notchColor。既定は白面）。

export function DiscountTicket({
  big,
  small,
  muted = false,
  notchColor = 'var(--sb-glass-bg-opaque, #ffffff)',
  className = '',
}: {
  /** 大きい文字（「5%」「300」「送料」）。 */
  big: string;
  /** 小さい文字（「OFF」「円OFF」「無料」）。 */
  small?: string;
  /** 終了済みなど、色を落とす。 */
  muted?: boolean;
  /** 切り欠きの抜き色（載せる面の背景）。CSS の色値または var()。 */
  notchColor?: string;
  className?: string;
}) {
  const notch = 'absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full';
  return (
    <div
      className={`relative flex h-[52px] w-[92px] flex-shrink-0 flex-col items-center justify-center rounded-[10px] font-semibold leading-[1.1] ${
        muted ? 'bg-gray-100 text-gray-400' : 'bg-[var(--accent-subtle)] text-[var(--sb-accent-bg)]'
      } ${className}`}
    >
      <span aria-hidden className={`${notch} -left-[5px]`} style={{ background: notchColor }} />
      <span aria-hidden className={`${notch} -right-[5px]`} style={{ background: notchColor }} />
      <span className="text-[18px] leading-[26px]">{big}</span>
      {small && <span className="text-[11px] leading-[16px] font-semibold opacity-85">{small}</span>}
    </div>
  );
}
