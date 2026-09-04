import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export type SortState = {
  key: string;
  direction: SortDirection;
} | null;

export type SortableValue = string | number | boolean | Date | null | undefined;

export type TableColumn<Row> = {
  key: string;
  header: ReactNode;
  accessor: (row: Row) => unknown;
  renderCell?: (value: unknown, row: Row) => ReactNode;
  sortable?: boolean;
  sortValue?: (row: Row) => SortableValue;
};

export type DataTableProps<Row> = {
  rows: Row[];
  columns: TableColumn<Row>[];
  getRowId: (row: Row) => string;
};
