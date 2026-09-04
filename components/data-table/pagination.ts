import type { PaginationState } from "./types";

export function clampPagination(pagination: PaginationState, totalCount: number): PaginationState {
  const pageSize = Math.max(1, pagination.pageSize);
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  return {
    pageSize,
    pageIndex: Math.min(Math.max(0, pagination.pageIndex), pageCount - 1),
  };
}
