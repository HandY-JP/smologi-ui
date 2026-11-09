import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { BlockList, isIP } from "node:net";
const IMAGE_TIMEOUT_MS = 5e3;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const PRIVATE_RANGES = new BlockList();
for (const [net, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4]
]) PRIVATE_RANGES.addSubnet(net, prefix, "ipv4");
for (const [net, prefix] of [["::", 128], ["::1", 128], ["fc00::", 7], ["fe80::", 10], ["ff00::", 8]]) PRIVATE_RANGES.addSubnet(net, prefix, "ipv6");
function isPrivateAddress(address) {
  const ip = address.toLowerCase().replace(/^\[|\]$/g, "");
  const family = isIP(ip);
  if (family === 0) return true;
  return PRIVATE_RANGES.check(ip, family === 4 ? "ipv4" : "ipv6");
}
const defaultResolver = (host) => lookup(host, { all: true, verbatim: true });
async function resolveSafeImageAddress(hostname, resolve = defaultResolver) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host || host === "localhost" || host.endsWith(".localhost")) return null;
  try {
    const addresses = isIP(host) ? [{ address: host }] : await resolve(host);
    if (addresses.length === 0 || !addresses.every(({ address: address2 }) => !isPrivateAddress(address2))) return null;
    const address = addresses[0].address;
    return { address, family: isIP(address) === 6 ? 6 : 4 };
  } catch {
    return null;
  }
}
async function isSafeImageHost(hostname, resolve = defaultResolver) {
  return await resolveSafeImageAddress(hostname, resolve) !== null;
}
function getPinned(url, pinned) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (value) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };
    const req = request(
      url,
      {
        method: "GET",
        timeout: IMAGE_TIMEOUT_MS,
        // 名前解決をやり直さず、検証したアドレスへそのまま接続する（TLS の SNI・証明書検証はホスト名のまま）。
        // Node 20+ の autoSelectFamily は { all: true } で呼び、配列を期待する。
        lookup: (_host, options, callback) => {
          if (options.all) callback(null, [{ address: pinned.address, family: pinned.family }]);
          else callback(null, pinned.address, pinned.family);
        }
      },
      (res) => {
        const type = String(res.headers["content-type"] || "").toLowerCase();
        const length = Number(res.headers["content-length"] || 0);
        if ((res.statusCode ?? 0) < 200 || (res.statusCode ?? 0) >= 300 || !type.startsWith("image/") || length > MAX_IMAGE_BYTES) {
          res.destroy();
          done(null);
          return;
        }
        const chunks = [];
        let total = 0;
        res.on("data", (chunk) => {
          total += chunk.length;
          if (total > MAX_IMAGE_BYTES) {
            res.destroy();
            done(null);
            return;
          }
          chunks.push(chunk);
        });
        res.on("end", () => done(total > 0 ? Buffer.concat(chunks) : null));
        res.on("error", () => done(null));
        res.on("close", () => done(null));
      }
    );
    req.on("timeout", () => {
      req.destroy();
      done(null);
    });
    req.on("error", () => done(null));
    req.end();
  });
}
async function fetchLabelImage(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return null;
    if (parsed.port !== "" && parsed.port !== "443") return null;
    const pinned = await resolveSafeImageAddress(parsed.hostname);
    if (!pinned) return null;
    const bytes = await getPinned(parsed, pinned);
    if (!bytes || bytes.length === 0) return null;
    const sharp = (await import("sharp")).default;
    return await sharp(bytes).flatten({ background: "#ffffff" }).resize({ width: 400, height: 400, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
  } catch {
    return null;
  }
}
export {
  IMAGE_TIMEOUT_MS,
  MAX_IMAGE_BYTES,
  fetchLabelImage,
  isPrivateAddress,
  isSafeImageHost,
  resolveSafeImageAddress
};
//# sourceMappingURL=image-fetch.js.map