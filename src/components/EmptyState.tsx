'use client';

// 「0件」の共通表示。カード用（EmptyState）と表の行用（EmptyTableRow）の2つ。
//
// フェーズ1では「新しく書くときの受け皿」として置いてある。既存の個別実装を
// 一括で置き換えるのはフェーズ2。新しい一覧はこれを使うこと。
//
// 読み込み中と0件を同じ枠で出せるようにしている（別々に書くと枠がガタつくため）。

import type { ReactNode } from 'react';

const LOADING_TEXT = '読み込み中…';

export function EmptyState({
  message = 'データがありません。',
  loading = false,
  icon,
  description,
  bare = false,
  className = '',
  children,
}: {
  /** 見出し（1行目）。description があるときは太字の見出しとして出す。 */
  message?: ReactNode;
  loading?: boolean;
  /** 円形の淡色背景に載せるアイコン（h-6 w-6 想定）。 */
  icon?: ReactNode;
  /** 見出しの下の補足（小さめ・薄め）。 */
  description?: ReactNode;
  /** true で枠・背景・角丸を付けない（すでに枠のあるカードの中に置くとき）。余白は className で足す。 */
  bare?: boolean;
  className?: string;
  /** 「登録する」ボタンなど、次の一手。 */
  children?: ReactNode;
}) {
  const rich = !loading && (icon != null || description != null);
  return (
    <div className={`${bare ? '' : 'rounded-lg border border-[rgb(var(--line))] bg-[rgb(var(--surface))] '}p-10 text-center text-[14px] leading-[22px] text-[rgb(var(--ink-muted))] ${className}`}>
      {!loading && icon && (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--surface-subtle))] text-[rgb(var(--ink-muted))]">{icon}</div>
      )}
      <p className={rich ? 'font-semibold text-[rgb(var(--ink))]' : undefined}>{loading ? LOADING_TEXT : message}</p>
      {!loading && description && <p className="mt-1 text-[12px] leading-[18px]">{description}</p>}
      {!loading && children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function EmptyTableRow({
  colSpan,
  message = '該当するデータがありません。',
  loading = false,
  className = '',
}: {
  colSpan: number;
  message?: ReactNode;
  loading?: boolean;
  className?: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className={`px-4 py-10 text-center text-[14px] leading-[22px] text-gray-400 ${className}`}>
        {loading ? LOADING_TEXT : message}
      </td>
    </tr>
  );
}
