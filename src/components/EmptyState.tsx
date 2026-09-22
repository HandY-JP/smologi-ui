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
  className = '',
  children,
}: {
  message?: ReactNode;
  loading?: boolean;
  className?: string;
  /** 「登録する」ボタンなど、次の一手。 */
  children?: ReactNode;
}) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-400 ${className}`}>
      <p>{loading ? LOADING_TEXT : message}</p>
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
      <td colSpan={colSpan} className={`px-4 py-10 text-center text-sm text-gray-400 ${className}`}>
        {loading ? LOADING_TEXT : message}
      </td>
    </tr>
  );
}
