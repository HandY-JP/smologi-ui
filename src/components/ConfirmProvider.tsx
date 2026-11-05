'use client';

// window.confirm / window.alert の置き換え（Promise 版）。
// アプリの根元に <ConfirmProvider> を1つ置き、画面側は
//   const confirm = useConfirm();
//   if (!(await confirm({ title: 'この注文を削除しますか？', confirmLabel: '削除する', tone: 'danger' }))) return;
// のように、ブラウザ標準の confirm と同じ書き味で使う。見た目は ConfirmDialog と同じ。
// 読んでもらうだけの案内は useNotice()（ボタン1つ）。短いお知らせはトースト（useToast）を使うこと。
//
// - 呼び出しが重なったら順番待ち（キュー）にして、前のが閉じてから次を出す。
// - Escape・背景クリック・キャンセルは false（notice は閉じるだけ）。
// - Provider が外れたとき（画面遷移など）、待っている確認は false で終わらせる。

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import type { ModalLayer } from './Modal';

export type ConfirmOptions = {
  /** 見出し。質問の形で短く（例: 「この注文を削除しますか？」）。 */
  title: string;
  /** 補足。改行で段落を分ける。 */
  description?: string;
  /** 実行ボタンの文言。「はい」ではなく具体的な動詞（「削除する」など）にする。 */
  confirmLabel: string;
  /** 既定は「あとで」。 */
  cancelLabel?: string;
  /** 元に戻せない操作は 'danger'。既定は 'default'。 */
  tone?: 'danger' | 'default';
  /** ドロワーより手前に出すか。既定は 'over'（ドロワー・モーダルの上）。 */
  layer?: ModalLayer;
};

export type NoticeOptions = {
  title: string;
  description?: string;
  /** 既定は「OK」。 */
  closeLabel?: string;
  /** 失敗の案内などは 'danger'。既定は 'default'。 */
  tone?: 'danger' | 'default';
  layer?: ModalLayer;
};

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;
export type NoticeFn = (options: NoticeOptions) => Promise<void>;

type Item =
  | { id: number; kind: 'confirm'; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { id: number; kind: 'notice'; options: NoticeOptions; resolve: () => void };

type Api = { confirm: ConfirmFn; notice: NoticeFn };

const ConfirmContext = createContext<Api | null>(null);

export const DEFAULT_CANCEL_LABEL = 'あとで';
export const DEFAULT_NOTICE_LABEL = 'OK';

/** description の改行ごとに1段落にする（空行は捨てる）。 */
export function descriptionToLines(description?: string): string[] {
  return (description ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Item[]>([]);
  const queueRef = useRef<Item[]>([]);
  const nextId = useRef(0);

  const update = useCallback((next: Item[]) => {
    queueRef.current = next;
    setQueue(next);
  }, []);

  const enqueue = useCallback((make: (id: number) => Item) => {
    nextId.current += 1;
    update([...queueRef.current, make(nextId.current)]);
  }, [update]);

  const api = useMemo<Api>(() => ({
    confirm: (options) => new Promise<boolean>((resolve) => enqueue((id) => ({ id, kind: 'confirm', options, resolve }))),
    notice: (options) => new Promise<void>((resolve) => enqueue((id) => ({ id, kind: 'notice', options, resolve }))),
  }), [enqueue]);

  const current = queue[0];
  const settle = useCallback((id: number, value: boolean) => {
    const head = queueRef.current[0];
    if (!head || head.id !== id) return; // 二重クリックなどで同じ確認を二度閉じない
    update(queueRef.current.slice(1));
    if (head.kind === 'confirm') head.resolve(value);
    else head.resolve();
  }, [update]);

  // Provider が消えるとき、待っている確認は「やらない」として終わらせる。
  useEffect(() => () => {
    const rest = queueRef.current;
    queueRef.current = [];
    for (const item of rest) {
      if (item.kind === 'confirm') item.resolve(false);
      else item.resolve();
    }
  }, []);

  return (
    <ConfirmContext.Provider value={api}>
      {children}
      {current && (
        <ConfirmDialog
          key={current.id}
          open
          title={current.options.title}
          lines={descriptionToLines(current.options.description)}
          confirmLabel={current.kind === 'confirm' ? current.options.confirmLabel : (current.options.closeLabel ?? DEFAULT_NOTICE_LABEL)}
          cancelLabel={current.kind === 'confirm' ? (current.options.cancelLabel ?? DEFAULT_CANCEL_LABEL) : undefined}
          hideCancel={current.kind === 'notice'}
          tone={current.options.tone === 'danger' ? 'danger' : 'primary'}
          layer={current.options.layer ?? 'over'}
          onConfirm={() => settle(current.id, true)}
          onClose={() => settle(current.id, false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

function useApi(): Api {
  const api = useContext(ConfirmContext);
  if (!api) throw new Error('useConfirm / useNotice は <ConfirmProvider> の中で使ってください');
  return api;
}

/** `await confirm({...})` で、実行なら true、やめる（キャンセル・Escape・背景クリック）なら false。 */
export function useConfirm(): ConfirmFn {
  return useApi().confirm;
}

/** ボタン1つの案内。閉じられたら解決する。読んでから先へ進んでほしい内容だけに使う。 */
export function useNotice(): NoticeFn {
  return useApi().notice;
}
