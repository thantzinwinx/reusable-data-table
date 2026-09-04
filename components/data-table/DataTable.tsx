"use client";

import { useMemo, useState } from "react";
import type { DataTableProps, SortState } from "./types";
import { nextSort, sortRows } from "./sort";

function displayValue(value: unknown) {
  if (value == null) return "—";
  return String(value);
}

export function DataTable<Row>({ rows, columns, getRowId }: DataTableProps<Row>) {
  const [sort, setSort] = useState<SortState>(null);

  const sortedRows = useMemo(() => sortRows(rows, columns, sort), [rows, columns, sort]);

  return (
    <div className="overflow-auto rounded-lg border border-zinc-200">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-zinc-50">
            {columns.map((column) => {
              const active = sort?.key === column.key;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
                  className="border-b border-zinc-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-zinc-500 uppercase"
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => setSort(nextSort(sort, column.key))}
                      className="flex items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
                    >
                      {column.header}
                      <span aria-hidden className="text-zinc-400">
                        {active ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}
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
          {sortedRows.map((row) => (
            <tr key={getRowId(row)} className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50">
              {columns.map((column) => {
                const value = column.accessor(row);
                return (
                  <td key={column.key} className="px-4 py-3 text-zinc-700">
                    {column.renderCell ? column.renderCell(value, row) : displayValue(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
