# Component Engineering Challenge: Reusable Data Table

This project is for the Component Engineering Challenge: Reusable Data Table.

The goal is to build a reusable `DataTable` component from scratch. It should not be tied to one data shape. To prove this, the same component is used for two things: a gym studio timetable and a payments table. Each has a different row shape.

## Folder structure

```text
app/
├── page.tsx              # demo page (timetable + payments)
├── layout.tsx            # root layout
└── globals.css           # global styles

components/
├── data-table/           # the reusable table, does not know about classes or payments
│   ├── DataTable.tsx     # the table component
│   ├── types.ts          # shared types (TableColumn, DataTableProps, ...)
│   ├── sort.ts           # pure sort helpers
│   ├── pagination.ts     # pure pagination helpers
│   ├── columnWidths.ts   # width math for columns
│   ├── index.ts          # public exports
│   ├── hooks/
│   │   ├── useTableSort.ts
│   │   ├── useTablePagination.ts
│   │   ├── useRowExpansion.ts
│   │   └── useControllableState.ts
│   └── __tests__/
│       └── DataTable.test.tsx
└── ui/                   # small shared UI pieces, not part of the table
    ├── Select.tsx
    └── Sidebar.tsx

features/
└── timetable/            # gym class data, columns, and mock API
    ├── classTypes.ts
    ├── classMock.ts
    ├── classApi.ts
    ├── classColumns.tsx
    └── AttendeeList.tsx
```

The table code never imports from `features/`. Only `features/` and `app/` import from `components/data-table/`. This keeps the table reusable.

## Setup instructions

Install packages:

```bash
pnpm install
```

Run the app:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Run checks:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

No backend is needed. All data is mock data.

## Component API design and how column definitions work

`DataTable` is generic. It does not know about classes or payments. You give it:

```tsx
<DataTable
  rows={rows}
  columns={columns}
  getRowId={(row) => row.id}
/>
```

- `rows` — the data to show.
- `columns` — how to read and show each field.
- `getRowId` — a stable id for each row.

Each column needs a `key`, `header`, and `accessor`:

```tsx
{
  key: "name",
  header: "Name",
  accessor: (row) => row.name,
  sortable: true,
  pinned: "left",
}
```

Other column options:

- `renderCell` — show custom UI instead of plain text.
- `sortable` — turn on the sort button for this column.
- `sortValue` — use a different value for sorting than what is shown.
- `width`, `minWidth`, `maxWidth`, `preferredWidth` — control column size.
- `pinned: "left"` — keep the column stuck on the left when scrolling.

Header and body cells share one width map (see `columnWidths.ts`). This keeps header and row widths the same, even during loading.

## Client-side vs server-side strategy (sort & pagination)

**Sorting.** Click a sortable header to cycle: no sort → ascending → descending → no sort.

- Client mode (`sortingMode="client"`, the default): the table sorts the rows itself.
- Server mode (`sortingMode="server"`): the table does not sort. It calls `onSortChange` and shows whatever rows the parent sends back.

**Pagination.**

- Client mode (`paginationMode="client"`, the default): the table slices the rows itself.
- Server mode (`paginationMode="server"`): the parent gives `totalCount` and only the current page of rows. The table asks for page changes through `onPaginationChange`.

Both sort and pagination can be controlled (`sort`/`pagination` props) or uncontrolled (`defaultSort`/`defaultPagination`). Changing page size always goes back to page 1.

The demo page has a "Client processing / Server processing" switch so both modes are easy to see and test.

## Expandable-rows design for both inline and on-demand child rows

A row can expand to show child rows. This works the same way no matter what the child data looks like.

- **Inline**: use `getInlineChildren`. The data already exists on the row, so it shows right away when the row opens.
- **On-demand (lazy)**: use `loadChildren`. The table calls this function the first time a row opens. While it waits, it shows a loading state. If it fails, it shows an error and a retry button. If it works, the result is saved. Opening the row again does not fetch it a second time.

Both modes use `renderExpandedContent` to draw the actual child UI. The table only manages the open/closed state, loading, error, and cache — it does not know what an "attendee" is.

The demo page has an "Inline attendees / Lazy attendees" switch to see both modes.

## Sticky-column approach

Set `pinned: "left"` on a column to keep it in place while the rest of the table scrolls left and right.

How it works:

- The scroll container (`overflow-auto`) holds both the header and the body, so header and rows scroll together.
- A pinned cell gets `position: sticky` and a `left` value. The `left` value comes from the width of any pinned columns before it. This way, more than one pinned column still lines up right.
- Pinned cells have a solid background color, so row content does not show through them while scrolling.
- When the table is scrolled sideways, a small shadow appears on the right edge of the last pinned column. This makes it clear that more content is hidden underneath.

## State management decision and why

State lives in local React state, not a global store, because this state belongs to one table and one page. A global store would add extra code without solving a real problem here.

Each part of the state has its own small hook:

- `useControllableState` — lets a value be controlled by the parent, or managed inside the table, using the same code.
- `useTableSort` — sort state, built on top of `useControllableState`.
- `useTablePagination` — same idea for pagination.
- `useRowExpansion` — which rows are open, loading, cached, or failed. Uses `useReducer` because these values change together.

## Big dataset

The timetable page uses 1,200 mock class rows. This checks that sorting, paging, and the sticky column still work well with more data.

The table only renders the current page of rows. It does not render all 1,200 at once. This was checked directly: no matter which page is open, only that page's rows are in the HTML.

## Tests

Tests are in `components/data-table/__tests__/DataTable.test.tsx`. They check the important things only:

- sort cycle
- pagination and page limits
- inline expansion
- lazy expansion: loading, error, retry, success
- loading, empty, and error states

## Tradeoffs considered and assumptions made

- **No backend.** Mock functions with a small delay stand in for real API calls. This is enough to show loading, error, and retry behavior.
- **Pinned-left only.** The table can pin columns on the left, not the right. Left is the main use case, like keeping a name column visible.
- **No drag-to-resize columns. No row selection (checkboxes).** These were not required, so they were left out.
- **Pagination state is not saved in the URL.** Page and sort reset on refresh. This could be added later in the page code, without changing `DataTable`.
- **Column width is estimated, not measured exactly.** The table guesses a good width from the header text and a few sample rows. Then it adjusts with min/max rules. This is fast, but not pixel-perfect.
- **`getRowId` must return a unique, stable string.** The table trusts this id for sorting, pagination, and expansion.
