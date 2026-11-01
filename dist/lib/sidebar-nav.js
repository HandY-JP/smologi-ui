const matchesPath = (pathname, base) => pathname === base || pathname.startsWith(base + "/");
function isSidebarNavItemActive(item, pathname) {
  if (item.isActive) return item.isActive(pathname);
  if (item.exactMatch) return pathname === item.href;
  if (item.excludeMatch?.some((m) => pathname.startsWith(m))) return false;
  return matchesPath(pathname, item.href) || (item.activeMatch?.some((match) => matchesPath(pathname, match)) ?? false);
}
function isZeroCssLength(value) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && n === 0;
}
function summarizeSidebarNews(sections) {
  const reasons = [];
  let hasNews = false;
  for (const section of sections) {
    for (const item of section.items) {
      if (!item.dot) continue;
      hasNews = true;
      reasons.push(item.dotReason ?? item.label);
    }
  }
  return { hasNews, reason: reasons.length > 0 ? `\u8981\u5BFE\u5FDC: ${reasons.join("\u3001")}` : void 0 };
}
export {
  isSidebarNavItemActive,
  isZeroCssLength,
  summarizeSidebarNews
};
//# sourceMappingURL=sidebar-nav.js.map