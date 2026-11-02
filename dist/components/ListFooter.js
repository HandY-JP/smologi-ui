"use client";
import { jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { Pagination, StickyPagerBar } from "./Pagination.js";
import { LIST_PAGE_SIZE_OPTIONS, readStoredPageSize, writeStoredPageSize } from "../lib/list-page-size.js";
function useListPageSize(fallback, {
  storageKey,
  options = LIST_PAGE_SIZE_OPTIONS,
  storage,
  onChange
} = {}) {
  const [value, setValue] = useState(fallback);
  const readStored = storage?.read;
  useEffect(() => {
    if (readStored) {
      setValue(readStored());
      return;
    }
    if (!storageKey) return;
    setValue(readStoredPageSize(storageKey, fallback, options));
  }, [storageKey, readStored]);
  const writeStored = storage?.write;
  const set = useCallback((size) => {
    setValue(size);
    if (writeStored) writeStored(size);
    else if (storageKey) writeStoredPageSize(storageKey, size, options);
    onChange?.(size);
  }, [storageKey, writeStored, onChange]);
  return { value, set, options };
}
function ListFooter({
  total,
  page,
  onPageChange,
  pageSize,
  tone,
  className
}) {
  return /* @__PURE__ */ jsx(StickyPagerBar, { tone, className, children: /* @__PURE__ */ jsx(
    Pagination,
    {
      total,
      page,
      pageSize: pageSize.value,
      onPageChange,
      onPageSizeChange: pageSize.set,
      pageSizeOptions: pageSize.options
    }
  ) });
}
export {
  ListFooter,
  useListPageSize
};
//# sourceMappingURL=ListFooter.js.map
