"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { DataTableProps, PaginationState, SortState } from "./types";
import { nextSort, sortRows } from "./sort";
import { clampPagination } from "./pagination";

const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 };

const focusRing =
  "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#de674848]";
const headerCell =
  "h-[46px] border-b border-[#dedbd4] bg-[#f7f6f2] px-[18px] text-left text-[0.72rem] font-semibold tracking-[0.075em] whitespace-nowrap text-[#686b69] uppercase";
const bodyRow =
  "group [&>td]:h-16 [&>td]:border-b [&>td]:border-[#ece9e3] [&>td]:bg-white [&>td]:px-[18px] [&>td]:py-3 [&>td]:transition-colors hover:[&>td]:bg-[#faf9f6] last:[&>td]:border-b-transparent";
const pinnedShadow =
  "after:pointer-events-none after:absolute after:inset-y-0 after:-right-3 after:w-3 after:bg-linear-to-r after:from-black/12 after:to-transparent";

function classNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

function displayValue(value: unknown) {
  if (value == null) return "—";
  return String(value);
}

export function DataTable<Row>({
  rows,
  columns,
  getRowId,
  pageSizeOptions = [10, 25, 50],
  loading = false,
  error,
  emptyState = "No results to show.",
  skeletonRowCount = 5,
}: DataTableProps<Row>) {
  const pageSizeId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<SortState>(null);
  const [pagination, setPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [scrolled, setScrolled] = useState(false);

  const sortedRows = useMemo(() => sortRows(rows, columns, sort), [rows, columns, sort]);
  const safePagination = useMemo(
    () => clampPagination(pagination, sortedRows.length),
    [pagination, sortedRows.length],
  );
  const visibleRows = useMemo(() => {
    const start = safePagination.pageIndex * safePagination.pageSize;
    return sortedRows.slice(start, start + safePagination.pageSize);
  }, [sortedRows, safePagination]);

  const count = sortedRows.length;
  const pageCount = Math.max(1, Math.ceil(count / safePagination.pageSize));
  const rangeStart = count === 0 ? 0 : safePagination.pageIndex * safePagination.pageSize + 1;
  const rangeEnd = Math.min(count, rangeStart + visibleRows.length - 1);

  const changePagination = (next: PaginationState) => setPagination(clampPagination(next, count));
  const lastPinnedKey = [...columns].reverse().find((column) => column.pinned === "left")?.key;
  const paginationHidden = loading || Boolean(error);

  return (
    <div className="w-full min-w-0">
      <div
        ref={scrollRef}
        onScroll={(event) => setScrolled(event.currentTarget.scrollLeft > 1)}
        className="relative w-full overflow-auto overscroll-contain rounded-[14px] border border-[#dedbd4] bg-white [scrollbar-width:thin]"
      >
        <table className="w-full border-separate border-spacing-0 text-sm text-[#272b2d]" aria-busy={loading || undefined}>
          <thead>
            <tr>
              {columns.map((column) => {
                const active = sort?.key === column.key ? sort.direction : null;
                const pinned = column.pinned === "left";
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      column.sortable
                        ? active === "asc"
                          ? "ascending"
                          : active === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                    className={classNames(
                      headerCell,
                      pinned && "sticky left-0 z-[5] bg-[#f7f6f2]",
                      scrolled && pinned && column.key === lastPinnedKey && pinnedShadow,
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className={classNames(
                          "inline-flex min-w-0 cursor-pointer items-center gap-[7px] rounded-[5px] border-0 bg-transparent py-1.5 font-inherit tracking-[inherit] text-inherit uppercase hover:text-[#272b2d]",
                          focusRing,
                        )}
                        onClick={() => setSort(nextSort(sort, column.key))}
                        aria-label={`Sort by ${typeof column.header === "string" ? column.header : column.key}`}
                      >
                        {column.header}
                        <span className="w-3 text-[0.7rem] leading-none text-[#aaa9a3]" aria-hidden="true">
                          {active === "asc" ? "↑" : active === "desc" ? "↓" : "↕"}
                        </span>
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
                <tr key={rowIndex} className={bodyRow}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      <span
                        className="block h-[13px] max-w-[152px] animate-pulse rounded-full bg-[#eeece7] motion-reduce:animate-none"
                        style={{ width: `${58 + (rowIndex % 4) * 10}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td className="h-[190px] border-0 bg-white p-6 text-center text-[#686b69]" colSpan={columns.length}>
                  {error}
                </td>
              </tr>
            ) : visibleRows.length === 0 ? (
              <tr>
                <td className="h-[190px] border-0 bg-white p-6 text-center text-[#686b69]" colSpan={columns.length}>
                  {emptyState}
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr key={getRowId(row)} className={bodyRow}>
                  {columns.map((column) => {
                    const value = column.accessor(row);
                    const pinned = column.pinned === "left";
                    return (
                      <td
                        key={column.key}
                        className={classNames(
                          pinned && "sticky left-0 z-[2] bg-white group-hover:bg-[#faf9f6]",
                          scrolled && pinned && column.key === lastPinnedKey && pinnedShadow,
                        )}
                      >
                        {column.renderCell ? column.renderCell(value, row) : displayValue(value)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        className={classNames(
          "flex items-center justify-between gap-[18px] px-[3px] pt-3.5 text-[0.8rem] text-[#686b69] max-[620px]:flex-wrap",
          paginationHidden && "invisible",
        )}
        aria-label="Pagination"
        aria-hidden={paginationHidden || undefined}
      >
        <div className="flex items-center gap-[9px]">
          <label htmlFor={pageSizeId}>Rows per page</label>
          <select
            id={pageSizeId}
            className={classNames(
              "h-[34px] rounded-lg border border-[#ddd9d1] bg-white py-0 pr-[27px] pl-[9px] font-inherit text-[#3f4343]",
              focusRing,
            )}
            value={safePagination.pageSize}
            onChange={(event) => changePagination({ pageIndex: 0, pageSize: Number(event.target.value) })}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div
          className="flex items-center gap-[9px] max-[620px]:order-3 max-[620px]:w-full max-[620px]:justify-center"
          aria-live="polite"
        >
          <span>
            {rangeStart}–{Math.max(rangeStart, rangeEnd)} of {count}
          </span>
          <span>
            Page {safePagination.pageIndex + 1} of {pageCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className={classNames(
              "inline-flex min-h-[34px] cursor-pointer items-center justify-center rounded-lg border border-[#ddd9d1] bg-white px-[11px] font-inherit font-semibold text-[#3f4343] hover:not-disabled:border-[#aaa69d] hover:not-disabled:bg-[#faf9f6] disabled:cursor-not-allowed disabled:opacity-40",
              focusRing,
            )}
            onClick={() => changePagination({ ...safePagination, pageIndex: safePagination.pageIndex - 1 })}
            disabled={safePagination.pageIndex === 0}
            aria-label="Previous page"
          >
            Previous
          </button>
          <button
            type="button"
            className={classNames(
              "inline-flex min-h-[34px] cursor-pointer items-center justify-center rounded-lg border border-[#ddd9d1] bg-white px-[11px] font-inherit font-semibold text-[#3f4343] hover:not-disabled:border-[#aaa69d] hover:not-disabled:bg-[#faf9f6] disabled:cursor-not-allowed disabled:opacity-40",
              focusRing,
            )}
            onClick={() => changePagination({ ...safePagination, pageIndex: safePagination.pageIndex + 1 })}
            disabled={safePagination.pageIndex >= pageCount - 1}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
