import type { SortState } from "../types";
import { nextSort } from "../sort";
import { useControllableState } from "./useControllableState";

export function useTableSort({
  sort,
  defaultSort = null,
  onSortChange,
}: {
  sort?: SortState;
  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;
}) {
  const [currentSort, setSort] = useControllableState<SortState>({
    value: sort,
    defaultValue: defaultSort,
    onChange: onSortChange,
  });
  const toggleSort = (key: string) => setSort(nextSort(currentSort, key));
  return { sort: currentSort, toggleSort };
}
