import type { PaginationState } from "../types";
import { clampPagination } from "../pagination";
import { useControllableState } from "./useControllableState";

const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 };

export function useTablePagination({
  count,
  pagination,
  defaultPagination = DEFAULT_PAGINATION,
  onPaginationChange,
}: {
  count: number;
  pagination?: PaginationState;
  defaultPagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
}) {
  const [currentPagination, setPagination] = useControllableState<PaginationState>({
    value: pagination,
    defaultValue: defaultPagination,
    onChange: onPaginationChange,
  });
  const safePagination = clampPagination(currentPagination, count);
  const changePagination = (next: PaginationState) => setPagination(clampPagination(next, count));
  return { pagination: safePagination, changePagination };
}
