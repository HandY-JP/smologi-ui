'use client';

import { SettingsToggle } from '../SettingsRow';
import type { ProcessToggleItem } from './types';

/**
 * 「使う処理」のスイッチ一覧。押したら onToggle(id, 次の値)。保存・巻き戻しはアプリ側。
 * readOnly の行はスイッチを置かず「常に行います」を出す。
 */
export function ProcessToggleList({
  items,
  onToggle,
}: {
  items: ProcessToggleItem[];
  onToggle: (id: string, next: boolean) => void;
}) {
  return (
    <ul className="sb-int m-0 flex list-none flex-col gap-3 p-0">
      {items.map((it) => (
        <li key={it.id} className="flex items-start gap-2.5">
          <div className="mt-0.5 flex min-w-9 flex-none justify-center">
            {it.readOnly ? null : (
              <SettingsToggle
                id={`sb-int-toggle-${it.id}`}
                label={it.label}
                checked={it.checked}
                disabled={it.disabled || it.saving}
                onChange={(next) => onToggle(it.id, next)}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold">
              {it.label}
              {it.readOnly && <span className="sb-int-chip">{it.readOnlyText ?? '常に行います'}</span>}
              {it.saving && <span className="sb-int-muted text-xs font-normal" aria-live="polite">保存中…</span>}
            </div>
            {it.description && <div className="sb-int-muted text-xs">{it.description}</div>}
          </div>
        </li>
      ))}
    </ul>
  );
}
