const GENERIC_COLUMN_SORT_LABELS = { asc: "\u5C0F\u3055\u3044\u9806", desc: "\u5927\u304D\u3044\u9806" };
function availableColumnSortDirs(sort) {
  const list = (sort.available ?? []).filter((dir) => dir === "asc" || dir === "desc");
  return list.length > 0 ? Array.from(new Set(list)) : ["asc", "desc"];
}
function nextColumnSortDir(sort) {
  const dirs = availableColumnSortDirs(sort);
  const preferred = sort.firstDir ?? "asc";
  const first = dirs.includes(preferred) ? preferred : dirs[0];
  if (!sort.dir) return first;
  if (sort.dir === first) {
    const other = first === "asc" ? "desc" : "asc";
    return dirs.includes(other) ? other : null;
  }
  return null;
}
function activeColumnSortLabel(sort) {
  if (!sort || !sort.dir) return null;
  return sort.dir === "asc" ? sort.labels.asc : sort.labels.desc;
}
function isColumnFilterActive(filter) {
  switch (filter.kind) {
    case "text":
      return filter.value.trim() !== "";
    case "numberRange":
      return filter.min.trim() !== "" || filter.max.trim() !== "";
    case "enum":
      return filter.value.length > 0;
    case "boolean":
      return filter.value !== null;
    case "dateRange":
      return filter.from !== "" || filter.to !== "";
    default:
      return false;
  }
}
function anyColumnFilterActive(filters) {
  return Boolean(filters?.some(isColumnFilterActive));
}
function clearColumnFilter(filter) {
  if (!isColumnFilterActive(filter)) return;
  switch (filter.kind) {
    case "text":
      filter.onChange("");
      return;
    case "numberRange":
      filter.onChange({ min: "", max: "" });
      return;
    case "enum":
      filter.onChange([]);
      return;
    case "boolean":
      filter.onChange(null);
      return;
    case "dateRange":
      filter.onChange({ from: "", to: "" });
      return;
    default:
      return;
  }
}
function normalizeColumnNumberInput(raw, allowDecimal = false) {
  const half = raw.replace(/[０-９．－]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 65248)).replace(/[,，\s]/g, "");
  const pattern = allowDecimal ? /-?\d+(?:\.\d+)?/ : /-?\d+/;
  const match = half.match(pattern);
  return match ? match[0] : "";
}
function columnNumberRangeError(min, max) {
  if (min === "" || max === "") return null;
  const a = Number(min);
  const b = Number(max);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return a > b ? "\u4E0B\u9650\u304C\u4E0A\u9650\u3088\u308A\u5927\u304D\u304F\u306A\u3063\u3066\u3044\u307E\u3059" : null;
}
function columnDateRangeError(from, to) {
  if (!from || !to) return null;
  return from > to ? "\u958B\u59CB\u65E5\u304C\u7D42\u4E86\u65E5\u3088\u308A\u5F8C\u3067\u3059" : null;
}
function columnFilterSummary(filter) {
  if (!isColumnFilterActive(filter)) return null;
  switch (filter.kind) {
    case "text":
      return `\u300C${filter.value.trim()}\u300D\u3092\u542B\u3080`;
    case "numberRange": {
      const unit = filter.unit ?? "";
      const prefix = (filter.unitPosition ?? (unit === "\xA5" ? "prefix" : "suffix")) === "prefix";
      const fmt = (v) => prefix ? `${unit}${v}` : `${v}${unit}`;
      if (filter.min && filter.max) return `${fmt(filter.min)}\u301C${fmt(filter.max)}`;
      if (filter.min) return `${fmt(filter.min)}\u4EE5\u4E0A`;
      return `${fmt(filter.max)}\u4EE5\u4E0B`;
    }
    case "enum": {
      const labels = filter.value.map((v) => filter.options.find((o) => o.value === v)?.label ?? v);
      return labels.join("\u30FB");
    }
    case "boolean":
      return filter.value ? filter.trueLabel : filter.falseLabel ?? "\u3044\u3044\u3048";
    case "dateRange":
      if (filter.from && filter.to) return `${filter.from}\u301C${filter.to}`;
      if (filter.from) return `${filter.from}\u4EE5\u964D`;
      return `${filter.to}\u4EE5\u524D`;
    default:
      return null;
  }
}
function singleEnumValue(value) {
  return value ? [value] : [];
}
function singleEnumFromValues(values) {
  return values.length > 0 ? values[values.length - 1] : "";
}
function flagFilterValue(checked) {
  return checked ? true : null;
}
function flagFromFilterValue(value) {
  return value === true;
}
export {
  GENERIC_COLUMN_SORT_LABELS,
  activeColumnSortLabel,
  anyColumnFilterActive,
  availableColumnSortDirs,
  clearColumnFilter,
  columnDateRangeError,
  columnFilterSummary,
  columnNumberRangeError,
  flagFilterValue,
  flagFromFilterValue,
  isColumnFilterActive,
  nextColumnSortDir,
  normalizeColumnNumberInput,
  singleEnumFromValues,
  singleEnumValue
};
//# sourceMappingURL=column-header.js.map