import { useState } from "react";
import type { PaginationState } from "../types";
import { clampPagination } from "../pagination";

const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 };

export function useTablePagination(count: number, initial: PaginationState = DEFAULT_PAGINATION) {
  const [pagination, setPagination] = useState<PaginationState>(initial);
  const safePagination = clampPagination(pagination, count);
  const changePagination = (next: PaginationState) => setPagination(clampPagination(next, count));
  return { pagination: safePagination, changePagination };
}
