// 絞り込みポップオーバー（FilterPopover）の「外側クリック・Escape で閉じる」の取り決め。
// スモロジ本体の src/components/ui/filter-popover-dismiss.test.ts から、共通パーツ側の検査を移した
// （出荷依頼の作成モーダルの商品検索に関する検査は本体側に残る）。
// 経緯（2026-09-29 オーナー指摘）: 検索欄などを押しても閉じず、Escape はモーダルごと閉じていた。
// 共通の useDismiss（Modal.tsx）へ寄せて直した。
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const POPOVER = readFileSync(resolve(__dirname, '../src/components/FilterPopover.tsx'), 'utf8');

describe('FilterPopover の閉じ方', () => {
  it('共通の useDismiss（外側 mousedown を capture で拾い、Escape はモーダルと同じスタック）を使う', () => {
    expect(POPOVER).toContain("import { useDismiss } from './Modal'");
    expect(POPOVER).toMatch(/useDismiss\(panelPortal \? panelRef : rootRef, dismiss, \{ enabled: open, ignore: rootRef \}\)/);
  });

  it('独自の document リスナー（bubble の mousedown / keydown）を持たない', () => {
    expect(POPOVER).not.toContain("document.addEventListener('mousedown'");
    expect(POPOVER).not.toContain("document.addEventListener('keydown'");
  });

  it('portal したパネルも「内側」として扱う（パネル内の選択肢の操作では閉じない）', () => {
    expect(POPOVER).toContain('ref={(node) => { panelRef.current = node; setPanelNode(node); }}');
  });

  it('閉じたらフォーカスをじょうご（トリガー）へ戻す', () => {
    expect(POPOVER).toMatch(/const dismiss = \(\) => \{\s*setOpen\(false\);\s*rootRef\.current\?\.querySelector<HTMLButtonElement>\('button\[aria-expanded\]'\)\?\.focus/);
  });
});
