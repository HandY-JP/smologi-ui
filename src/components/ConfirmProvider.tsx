'use client';

// window.confirm / window.alert の置き換え（Promise 版）。
// アプリの根元に <ConfirmProvider> を1つ置き、画面側は
//   const confirm = useConfirm();
//   if (!(await confirm({ title: 'この注文を削除しますか？', confirmLabel: '削除する', tone: 'danger' }))) return;
// のように、ブラウザ標準の confirm と同じ書き味で使う。見た目は ConfirmDialog と同じ。
// 読んでもらうだけの案内は useNotice()（ボタン1つ）。短いお知らせはトースト（useToast）を使うこと。
//
// 文字入力が要るもの（window.prompt の置き換え）は usePrompt()。
//   const reason = await prompt({ title: '差し戻し理由', label: '理由', confirmLabel: '差し戻す', required: true });  // 取り消しは null
//
// - 呼び出しが重なったら順番待ち（キュー）にして、前のが閉じてから次を出す。
// - 初期フォーカス: 危険（danger）はキャンセル、それ以外は実行ボタン（Enter = OK）、prompt は入力欄。
// - window の capture で Escape を拾う自前リスナーは isConfirmDialogOpen()（ConfirmDialog.tsx）が true の間は無視すること。
// - Escape・背景クリック・キャンセルは false（notice は閉じるだけ）。
// - Provider が外れたとき（画面遷移など）、待っている確認は false で終わらせる。

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
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
  /** ダイアログ本体に足すクラス。Provider の panelClassName より優先（置き換え）。 */
  panelClassName?: string;
};

export type NoticeOptions = {
  title: string;
  description?: string;
  /** 既定は「OK」。 */
  closeLabel?: string;
  /** 失敗の案内などは 'danger'。既定は 'default'。 */
  tone?: 'danger' | 'default';
  layer?: ModalLayer;
  panelClassName?: string;
};

export type PromptOptions = {
  title: string;
  description?: string;
  /** 入力欄の上のラベル。省略時はラベルなし（title が aria-label を兼ねる）。 */
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  /** true で複数行（textarea）。Enter は改行、Ctrl/⌘+Enter で確定。既定は1行（Enter で確定）。 */
  multiline?: boolean;
  confirmLabel: string;
  /** 既定は「あとで」。 */
  cancelLabel?: string;
  /** true の間は、空白だけの入力では実行ボタンを押せない。 */
  required?: boolean;
  layer?: ModalLayer;
  panelClassName?: string;
};

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;
export type NoticeFn = (options: NoticeOptions) => Promise<void>;
/** 入力された文字列（加工しない）。キャンセル・Escape・背景クリックは null。 */
export type PromptFn = (options: PromptOptions) => Promise<string | null>;

