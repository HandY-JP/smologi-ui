'use client';
// 設定モード（2026-09-23）の本文をつくる共通部品。
//
// 設定画面に残っていた独自デザイン（独自のカード枠・独自のタブ・独自のボタン色・独自の余白）は
// この 2 つ（区画＝SettingsSection と フォーム行＝SettingsRow）へ寄せる。決めごと:
//
//   - 枠なし。区画どうしの区切りは**横罫線 1 本**だけ（カードの角丸・影は使わない）。
//   - 区画は「見出し（15px bold）＋ 説明文（12px gray-500）＋ 中身」。
//   - フォーム行は「左ラベル（幅 200px 固定）／右コントロール」の 2 カラム。
//     狭いとき（sm 未満）は縦積み。
//   - 主操作のボタンは 1 画面 1 つだけアクセント塗り（＝道具バーの「保存」）。
//     区画の中のボタンはゴースト（枠線＋白）に統一する。
//
// 検索（「設定を検索」）で区画を絞り込めるよう、見出し・説明・keywords を `searchText` に
// 渡すと、検索語に当たらない区画は自分で消える（呼び出し側が毎回 if を書かなくて済む）。
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { matchesSettingsSearch, useSettingsSearchQuery } from '../lib/settings-search-store';
import type { SettingsLayout } from './SettingsRow';

/**
 * 「この区分の中に、検索語に当たる区画が 1 つでもあるか」を数える箱。
 *
 * 検索で全区画が消えると本文が真っ白になり、壊れたように見える（実機確認で確認）。
 * 区画側が自分の当たり外れを申告し、0 件のときだけ SettingsPage が案内を出す。
 */
const SettingsMatchCtx = createContext<((id: string, matched: boolean) => void) | null>(null);

export function SettingsPage({
  children,
  className = '',
  layout = 'default',
}: {
  children: ReactNode;
  className?: string;
  /** 'default'＝従来（max-w-4xl）。'wide'＝全画面幅（読みやすさの上限は SettingsRow の layout='wide' 側）。 */
  layout?: SettingsLayout;
}) {
  const query = useSettingsSearchQuery();
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const report = useCallback((id: string, isMatch: boolean) => {
    setMatched((prev) => (prev[id] === isMatch ? prev : { ...prev, [id]: isMatch }));
  }, []);
  const hasMatch = Object.values(matched).some(Boolean);
  const trimmed = query.trim();

  // admin-page-tight-top: トップバー（第2行があればサブタブ行）と本文の間を 12px に詰める。
  return (
    <SettingsMatchCtx.Provider value={report}>
      <div className={`admin-page-tight-top ${layout === 'wide' ? 'w-full min-w-0' : 'max-w-4xl'} ${className}`}>
        {children}
        {trimmed && !hasMatch && (
          <p className="py-10 text-[14px] leading-[22px] text-[rgb(var(--ink-muted))]">
            この区分に「{trimmed}」に当たる設定はありません。左のメニューで別の区分を選んでください。
          </p>
        )}
      </div>
    </SettingsMatchCtx.Provider>
  );
}

/**
 * 設定の区画（セクション）。
 * 2 つ目以降は上に横罫線が入る（`SettingsPage` の直下に並べるだけでよい）。
 */
