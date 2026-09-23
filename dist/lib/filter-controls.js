function filterDateRangeError(from, to) {
  if (!from || !to) return null;
  return from > to ? "\u958B\u59CB\u65E5\u304C\u7D42\u4E86\u65E5\u3088\u308A\u5F8C\u3067\u3059" : null;
}
function dateRangeActiveCount(from, to) {
  return from || to ? 1 : 0;
}
export {
  dateRangeActiveCount,
  filterDateRangeError
};
//# sourceMappingURL=filter-controls.js.map