type Item =
  | { id: number; kind: 'confirm'; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { id: number; kind: 'notice'; options: NoticeOptions; resolve: () => void }
  | { id: number; kind: 'prompt'; options: PromptOptions; resolve: (value: string | null) => void };

type Api = { confirm: ConfirmFn; notice: NoticeFn; prompt: PromptFn };

const ConfirmContext = createContext<Api | null>(null);

export const DEFAULT_CANCEL_LABEL = 'あとで';
export const DEFAULT_NOTICE_LABEL = 'OK';

/** description の改行ごとに1段落にする（空行は捨てる）。 */
export function descriptionToLines(description?: string): string[] {
  return (description ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
}

const FIELD_CLASS =
  'mt-3 block w-full rounded-lg border border-[rgb(var(--line-strong))] bg-[rgb(var(--surface))] px-3 py-2 text-[14px] leading-[22px] text-[rgb(var(--ink))] placeholder:text-[rgb(var(--ink-muted))] focus:border-[var(--sb-accent-bg)] focus:outline-none';

/** usePrompt の入力欄。値は入力中だけここで持ち、確定時に onSubmit で渡す。 */
function PromptField({
  options,
  onChange,
  onSubmit,
}: {
  options: PromptOptions;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const id = useId();
  const [value, setValue] = useState(options.defaultValue ?? '');
  // 入力欄が出たとき、初期値を親へ渡す（何も打たずに確定しても defaultValue が返る）
  useEffect(() => { onChange(options.defaultValue ?? ''); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (next: string) => { setValue(next); onChange(next); };
  const common = {
    id,
    value,
    placeholder: options.placeholder,
    'data-autofocus': true,
    className: FIELD_CLASS,
  } as const;
  return (
    <div>
      {options.label && <label htmlFor={id} className="mt-3 block text-[12px] leading-[18px] font-medium text-[rgb(var(--ink))]">{options.label}</label>}
      {options.multiline ? (
        <textarea
          {...common}
          rows={4}
          onChange={(e) => set(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !e.nativeEvent.isComposing) { e.preventDefault(); onSubmit(); }
          }}
        />
      ) : (
        <input
          {...common}
          type="text"
          onChange={(e) => set(e.target.value)}
          onKeyDown={(e) => {
            // IME の変換確定の Enter では送らない（Safari は isComposing が false で keyCode 229 を返す）
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); onSubmit(); }
          }}
        />
      )}
    </div>
  );
}

export function ConfirmProvider({ children, panelClassName }: {
  children: ReactNode;
  /** 全ダイアログに足すクラス（アプリ独自テーマの色合わせ用。例: Seller の rakuten-theme）。呼び出しごとの panelClassName が優先。 */
  panelClassName?: string;
}) {
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
    prompt: (options) => new Promise<string | null>((resolve) => enqueue((id) => ({ id, kind: 'prompt', options, resolve }))),
  }), [enqueue]);

  // 入力中の文字列。キューの先頭が prompt のときだけ使う（key で作り直すので持ち越さない）。
  const promptValue = useRef('');
  const [promptText, setPromptText] = useState('');
  const onPromptChange = useCallback((value: string) => { promptValue.current = value; setPromptText(value); }, []);

  const current = queue[0];
  const settle = useCallback((id: number, value: boolean) => {
    const head = queueRef.current[0];
    if (!head || head.id !== id) return; // 二重クリックなどで同じ確認を二度閉じない
    update(queueRef.current.slice(1));
    if (head.kind === 'confirm') head.resolve(value);
    else if (head.kind === 'prompt') head.resolve(value ? promptValue.current : null);
    else head.resolve();
  }, [update]);

  // Provider が消えるとき、待っている確認は「やらない」として終わらせる。
  useEffect(() => () => {
    const rest = queueRef.current;
    queueRef.current = [];
    for (const item of rest) {
      if (item.kind === 'confirm') item.resolve(false);
      else if (item.kind === 'prompt') item.resolve(null);
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
          confirmLabel={current.kind === 'notice' ? (current.options.closeLabel ?? DEFAULT_NOTICE_LABEL) : current.options.confirmLabel}
          cancelLabel={current.kind === 'notice' ? undefined : (current.options.cancelLabel ?? DEFAULT_CANCEL_LABEL)}
          hideCancel={current.kind === 'notice'}
          tone={current.kind !== 'prompt' && current.options.tone === 'danger' ? 'danger' : 'primary'}
          layer={current.options.layer ?? 'over'}
          panelClassName={current.options.panelClassName ?? panelClassName}
          confirmDisabled={current.kind === 'prompt' && !!current.options.required && promptText.trim() === ''}
          onConfirm={() => settle(current.id, true)}
          onClose={() => settle(current.id, false)}
        >
          {current.kind === 'prompt' && (
            <PromptField
              options={current.options}
              onChange={onPromptChange}
              onSubmit={() => {
                if (current.options.required && promptValue.current.trim() === '') return;
                settle(current.id, true);
              }}
            />
          )}
        </ConfirmDialog>
      )}
    </ConfirmContext.Provider>
  );
}

function useApi(): Api {
  const api = useContext(ConfirmContext);
  if (!api) throw new Error('useConfirm / useNotice / usePrompt は <ConfirmProvider> の中で使ってください');
  return api;
}

/** `await confirm({...})` で、実行なら true、やめる（キャンセル・Escape・背景クリック）なら false。 */
export function useConfirm(): ConfirmFn {
  return useApi().confirm;
}

/**
 * useConfirm の「同時に1つだけ」版。確認が開いている間に同じ画面からもう一度呼ばれたら、
 * 順番待ちに積まず、すぐ false を返す（連打・キーボードの連続入力で、同じ操作の確認が二重に積まれて
 * 二度実行されるのを防ぐ）。確認が閉じたら（OK でもキャンセルでも）また呼べる。
 * 呼び出し側は `const confirm = useConfirmOnce();` と置き換えるだけでよい（使い方は useConfirm と同じ）。
 * 金額・在庫・出荷など、二度走ると困る操作のある画面で使う。
 */
export function useConfirmOnce(): ConfirmFn {
  const confirm = useApi().confirm;
  const pending = useRef(false);
  return useCallback(async (options: ConfirmOptions) => {
    if (pending.current) return false;
    pending.current = true;
    try {
      return await confirm(options);
    } finally {
      pending.current = false;
    }
  }, [confirm]);
}

/** ボタン1つの案内。閉じられたら解決する。読んでから先へ進んでほしい内容だけに使う。 */
export function useNotice(): NoticeFn {
  return useApi().notice;
}

/** `await prompt({...})` で、入力された文字列（加工なし）。やめる（キャンセル・Escape・背景クリック）なら null。window.prompt の置き換え。 */
export function usePrompt(): PromptFn {
  return useApi().prompt;
}
