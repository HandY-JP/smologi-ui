const THUMBNAIL_SIZES = [96, 240];
const PRIMARY_THUMBNAIL_SIZE = 96;
const THUMBNAIL_PATH_PREFIX = "thumbs/";
function derivedThumbnailUrl(primaryUrl, size) {
  const url = String(primaryUrl ?? "").trim();
  if (!url) return null;
  if (size === PRIMARY_THUMBNAIL_SIZE) return url;
  const suffix = `-${PRIMARY_THUMBNAIL_SIZE}.webp`;
  if (!url.endsWith(suffix)) return null;
  return `${url.slice(0, -suffix.length)}-${size}.webp`;
}
function blobPathnameOf(url) {
  try {
    return new URL(url).pathname.replace(/^\/+/, "") || null;
  } catch {
    return null;
  }
}
export {
  PRIMARY_THUMBNAIL_SIZE,
  THUMBNAIL_PATH_PREFIX,
  THUMBNAIL_SIZES,
  blobPathnameOf,
  derivedThumbnailUrl
};
//# sourceMappingURL=product-thumbnail-url.js.map
