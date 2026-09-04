import type { ReactNode } from "react";

export type ColumnDef<Row> = {
  key: string;
  header: ReactNode;
  accessor: (row: Row) => unknown;
  renderCell?: (value: unknown, row: Row) => ReactNode;
};

export type DataTableProps<Row> = {
  rows: Row[];
  columns: ColumnDef<Row>[];
  getRowId: (row: Row) => string;
};
