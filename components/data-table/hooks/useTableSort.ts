import { useState } from "react";
import type { SortState } from "../types";
import { nextSort } from "../sort";

export function useTableSort(initial: SortState = null) {
  const [sort, setSort] = useState<SortState>(initial);
  const toggleSort = (key: string) => setSort(nextSort(sort, key));
  return { sort, toggleSort };
}
