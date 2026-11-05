'use client';

export type SkeletonTone = 'muted' | 'subtle' | 'accent';

const TONE_CLASS: Record<SkeletonTone, string> = {
  muted: 'bg-[rgb(var(--surface-muted))]',
  // 2段目の補助行など、muted より一段薄く見せたいとき
  subtle: 'bg-[rgb(var(--surface-subtle))]',
  // バッジの骨組み
  accent: 'bg-[var(--accent-subtle)]',
};

export function Skeleton({ className = '', tone = 'muted' }: { className?: string; tone?: SkeletonTone }) {
  return <div className={`${TONE_CLASS[tone]} rounded animate-pulse ${className}`} />;
}
