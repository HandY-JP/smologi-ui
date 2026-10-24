'use client';

import type { ReactNode } from 'react';

export type LoaderVariant = 'page' | 'screen' | 'inline';
export type LoaderSize = 'sm' | 'md' | 'lg';
const LOADING_TEXT = 'loading...';

function SkeletonLine({ className = '' }: { className?: string }) {
  return <span className={`hp-skeleton-line ${className}`} aria-hidden />;
}

function InlineLoaderSkeleton({ label, mark }: { label: string; mark?: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="hp-inline-loader">
      <span className="sr-only">{label}</span>
      <div className="hp-inline-skeleton" aria-hidden>
        <div className="hp-inline-skeleton-head">
          <SkeletonLine className="hp-inline-skeleton-dot" />
          <SkeletonLine className="hp-inline-skeleton-line--title" />
          <span className="hp-inline-skeleton-ring">
            <LoadingIndicator size="sm" mark={mark} />
          </span>
        </div>
        <SkeletonLine className="hp-inline-skeleton-line--wide" />
        <SkeletonLine className="hp-inline-skeleton-line--mid" />
      </div>
    </div>
  );
}

function PageLoaderSkeleton({ label, mark }: { label: string; mark?: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="hp-page-loader">
      <span className="sr-only">{label}</span>
      <div data-testid="handy-page-skeleton" className="hp-page-skeleton" aria-hidden>
        <div className="hp-skeleton-ring">
          <LoadingIndicator size="md" mark={mark} />
        </div>
        <div className="hp-page-skeleton-toolbar">
          <SkeletonLine className="hp-page-skeleton-search" />
          <SkeletonLine className="hp-page-skeleton-control" />
          <SkeletonLine className="hp-page-skeleton-control hp-page-skeleton-control--short" />
        </div>
        <div className="hp-page-skeleton-table">
          <div className="hp-page-skeleton-head">
            <SkeletonLine className="hp-page-skeleton-thumb" />
            <SkeletonLine className="hp-page-skeleton-cell hp-page-skeleton-cell--code" />
            <SkeletonLine className="hp-page-skeleton-cell hp-page-skeleton-cell--name" />
            <SkeletonLine className="hp-page-skeleton-cell hp-page-skeleton-cell--short" />
          </div>
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={`hp-page-skeleton-row-${index}`} className="hp-page-skeleton-row">
              <SkeletonLine className="hp-page-skeleton-thumb" />
              <div className="hp-page-skeleton-stack">
                <SkeletonLine className="hp-page-skeleton-cell hp-page-skeleton-cell--code" />
                <SkeletonLine className="hp-page-skeleton-cell hp-page-skeleton-cell--tiny" />
              </div>
              <div className="hp-page-skeleton-stack hp-page-skeleton-stack--wide">
                <SkeletonLine className="hp-page-skeleton-cell hp-page-skeleton-cell--name" />
                <SkeletonLine className="hp-page-skeleton-cell hp-page-skeleton-cell--mid" />
              </div>
              <SkeletonLine className="hp-page-skeleton-cell hp-page-skeleton-cell--short" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DualRingLoader({
  size = 'md',
  className = '',
  label,
}: {
  size?: LoaderSize;
  className?: string;
  label?: string;
}) {
  const accessibilityProps = label
    ? { role: 'status' as const, 'aria-label': label }
    : { 'aria-hidden': true };

  return (
    <span className={`hp-dual-ring hp-dual-ring--${size} ${className}`} {...accessibilityProps}>
      <span className="hp-dual-ring-orbit hp-dual-ring-orbit--outer" />
      <span className="hp-dual-ring-orbit hp-dual-ring-orbit--inner" />
    </span>
  );
}

/**
 * リング + "loading..." の跳ねる文字。
 * `mark` を渡すとリングの代わりにそのノード（アプリ独自のブランドマークなど）を出す。
 */
export function LoadingIndicator({
  size = 'md',
  className = '',
  label,
  mark,
}: {
  size?: LoaderSize;
  className?: string;
  label?: string;
  mark?: ReactNode;
}) {
  const accessibilityProps = label
    ? { role: 'status' as const, 'aria-label': label }
    : { 'aria-hidden': true };
  const ringSize = size === 'sm' ? 'md' : 'lg';

  return (
    <span className={`hp-loading-indicator hp-loading-indicator--${size} ${className}`} {...accessibilityProps}>
      {mark ?? <DualRingLoader size={ringSize} />}
      <span className="hp-loading-text">
        {Array.from(LOADING_TEXT).map((char, index) => (
          <span key={`loading-letter-${index}`} className="hp-loading-letter" style={{ animationDelay: `${index * 70}ms` }}>
            {char}
          </span>
        ))}
      </span>
    </span>
  );
}

function ScreenLoader({ label, mark }: { label: string; mark?: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="fixed inset-0 z-50 bg-[var(--page-bg)]">
      <div className="hp-skeleton-ring" aria-hidden>
        <LoadingIndicator size="md" mark={mark} />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * アプリ共通のローディング表示。
 * page / inline は skeleton、処理中オーバーレイ用の screen は二重逆回転リングを使う。
 * `mark` でリングを別のノード（ブランドマーク等）に差し替えられる。
 * 色は `--sb-accent-bg`、枠・背景は `--hp-*`（components.css の先頭コメント参照）。
 */
export function HandyPortalLoader({
  label = '読み込んでいます',
  variant = 'page',
  mark,
}: {
  label?: string;
  variant?: LoaderVariant;
  mark?: ReactNode;
}) {
  if (variant === 'screen') return <ScreenLoader label={label} mark={mark} />;
  if (variant === 'inline') return <InlineLoaderSkeleton label={label} mark={mark} />;
  return <PageLoaderSkeleton label={label} mark={mark} />;
}
