import type { TableColumn } from "./types";

const DEFAULT_MIN_WIDTH = 112;
const DEFAULT_PREFERRED_MAX_WIDTH = 360;
const DEFAULT_WIDTH = 160;
const SAMPLE_SIZE = 12;

export type ResolvedColumn<Row> = {
  column: TableColumn<Row>;
  width: number;
  left: number | undefined;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function textEstimate(value: unknown) {
  if (value == null) return 0;
  if (value instanceof Date) return 112;
  if (["string", "number", "boolean"].includes(typeof value)) {
    return String(value).length * 7.4 + 40;
  }
  return DEFAULT_WIDTH;
}

export function resolveColumns<Row>(
  columns: TableColumn<Row>[],
  rows: Row[],
  viewportWidth: number,
): { columns: ResolvedColumn<Row>[]; tableWidth: number } {
  const sample = rows.slice(0, SAMPLE_SIZE);
  const widths = columns.map((column) => {
    const min = column.minWidth ?? DEFAULT_MIN_WIDTH;
    const max = column.maxWidth ?? DEFAULT_PREFERRED_MAX_WIDTH;
    if (column.width != null) return clamp(column.width, min, max);
    if (column.preferredWidth != null) return clamp(column.preferredWidth, min, max);
    const header = typeof column.header === "string" ? textEstimate(column.header) : DEFAULT_WIDTH;
    const content = sample.reduce(
      (largest, row) => Math.max(largest, textEstimate(column.accessor(row))),
      0,
    );
    return clamp(Math.max(header, content, DEFAULT_WIDTH), min, max);
  });

  const flexible = columns
    .map((column, index) => (column.width == null ? index : -1))
    .filter((index) => index >= 0);
  const total = widths.reduce((sum, width) => sum + width, 0);

  if (viewportWidth > total && flexible.length) {
    let remaining = viewportWidth - total;
    let candidates = [...flexible];
    while (remaining > 0.5 && candidates.length) {
      const share = remaining / candidates.length;
      const nextCandidates: number[] = [];
      for (const index of candidates) {
        const max = columns[index].maxWidth ?? Number.POSITIVE_INFINITY;
        const growth = Math.min(share, max - widths[index]);
        widths[index] += Math.max(0, growth);
        remaining -= Math.max(0, growth);
        if (widths[index] < max) nextCandidates.push(index);
      }
      if (nextCandidates.length === candidates.length && share < 0.5) break;
      candidates = nextCandidates;
    }
  } else if (viewportWidth > 0 && viewportWidth < total && flexible.length) {
    let overflow = total - viewportWidth;
    let candidates = [...flexible];
    while (overflow > 0.5 && candidates.length) {
      const share = overflow / candidates.length;
      const nextCandidates: number[] = [];
      for (const index of candidates) {
        const min = columns[index].minWidth ?? DEFAULT_MIN_WIDTH;
        const shrink = Math.min(share, widths[index] - min);
        widths[index] -= Math.max(0, shrink);
        overflow -= Math.max(0, shrink);
        if (widths[index] > min) nextCandidates.push(index);
      }
      if (nextCandidates.length === candidates.length && share < 0.5) break;
      candidates = nextCandidates;
    }
  }

  let pinnedLeft = 0;
  const resolved = columns.map((column, index) => {
    const left = column.pinned === "left" ? pinnedLeft : undefined;
    if (column.pinned === "left") pinnedLeft += widths[index];
    return { column, width: Math.round(widths[index] * 100) / 100, left };
  });

  const tableWidth = resolved.reduce((sum, column) => sum + column.width, 0);
  return { columns: resolved, tableWidth };
}
