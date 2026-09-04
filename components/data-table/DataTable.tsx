"use client";

import { Fragment, useId, useMemo, useRef, useState } from "react";
import type { DataTableProps } from "./types";
import { sortRows } from "./sort";
import { useTableSort } from "./hooks/useTableSort";
import { useTablePagination } from "./hooks/useTablePagination";
import { useRowExpansion } from "./hooks/useRowExpansion";

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

export function DataTable<Row, Child = unknown>({
  rows,
  columns,
  getRowId,
  pageSizeOptions = [10, 25, 50],
  loading = false,
  error,
  emptyState = "No results to show.",
  skeletonRowCount = 5,
  getInlineChildren,
  loadChildren,
  renderExpandedContent,
  getExpandLabel,
}: DataTableProps<Row, Child>) {
  const instanceId = useId();
  const pageSizeId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const hasExpansion = Boolean(renderExpandedContent && (getInlineChildren || loadChildren));
  const { sort, toggleSort } = useTableSort();
  const {
    expandedIds,
    revealedIds,
    childCache,
    childErrors,
    loadingIds,
    toggleExpanded,
    requestChildren,
  } = useRowExpansion<Row, Child>({ getRowId, getInlineChildren, loadChildren });

  const sortedRows = useMemo(() => sortRows(rows, columns, sort), [rows, columns, sort]);
  const { pagination: safePagination, changePagination } = useTablePagination(sortedRows.length);
  const visibleRows = useMemo(() => {
    const start = safePagination.pageIndex * safePagination.pageSize;
    return sortedRows.slice(start, start + safePagination.pageSize);
  }, [sortedRows, safePagination]);

  const count = sortedRows.length;
  const pageCount = Math.max(1, Math.ceil(count / safePagination.pageSize));
  const rangeStart = count === 0 ? 0 : safePagination.pageIndex * safePagination.pageSize + 1;
  const rangeEnd = Math.min(count, rangeStart + visibleRows.length - 1);

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
                        onClick={() => toggleSort(column.key)}
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
              visibleRows.map((row) => {
                const id = getRowId(row);
                const expanded = expandedIds.has(id);
                const inlineChildren = getInlineChildren?.(row);
                const expandable = hasExpansion && (loadChildren != null || inlineChildren !== undefined);
                const children = childCache.get(id) ?? inlineChildren ?? [];
                const childError = childErrors.get(id);
                const childLoading = loadingIds.has(id);
                const regionId = `${instanceId}-expanded-${encodeURIComponent(id)}`;

                return (
                  <Fragment key={id}>
                    <tr className={bodyRow}>
                      {columns.map((column, columnIndex) => {
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
                            <div className="flex min-w-0 items-center gap-2.5">
                              {columnIndex === 0 && expandable ? (
                                <button
                                  type="button"
                                  className={classNames(
                                    "group/expand grid size-[26px] shrink-0 cursor-pointer place-items-center rounded-[7px] border border-[#dfdcd5] bg-white text-[#666967] transition-colors hover:border-[#b9b5ac] hover:text-[#282c2d]",
                                    focusRing,
                                  )}
                                  aria-expanded={expanded}
                                  aria-controls={regionId}
                                  aria-label={getExpandLabel?.(row, expanded) ?? `${expanded ? "Collapse" : "Expand"} row`}
                                  onClick={() => toggleExpanded(row)}
                                >
                                  <span
                                    className="block transition-transform group-aria-expanded/expand:rotate-90 motion-reduce:transition-none"
                                    aria-hidden="true"
                                  >
                                    ›
                                  </span>
                                </button>
                              ) : null}
                              <span>{column.renderCell ? column.renderCell(value, row) : displayValue(value)}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    {expandable ? (
                      <tr aria-hidden={!expanded}>
                        <td className={classNames("bg-[#faf7f2] p-0", expanded && "border-b border-[#ece9e3]")} colSpan={columns.length}>
                          <div
                            id={regionId}
                            aria-hidden={!expanded}
                            className={classNames(
                              "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
                              expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                            )}
                          >
                            <div className="min-h-0 overflow-hidden">
                              {revealedIds.has(id)
                                ? renderExpandedContent?.({
                                    row,
                                    children,
                                    loading: childLoading,
                                    error: childError,
                                    retry: () => void requestChildren(row, true),
                                  })
                                : null}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
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
