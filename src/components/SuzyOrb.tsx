'use client';

/**
 * チャット見出しのスージーの丸（v0.21.0）。32px の色付きグラデーションの丸に白い星 16px。
 * thinking（答えを待っている間）は丸のふちを色の線がくるくる回る（SuzyLauncher と同じ輪）。
 */
import type { CSSProperties } from 'react';
import { SuzySparkle } from './SuzySparkle';

export interface SuzyOrbProps {
  /** 丸の直径（px）。既定 32。星はその半分。 */
  size?: number;
  /** スージーが答えを考えている間 true。 */
  thinking?: boolean;
  /** 夜のおやすみ中 true（星が少し暗くなる）。 */
  night?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function SuzyOrb({ size = 32, thinking = false, night = false, className, style }: SuzyOrbProps) {
  const state = thinking ? 'thinking' : night ? 'night' : 'idle';
  return (
    <span
      className={['suzy-orb', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, ...style }}
      data-state={state}
    >
      <SuzySparkle size={Math.round(size / 2)} tone="white" state={state} />
      {thinking && <span className="suzy-ring" aria-hidden="true" data-testid="suzy-ring" />}
    </span>
  );
}
