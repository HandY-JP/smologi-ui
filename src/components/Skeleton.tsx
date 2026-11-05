'use client';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-[rgb(var(--surface-muted))] rounded animate-pulse ${className}`} />;
}
