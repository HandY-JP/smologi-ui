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
}: {
  children: ReactNode;
  className?: string;
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
      <div className={`admin-page-tight-top max-w-4xl ${className}`}>
        {children}
        {trimmed && !hasMatch && (
          <p className="py-10 text-sm text-gray-500">
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
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  searchText?: string[];
  children: ReactNode;
  id?: string;
}) {
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
      className="border-t border-gray-100 py-6 first:border-t-0 first:pt-2"
      aria-label={title}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
          )}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** 値が無い・まだ読めないときの控えめなプレースホルダ。 */
export function SettingsEmpty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-gray-400">{children}</p>;
}

/** 閲覧のみ権限のときに区画の先頭へ出す帯（全区分で同じ文言・同じ見た目にする）。 */
export function SettingsReadOnlyNotice({ children }: { children?: ReactNode }) {
  return (
    <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
      {children ?? '閲覧のみの権限です。内容の変更はできません。'}
    </p>
  );
}