export function SettingsSection({
  title,
  description,
  /** 区画見出しの右に置く小さな操作（「追加」など）。主操作は道具バーへ。 */
  action,
  /** 検索の対象にする語（見出し・説明のほかに拾わせたいもの）。 */
  searchText,
  children,
  id,
  layout = 'default',
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  searchText?: string[];
  children: ReactNode;
  id?: string;
  /** 'default'＝従来の余白・説明文 12px。'wide'＝スモロジ本体（区画 py-7・説明文 13px/68ch・子の間隔 20px）。 */
  layout?: SettingsLayout;
}) {
  const wide = layout === 'wide';
  const query = useSettingsSearchQuery();
  const descriptionText = typeof description === 'string' ? description : undefined;
  const isMatch = matchesSettingsSearch(query, title, descriptionText, ...(searchText ?? []));
  // 当たり外れを親（SettingsPage）へ申告する。0 件のときだけ本文に案内を出すため。
  // 申告は effect で行う（render 中に親の state を触らない）。
  const report = useContext(SettingsMatchCtx);
  useEffect(() => {
    report?.(title, isMatch);
    return () => report?.(title, false);
  }, [report, title, isMatch]);

  if (!isMatch) return null;

  return (
    <section
      id={id}
      className={`border-t border-[rgb(var(--line))] first:border-t-0 first:pt-2 ${wide ? 'min-w-0 py-7' : 'py-6'}`}
      aria-label={title}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className={`text-[15px] font-semibold text-[rgb(var(--ink))] ${wide ? 'leading-6' : 'leading-[22px]'}`}>{title}</h2>
          {description && (
            <p className={wide ? 'mt-1 max-w-[68ch] text-[13px] leading-6 text-[rgb(var(--ink-muted))]' : 'mt-1 text-[12px] leading-5 text-[rgb(var(--ink-muted))]'}>{description}</p>
          )}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      <div className={wide ? 'mt-5 min-w-0 space-y-5' : 'mt-4 space-y-4'}>{children}</div>
    </section>
  );
}

/**
 * 区画の中の小見出し（1 区画に 2 つ以上のかたまりがあるとき）。
 * 区画見出し（15px bold）と行ラベル（14px medium）の間の階層。
 */
export function SettingsSubheading({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <h3 className="text-[13px] leading-[20px] font-semibold text-[rgb(var(--ink))]">{children}</h3>
      {hint && <p className="mt-0.5 max-w-[68ch] text-[12px] leading-5 text-[rgb(var(--ink-muted))]">{hint}</p>}
    </div>
  );
}

/** 値が無い・まだ読めないときの控えめなプレースホルダ。 */
export function SettingsEmpty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-[14px] leading-[22px] text-[rgb(var(--ink-muted))]">{children}</p>;
}

/** 閲覧のみ権限のときに区画の先頭へ出す帯（全区分で同じ文言・同じ見た目にする）。 */
export function SettingsReadOnlyNotice({ children }: { children?: ReactNode }) {
  return (
    <p className="mb-4 rounded-md border border-[rgb(var(--warning-ink)/0.25)] bg-[rgb(var(--warning-soft))] px-3 py-2 text-[14px] leading-[22px] text-[rgb(var(--warning-ink))]">
      {children ?? '閲覧のみの権限です。内容の変更はできません。'}
    </p>
  );
}

/**
 * 区画の中の畳み（2026-09-28 簡素化監査 タスク 4）。
 *
 * - `kind="advanced"`: 既定値のまま使えば困らない項目（「詳細設定」）。既定は閉じる。
 * - `kind="setup"`: 初回セットアップで一度決めた項目（「セットアップの内容を見直す」）。
 *   未セットアップのうちは開いておく（呼び出し側が defaultOpen を渡す）。
 * 設定の検索語が入っている間は、中の項目が見つかるよう開いて出す。
 * 中の項目は畳んでいても保存値はそのまま（見えないだけで、動きは変わらない）。
 */
export function SettingsDisclosure({
  kind = 'advanced',
  title,
  hint,
  defaultOpen = false,
  children,
}: {
  kind?: 'advanced' | 'setup';
  /** 省略時は kind に応じて「詳細設定」／「セットアップの内容を見直す」。 */
  title?: string;
  /** 見出しの右に出す短い補足（「変更あり」など）。 */
  hint?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const query = useSettingsSearchQuery();
  const [open, setOpen] = useState(defaultOpen);
  const forcedOpen = query.trim().length > 0;
  const label = title ?? (kind === 'setup' ? 'セットアップの内容を見直す' : '詳細設定');
  const isOpen = open || forcedOpen;
  return (
    <div className="min-w-0 rounded-md border border-[rgb(var(--line))]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] leading-[22px] font-medium text-[rgb(var(--ink))] hover:bg-[rgb(var(--surface-subtle))]"
      >
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-[rgb(var(--ink-muted))] transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span>{label}</span>
        {hint && <span className="text-[12px] leading-[18px] font-normal text-[rgb(var(--ink-muted))]">{hint}</span>}
      </button>
      {isOpen && <div className="min-w-0 space-y-5 border-t border-[rgb(var(--line))] px-3 py-4">{children}</div>}
    </div>
  );
}
