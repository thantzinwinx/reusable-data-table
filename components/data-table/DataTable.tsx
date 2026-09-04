import type { DataTableProps } from "./types";

function displayValue(value: unknown) {
  if (value == null) return "—";
  return String(value);
}

export function DataTable<Row>({ rows, columns, getRowId }: DataTableProps<Row>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getRowId(row)}>
            {columns.map((column) => {
              const value = column.accessor(row);
              return (
                <td key={column.key}>
                  {column.renderCell ? column.renderCell(value, row) : displayValue(value)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
