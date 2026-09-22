'use client';
// 枠なし一覧（2026-09-22 ユーザー決定）の見出し帯（StickySectionHeader）の左端に置く
// 「そのグループ／その日付をまとめて選択」チェックボックス。
//
// 入荷ページ（#535）の DateGroupSelectCheckbox をそのまま共通部品へ出したもの。
// 出荷ページの載せ替えで 2 画面目が要るようになったため抽出した
// （入荷ページ側も 2026-09-22 にこの部品へ差し替え済み）。
//
//  - 一部だけ選択されているときは中間状態（indeterminate。DOM プロパティなので ref で設定する）
//  - 帯側にクリック挙動が付いても巻き込まれないよう、クリックは伝播させない
//  - 追従（ガラス化）中の帯は body へ portal されるが、React ツリー上は同じ子なので同じように動く
import { useEffect, useRef } from 'react';

export function GroupSelectCheckbox({ checked, indeterminate, onToggle, label }: {
  checked: boolean;
  indeterminate: boolean;
  onToggle: () => void;
  /** 読み上げ・ツールチップに出す説明（例: 「ひかり便 の出荷をすべて選択」）。 */
  label: string;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <span className="mr-2 flex shrink-0 items-center" onClick={(e) => e.stopPropagation()}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        aria-label={label}
        title={label}
        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[var(--sb-accent-bg)] focus:ring-[var(--sb-accent-bg)]"
      />
    </span>
  );
}
