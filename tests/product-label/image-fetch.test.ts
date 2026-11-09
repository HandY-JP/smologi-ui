import { EventEmitter } from 'node:events';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const requestMock = vi.hoisted(() => vi.fn());
vi.mock('node:https', () => ({ request: requestMock }));

import { fetchLabelImage, isPrivateAddress, isSafeImageHost } from '../../src/product-label/pdf/image-fetch';

describe('SSRF 対策', () => {
  it('private / loopback / link-local を拒否する', () => {
    for (const ip of ['127.0.0.1', '10.0.0.5', '192.168.1.1', '169.254.169.254', '172.16.0.1', '172.31.255.1', '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:10.0.0.1', '::ffff:7f00:1', '192.0.0.8', '198.18.0.1', '198.19.255.255', '224.0.0.1', '239.1.1.1', 'ff02::1', '0.1.2.3']) {
      expect(isPrivateAddress(ip), ip).toBe(true);
    }
    for (const ip of ['8.8.8.8', '172.32.0.1', '203.0.113.9', '198.20.0.1', '2606:4700::1111', '::ffff:8.8.8.8']) expect(isPrivateAddress(ip), ip).toBe(false);
  });

  it('ホストは DNS 解決した全アドレスが公開のときだけ通す', async () => {
    expect(await isSafeImageHost('localhost')).toBe(false);
    expect(await isSafeImageHost('a.localhost')).toBe(false);
    expect(await isSafeImageHost('127.0.0.1')).toBe(false);
    expect(await isSafeImageHost('img.example.com', async () => [{ address: '203.0.113.9' }])).toBe(true);
    expect(await isSafeImageHost('img.example.com', async () => [{ address: '203.0.113.9' }, { address: '10.0.0.1' }])).toBe(false);
    expect(await isSafeImageHost('img.example.com', async () => { throw new Error('nx'); })).toBe(false);
  });
});

describe('fetchLabelImage', () => {
  beforeEach(() => {
    requestMock.mockReset();
  });

  it('https 以外・認証情報つき・内部アドレスは取りに行かない', async () => {
    expect(await fetchLabelImage('http://example.com/a.jpg')).toBeNull();
    expect(await fetchLabelImage('https://user:pw@example.com/a.jpg')).toBeNull();
    expect(await fetchLabelImage('https://203.0.113.9:8443/a.jpg')).toBeNull();
    expect(await fetchLabelImage('https://example.com:22/a.jpg')).toBeNull();
    expect(await fetchLabelImage('https://127.0.0.1/a.jpg')).toBeNull();
    expect(await fetchLabelImage('https://[::1]/a.jpg')).toBeNull();
    expect(await fetchLabelImage('not a url')).toBeNull();
    expect(await fetchLabelImage(null)).toBeNull();
    expect(requestMock).not.toHaveBeenCalled();
  });

  it('成功経路: 固定アドレスの lookup が all:true / false の両方で正しい形を返し、画像バイトが得られる', async () => {
    const sharp = (await import('sharp')).default;
    const png = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#336699' } }).png().toBuffer();
    const lookups: unknown[] = [];
    requestMock.mockImplementation((_url: URL, options: { lookup: (h: string, o: object, cb: (...a: unknown[]) => void) => void }, onRes: (res: EventEmitter & { statusCode: number; headers: Record<string, string>; destroy: () => void }) => void) => {
      options.lookup('img.example.com', { all: true }, (...a) => lookups.push(a));
      options.lookup('img.example.com', {}, (...a) => lookups.push(a));
      const req = new EventEmitter() as EventEmitter & { end: () => void; destroy: () => void };
      req.destroy = () => {};
      req.end = () => {
        const res = Object.assign(new EventEmitter(), { statusCode: 200, headers: { 'content-type': 'image/png', 'content-length': String(png.length) }, destroy: () => {} });
        onRes(res);
        res.emit('data', png);
        res.emit('end');
      };
      return req;
    });
    const out = await fetchLabelImage('https://203.0.113.9/a.png');
    expect(out).not.toBeNull();
    expect(out!.length).toBeGreaterThan(0);
    expect((await sharp(out!).metadata()).format).toBe('jpeg');
    expect(lookups).toEqual([
      [null, [{ address: '203.0.113.9', family: 4 }]],
      [null, '203.0.113.9', 4],
    ]);
  });
});
