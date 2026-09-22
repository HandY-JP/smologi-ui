'use client';

/**
 * 一覧ヘッダーの並べ替えインジケータ。未ソート時は薄い ↕、ソート中はアクセント色の ▲/▼。
 * 商品マスタ（ProductsView）と「NE出品情報」の一覧で同じ見た目にするための共有部品。
 */
export function SortIndicator({ active, dir }: { active: boolean; dir?: 'asc' | 'desc' }) {
  return (
    <span className={`text-[10px] leading-none ${active ? 'text-[var(--sb-accent-bg)]' : 'text-gray-300'}`} aria-hidden>
      {active ? (dir === 'asc' ? '▲' : '▼') : '↕'}
    </span>
  );
}
