'use client';

import type { ReactNode } from 'react';
import { SETTINGS_GHOST_BUTTON_CLASS } from '../SettingsRow';
import type { IntegrationTone } from './types';

/** 要対応の帯。文と、対処ボタン 1 つ。bad=赤 / warn=琥珀（ok・off は淡い灰）。 */
export function IntegrationAlert({
  tone = 'bad',
  children,
  actionLabel,
  onAction,
  actionBusy = false,
}: {
  tone?: IntegrationTone;
  children: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionBusy?: boolean;
}) {
  return (
    <div
      role={tone === 'bad' ? 'alert' : 'status'}
      className={`sb-int sb-int-alert sb-int-alert--${tone} mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] px-3.5 py-2.5 text-[13px] leading-[20px]`}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} disabled={actionBusy} className={`${SETTINGS_GHOST_BUTTON_CLASS} !h-7 !px-2.5 !text-[12px] leading-[18px]`}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
