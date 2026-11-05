// 共通モーダルシェル（Modal / LargeModal / ConfirmDialog）の不変条件を、ソースを読んで機械的に固定する。
// スモロジ本体の src/components/ui/modal-shell.test.ts から、共通パーツ側に属する部分を移した
// （本体に残る「移行済み各モーダルが共通シェルを使っている」検査は本体側に残す）。
// 実レンダリングでの挙動は tests/parts-upstream.test.tsx（jsdom）が見る。
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (name: string) => readFileSync(resolve(__dirname, '../src/components', name), 'utf8');

const MODAL = read('Modal.tsx');
const CONFIRM = read('ConfirmDialog.tsx');
const LARGE_MODAL = read('LargeModal.tsx');

describe('Modal のシェル', () => {
  it('オーバーレイは bg-black/40 に統一されている', () => {
    expect(MODAL).toContain('bg-black/40');
  });

  it('パネルは rounded-xl shadow-xl で縦横センタリングされる', () => {
    expect(MODAL).toContain('rounded-xl bg-[rgb(var(--surface))] shadow-xl');
    expect(MODAL).toContain('items-center justify-center');
  });

  it('高さは max-h で抑え、あふれる本文は内部スクロールになる', () => {
    expect(MODAL).toContain("panelMaxHeightClassName = 'max-h-[85vh]'");
    expect(MODAL).toContain('min-h-0 flex-1 overflow-y-auto');
  });

  it('重ね順は base=z-[70] / over=z-[90] の2段だけ', () => {
    expect(MODAL).toMatch(/base:\s*'z-\[70\]'/);
    expect(MODAL).toMatch(/over:\s*'z-\[90\]'/);
    const layerBlock = /const LAYER_Z[^{]*\{([^}]*)\}/.exec(MODAL)?.[1] ?? '';
    expect(layerBlock.match(/z-\[/g)?.length).toBe(2);
  });

  it('createPortal で body 直下へ出す', () => {
    expect(MODAL).toContain('createPortal(body, document.body)');
  });

  it('スクロールロックは参照カウントで入れ子に耐える', () => {
    expect(MODAL).toContain("document.body.style.overflow = 'hidden'");
    expect(MODAL).toContain('scrollLockCount');
  });

  it('role / aria-modal / ラベル付けがある', () => {
    expect(MODAL).toContain("role?: 'dialog' | 'alertdialog'");
    expect(MODAL).toContain("'aria-modal': true");
    expect(MODAL).toContain("'aria-labelledby': titleId");
  });

  it('Escape と背景クリックはどちらも dismissable（closable）で制御される', () => {
    expect(MODAL).toContain('useEscapeDismiss(closable, requestClose)');
    expect(MODAL).toContain('closeOnBackdrop = true');
    expect(MODAL).toContain('const backdropClosable = closeOnBackdrop && closable;');
    expect(MODAL).toContain('event.target === event.currentTarget && backdropClosable');
  });

  describe('dirty（入力途中の確認バー）', () => {
    it('dirty のときは背景クリック・Escape で直接 onClose を呼ばず、確認バーを挟む', () => {
      expect(MODAL).toContain('dirty?: boolean');
      expect(MODAL).toContain('const requestClose = () => {');
      expect(MODAL).toContain('if (dirty) { setConfirmDirtyClose(true); return; }');
      expect(MODAL).toContain('backdropClosable) requestClose()');
      expect(MODAL).toContain('useEscapeDismiss(closable, requestClose)');
    });

    it('確認バーは ConfirmDialog を入れ子にせず、モーダル自身のフッター上に出す', () => {
      expect(MODAL).toContain('入力内容が失われます。閉じますか');
      expect(MODAL).not.toMatch(/from '\.\/ConfirmDialog'/);
    });

    it('LargeModal は dirty をそのまま Modal へ橋渡しする', () => {
      expect(LARGE_MODAL).toContain('dirty = false');
      expect(LARGE_MODAL).toContain('dirty={dirty}');
    });
  });

  it('Escape は最前面のモーダルだけが受け取る', () => {
    expect(MODAL).toContain('escapeStack[escapeStack.length - 1] !== token');
    expect(MODAL).toContain("document.addEventListener('keydown', onKeyDown, true)");
    expect(MODAL).toContain('event.stopPropagation()');
  });

  it('useDismiss（外側クリック＋Escape）を export している', () => {
    expect(MODAL).toContain('export function useDismiss');
    expect(MODAL).toContain("document.addEventListener('mousedown', onMouseDown, true)");
  });
});

describe('LargeModal', () => {
  // 本体は 2026-09-23 に背景クリックで閉じる既定へ統一したが、共通パーツは他アプリの従来挙動を
  // 変えないため既定 false。本体は呼び出し側で closeOnBackdrop を明示して合わせる。
  it('closeOnBackdrop の既定は false（本体は呼び出し側で明示する）で、Modal へ橋渡しする', () => {
    expect(LARGE_MODAL).toMatch(/closeOnBackdrop = false,/);
    expect(LARGE_MODAL).toContain('closeOnBackdrop={closeOnBackdrop}');
  });
});

describe('ConfirmDialog', () => {
  it('シェルは Modal に委ねる', () => {
    expect(CONFIRM).toContain("from './Modal'");
    expect(CONFIRM).not.toContain('fixed inset-0');
  });

  it('背景クリックの可否は呼び出し側から渡せる（破壊的確認は closeOnBackdrop={false} を渡す）', () => {
    expect(CONFIRM).toContain('closeOnBackdrop?: boolean;');
    expect(CONFIRM).toContain('closeOnBackdrop={closeOnBackdrop}');
  });

  it('アイコン・danger/primary の2トーン・実行中スピナーを持つ', () => {
    expect(CONFIRM).toContain('TONE_ICON');
    expect(CONFIRM).toMatch(/danger:\s*'bg-\[rgb\(var\(--danger-soft\)\)\] text-\[rgb\(var\(--danger-ink\)\)\]'/);
    expect(CONFIRM).toMatch(/primary:\s*'bg-\[rgb\(var\(--accent-soft\)\)\] text-\[rgb\(var\(--accent-ink\)\)\]'/);
    expect(CONFIRM).toContain('animate-spin');
  });

  it('実行中（busy）は Escape・背景クリックで閉じない', () => {
    expect(CONFIRM).toContain('dismissable={!busy}');
  });

  it('alertdialog として読み上げる', () => {
    expect(CONFIRM).toContain('role="alertdialog"');
  });
});
