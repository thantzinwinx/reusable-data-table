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
  pinned?: "left" | false;
  width?: number;
  preferredWidth?: number;
  minWidth?: number;
  maxWidth?: number;
};

export type PaginationState = {
  pageIndex: number;
  pageSize: number;
};

export type ExpandedContentArgs<Row, Child> = {
  row: Row;
  children: Child[];
  loading: boolean;
  error: unknown;
  retry: () => void;
};

export type DataTableProps<Row, Child = unknown> = {
  rows: Row[];
  columns: TableColumn<Row>[];
  getRowId: (row: Row) => string;
  pageSizeOptions?: number[];
  loading?: boolean;
  error?: ReactNode;
  emptyState?: ReactNode;
  skeletonRowCount?: number;
  getInlineChildren?: (row: Row) => Child[] | undefined;
  loadChildren?: (row: Row) => Promise<Child[]>;
  renderExpandedContent?: (args: ExpandedContentArgs<Row, Child>) => ReactNode;
  getExpandLabel?: (row: Row, expanded: boolean) => string;
  sort?: SortState;
  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;
  sortingMode?: "client" | "server";
  pagination?: PaginationState;
  defaultPagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  paginationMode?: "client" | "server";
  totalCount?: number;
};
