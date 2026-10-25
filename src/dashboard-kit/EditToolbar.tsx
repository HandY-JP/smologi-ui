'use client';
// 右上の操作。通常は「編集」、編集中は「＋」「やめる」「完了」。色・ガラスは呼び出し側のクラスで渡す。
import { useEffect, useRef } from 'react';

export interface EditToolbarProps {
  editing: boolean;
  onEdit: () => void;
  onAdd: () => void;
  onCancel: () => void;
  onDone: () => void;
  /** 通常のピル（編集・＋・やめる）。 */
  pillClassName: string;
  /** 主ボタン（完了）。 */
  primaryClassName: string;
}

export function EditToolbar({ editing, onEdit, onAdd, onCancel, onDone, pillClassName, primaryClassName }: EditToolbarProps) {
  const doneRef = useRef<HTMLButtonElement | null>(null);
  const editRef = useRef<HTMLButtonElement | null>(null);
  const wasEditing = useRef(false);
  useEffect(() => {
    if (editing) doneRef.current?.focus();
    else if (wasEditing.current) editRef.current?.focus(); // 完了/やめる の後は「編集」へ戻す
    wasEditing.current = editing;
  }, [editing]);

  if (!editing) {
    return (
      <button ref={editRef} type="button" onClick={onEdit} className={pillClassName}>
        編集
      </button>
    );
  }
  return (
    <>
      <button type="button" onClick={onAdd} aria-label="ウィジェットを追加" className={pillClassName}>
        ＋
      </button>
      <button type="button" onClick={onCancel} className={pillClassName}>
        やめる
      </button>
      <button ref={doneRef} type="button" onClick={onDone} className={primaryClassName}>
        完了
      </button>
    </>
  );
}
