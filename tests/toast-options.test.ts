import { describe, expect, it } from 'vitest';
import { resolveOptions } from '../src/components/Toast';

// スモロジ本体の src/components/ui/toast-options.test.ts から移した。
// 本体は表示時間を 6 秒 / 10 秒で固定していたが、共通パーツでは ToastProvider の既定として渡す
// （defaults に本体の値を渡して同じ結果になることを確かめる）。
const DEFAULTS = { defaultMs: 6000, actionMs: 10000 };

describe('Toast の resolveOptions', () => {
  it('既定の表示時間は provider の既定どおり（通常・アクション付き）でクリック透過しない', () => {
    expect(resolveOptions(undefined, DEFAULTS)).toEqual({ durationMs: 6000, passThrough: false });
    const action = { label: '開く', onClick: () => {} };
    expect(resolveOptions({ action }, DEFAULTS)).toEqual({ durationMs: 10000, action, passThrough: false });
    expect(resolveOptions(8000, DEFAULTS)).toEqual({ durationMs: 8000, passThrough: false });
    expect(resolveOptions({ durationMs: 9000 }, DEFAULTS)).toEqual({ durationMs: 9000, action: undefined, passThrough: false });
  });

  it('passThrough を指定したときだけクリックを下へ通す', () => {
    expect(resolveOptions({ durationMs: 3000, passThrough: true }, DEFAULTS))
      .toEqual({ durationMs: 3000, action: undefined, passThrough: true });
  });

  it('アクション付きでは passThrough を無視する（ボタンを押せなくしない）', () => {
    const action = { label: 'ダウンロード', onClick: () => {} };
    expect(resolveOptions({ action, passThrough: true }, DEFAULTS).passThrough).toBe(false);
  });
});
