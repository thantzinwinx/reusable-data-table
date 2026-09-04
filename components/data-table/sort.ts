import type { TableColumn, SortState, SortableValue } from "./types";

function normalize(value: SortableValue): string | number | boolean | null {
  if (value == null) return null;
  if (value instanceof Date) return value.getTime();
  return typeof value === "string" ? value.toLowerCase() : value;
}

export function nextSort(current: SortState, key: string): SortState {
  if (!current || current.key !== key) return { key, direction: "asc" };
  if (current.direction === "asc") return { key, direction: "desc" };
  return null;
}

export function sortRows<Row>(rows: Row[], columns: TableColumn<Row>[], sort: SortState): Row[] {
  if (!sort) return rows;
  const column = columns.find((candidate) => candidate.key === sort.key && candidate.sortable);
  if (!column) return rows;

  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const rawA = column.sortValue ? column.sortValue(a.row) : (column.accessor(a.row) as SortableValue);
      const rawB = column.sortValue ? column.sortValue(b.row) : (column.accessor(b.row) as SortableValue);
      const valueA = normalize(rawA);
      const valueB = normalize(rawB);

      if (valueA == null && valueB == null) return a.index - b.index;
      if (valueA == null) return 1;
      if (valueB == null) return -1;

      let comparison = 0;
      if (typeof valueA === "string" && typeof valueB === "string") {
        comparison = valueA.localeCompare(valueB);
      } else if (valueA < valueB) {
        comparison = -1;
      } else if (valueA > valueB) {
        comparison = 1;
      }

      if (comparison === 0) return a.index - b.index;
      return sort.direction === "asc" ? comparison : -comparison;
    })
    .map(({ row }) => row);
}
