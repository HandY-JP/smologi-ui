'use client';
// 印刷画面だけで使う小さな部品（アプリの部品に依存しないよう、ここに持つ）。
import type { CSSProperties } from 'react';

/** 処理中の小さなスピナー（ボタンの文字の前に置く）。 */
export function InlineActionSpinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-line-strong border-t-ink-muted ${className}`}
      aria-hidden
    />
  );
}

/** 読み込み中の骨格（1ブロック）。reduced-motion では点滅させない。 */
export function SkeletonBlock({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <div className={`rounded bg-surface-muted/70 motion-safe:animate-pulse ${className}`} style={style} aria-hidden />;
}
