import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "../DataTable";
import type { TableColumn } from "../types";

type Row = { id: string; name: string; age: number };

const rows: Row[] = [
  { id: "1", name: "Su Su", age: 30 },
  { id: "2", name: "Mg Kyaw", age: 20 },
  { id: "3", name: "Mya Mya", age: 25 },
];

const columns: TableColumn<Row>[] = [
  { key: "name", header: "Name", accessor: (row) => row.name, sortable: true, pinned: "left" },
  { key: "age", header: "Age", accessor: (row) => row.age, sortable: true },
];

const getRowId = (row: Row) => row.id;

describe("DataTable", () => {
  it("renders headers and row values", () => {
    render(<DataTable rows={rows} columns={columns} getRowId={getRowId} />);
    expect(screen.getByRole("columnheader", { name: /name/i })).toBeInTheDocument();
    expect(screen.getByText("Su Su")).toBeInTheDocument();
    expect(screen.getByText("Mg Kyaw")).toBeInTheDocument();
  });

  it("cycles sort none -> asc -> desc -> none", async () => {
    const user = userEvent.setup();
    render(<DataTable rows={rows} columns={columns} getRowId={getRowId} />);
    const sortButton = screen.getByRole("button", { name: /sort by name/i });

    await user.click(sortButton);
    let bodyRows = screen.getAllByRole("row").slice(1);
    expect(within(bodyRows[0]).getByText("Mg Kyaw")).toBeInTheDocument();

    await user.click(sortButton);
    bodyRows = screen.getAllByRole("row").slice(1);
    expect(within(bodyRows[0]).getByText("Su Su")).toBeInTheDocument();

    await user.click(sortButton);
    bodyRows = screen.getAllByRole("row").slice(1);
    expect(within(bodyRows[0]).getByText("Su Su")).toBeInTheDocument();
  });

  it("paginates and disables buttons at boundaries", async () => {
    const user = userEvent.setup();
    render(<DataTable rows={rows} columns={columns} getRowId={getRowId} defaultPagination={{ pageIndex: 0, pageSize: 2 }} />);

    expect(screen.getByText("Su Su")).toBeInTheDocument();
    expect(screen.queryByText("Mya Mya")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous page/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /next page/i }));
    expect(screen.getByText("Mya Mya")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next page/i })).toBeDisabled();
  });

  it("shows inline expansion content immediately", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        getInlineChildren={(row) => (row.id === "1" ? ["child-a"] : [])}
        renderExpandedContent={({ children }) => <span>{children.join(", ") || "No children"}</span>}
      />,
    );
    await user.click(screen.getAllByRole("button", { name: /expand row/i })[0]);
    expect(screen.getByText("child-a")).toBeInTheDocument();
  });

  it("shows lazy loading then success, and retries after failure", async () => {
    const user = userEvent.setup();
    const loadChildren = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(["loaded-child"]);

    render(
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        loadChildren={loadChildren}
        renderExpandedContent={({ children, loading, error, retry }) => {
          if (loading) return <span>Loading...</span>;
          if (error) return <button onClick={retry}>Retry</button>;
          return <span>{children.join(", ")}</span>;
        }}
      />,
    );

    await user.click(screen.getAllByRole("button", { name: /expand row/i })[0]);
    expect(await screen.findByRole("button", { name: /retry/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(await screen.findByText("loaded-child")).toBeInTheDocument();
    expect(loadChildren).toHaveBeenCalledTimes(2);
  });

  it("shows loading skeleton with aria-busy", () => {
    render(<DataTable rows={[]} columns={columns} getRowId={getRowId} loading />);
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
  });

  it("shows empty state when there are no rows", () => {
    render(<DataTable rows={[]} columns={columns} getRowId={getRowId} emptyState="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("shows error state instead of rows", () => {
    render(<DataTable rows={rows} columns={columns} getRowId={getRowId} error="Failed to load" />);
    expect(screen.getByText("Failed to load")).toBeInTheDocument();
    expect(screen.queryByText("Su Su")).not.toBeInTheDocument();
  });
});
