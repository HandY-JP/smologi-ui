'use client';

import type { ReactNode } from 'react';
import { TonePill } from '../TonePill';
import type { IntegrationProviderMeta, IntegrationTone } from './types';

const PILL_TONE = { ok: 'ok', warn: 'warn', bad: 'bad', off: 'mute' } as const;

/** 連携先のロゴ（文字の仮置き）。色は accentVar で受ける。 */
export function IntegrationLogo({ meta, size = 'lg' }: { meta: IntegrationProviderMeta; size?: 'sm' | 'lg' }) {
  return (
    <span
      aria-hidden
      className={`sb-int-logo grid flex-none place-items-center font-bold ${
        size === 'lg' ? 'h-12 w-12 rounded-xl text-[15px]' : 'h-9 w-9 rounded-[9px] text-xs'
      }`}
      style={{ backgroundColor: `var(${meta.accentVar}, rgb(var(--accent, 37 99 235)))` }}
    >
      {meta.logoText}
    </span>
  );
}

/** 連携ページの頭。ロゴ・名前・状態ピル・説明・操作ボタン枠（actions）。 */
export function IntegrationHeader({
  meta,
  statusLabel,
  statusTone = 'off',
  description,
  actions,
}: {
  meta: IntegrationProviderMeta;
  statusLabel?: string;
  statusTone?: IntegrationTone;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="sb-int flex flex-wrap items-start gap-4">
      <IntegrationLogo meta={meta} />
      <div className="min-w-[220px] flex-1">
        <h2 className="flex flex-wrap items-center gap-2.5 text-xl font-semibold">
          {meta.label}
          {statusLabel && <TonePill tone={PILL_TONE[statusTone]}>{statusLabel}</TonePill>}
        </h2>
        {description && <p className="sb-int-muted mt-1 text-[13px]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
