// 商品画像の取得（SSRF 対策つき）。amazon-app の product-labels/route.ts の isSafeImageHost / isPrivateAddress と同等。
// https のみ・private/loopback/link-local 宛は拒否・5 秒・2MB・image/* だけ。失敗は null（画像なしで描く）。
import { lookup } from 'node:dns/promises';
import { request } from 'node:https';
import { BlockList, isIP } from 'node:net';

export const IMAGE_TIMEOUT_MS = 5_000;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// 内部・特殊用途のアドレス帯。IPv4-mapped IPv6（::ffff:a.b.c.d / 16進形）も BlockList が IPv4 規則で判定する。
const PRIVATE_RANGES = new BlockList();
for (const [net, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['224.0.0.0', 4], ['240.0.0.0', 4],
] as const) PRIVATE_RANGES.addSubnet(net, prefix, 'ipv4');
for (const [net, prefix] of [['::', 128], ['::1', 128], ['fc00::', 7], ['fe80::', 10], ['ff00::', 8]] as const) PRIVATE_RANGES.addSubnet(net, prefix, 'ipv6');

export function isPrivateAddress(address: string): boolean {
  const ip = address.toLowerCase().replace(/^\[|\]$/g, '');
  const family = isIP(ip);
  if (family === 0) return true; // アドレスとして読めないものは通さない
  return PRIVATE_RANGES.check(ip, family === 4 ? 'ipv4' : 'ipv6');
}

type Resolver = (host: string) => Promise<{ address: string }[]>;

const defaultResolver: Resolver = (host) => lookup(host, { all: true, verbatim: true });

/** 解決した全アドレスが公開のときだけ、接続に使うアドレスを返す（DNS rebinding 対策で、この 1 つに接続を固定する）。 */
export async function resolveSafeImageAddress(hostname: string, resolve: Resolver = defaultResolver): Promise<{ address: string; family: 4 | 6 } | null> {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!host || host === 'localhost' || host.endsWith('.localhost')) return null;
  try {
    const addresses = isIP(host) ? [{ address: host }] : await resolve(host);
    if (addresses.length === 0 || !addresses.every(({ address }) => !isPrivateAddress(address))) return null;
    const address = addresses[0].address;
    return { address, family: isIP(address) === 6 ? 6 : 4 };
  } catch {
    return null;
  }
}

export async function isSafeImageHost(hostname: string, resolve: Resolver = defaultResolver): Promise<boolean> {
  return (await resolveSafeImageAddress(hostname, resolve)) !== null;
}

/** 検証済みの 1 アドレスに接続を固定した https GET（リダイレクトは追わない）。サイズ・型の条件を満たさなければ null。 */
function getPinned(url: URL, pinned: { address: string; family: 4 | 6 }): Promise<Buffer | null> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (value: Buffer | null) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };
    const req = request(
      url,
      {
        method: 'GET',
        timeout: IMAGE_TIMEOUT_MS,
        // 名前解決をやり直さず、検証したアドレスへそのまま接続する（TLS の SNI・証明書検証はホスト名のまま）。
        // Node 20+ の autoSelectFamily は { all: true } で呼び、配列を期待する。
        lookup: (_host, options, callback) => {
          if ((options as { all?: boolean }).all) (callback as (e: Error | null, a: { address: string; family: number }[]) => void)(null, [{ address: pinned.address, family: pinned.family }]);
          else (callback as (e: Error | null, a: string, f: number) => void)(null, pinned.address, pinned.family);
        },
      },
      (res) => {
        const type = String(res.headers['content-type'] || '').toLowerCase();
        const length = Number(res.headers['content-length'] || 0);
        if ((res.statusCode ?? 0) < 200 || (res.statusCode ?? 0) >= 300 || !type.startsWith('image/') || length > MAX_IMAGE_BYTES) {
          res.destroy();
          done(null);
          return;
        }
        const chunks: Buffer[] = [];
        let total = 0;
        res.on('data', (chunk: Buffer) => {
          total += chunk.length;
          if (total > MAX_IMAGE_BYTES) {
            res.destroy();
            done(null);
            return;
          }
          chunks.push(chunk);
        });
        res.on('end', () => done(total > 0 ? Buffer.concat(chunks) : null));
        res.on('error', () => done(null));
        res.on('close', () => done(null));
      },
    );
    req.on('timeout', () => {
      req.destroy();
      done(null);
    });
    req.on('error', () => done(null));
    req.end();
  });
}

/** 画像を取り、react-pdf が確実に読める PNG/JPEG にそろえて返す。取れなければ null。 */
export async function fetchLabelImage(url: string | null | undefined): Promise<Buffer | null> {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null;
    // 既定ポート（443）以外は取りに行かない（内部サービスの別ポートへ向けた SSRF を避ける）。
    if (parsed.port !== '' && parsed.port !== '443') return null;
    const pinned = await resolveSafeImageAddress(parsed.hostname);
    if (!pinned) return null;
    const bytes = await getPinned(parsed, pinned);
    if (!bytes || bytes.length === 0) return null;
    // sharp は画像を使うときだけ読み込む（画像オフの印刷・プレビューでは読み込まない）。
    const sharp = (await import('sharp')).default;
    // 透過は白地に敷く（ラベルは白地）。JPEG にそろえて軽くする。
    return await sharp(bytes).flatten({ background: '#ffffff' }).resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
  } catch {
    return null;
  }
}
