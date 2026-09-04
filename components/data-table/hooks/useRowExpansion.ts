import { useCallback, useReducer, useRef } from "react";

type ExpansionState<Child> = {
  expandedIds: Set<string>;
  revealedIds: Set<string>;
  childCache: Map<string, Child[]>;
  childErrors: Map<string, unknown>;
  loadingIds: Set<string>;
};

type ExpansionAction<Child> =
  | { type: "toggle"; id: string }
  | { type: "loadStart"; id: string }
  | { type: "loadSuccess"; id: string; children: Child[] }
  | { type: "loadError"; id: string; error: unknown };

function reducer<Child>(state: ExpansionState<Child>, action: ExpansionAction<Child>): ExpansionState<Child> {
  switch (action.type) {
    case "toggle": {
      const expandedIds = new Set(state.expandedIds);
      const opening = !expandedIds.has(action.id);
      if (opening) expandedIds.add(action.id);
      else expandedIds.delete(action.id);
      if (!opening) return { ...state, expandedIds };
      const revealedIds = new Set(state.revealedIds).add(action.id);
      return { ...state, expandedIds, revealedIds };
    }
    case "loadStart": {
      const loadingIds = new Set(state.loadingIds).add(action.id);
      const childErrors = new Map(state.childErrors);
      childErrors.delete(action.id);
      return { ...state, loadingIds, childErrors };
    }
    case "loadSuccess": {
      const loadingIds = new Set(state.loadingIds);
      loadingIds.delete(action.id);
      const childCache = new Map(state.childCache).set(action.id, action.children);
      return { ...state, loadingIds, childCache };
    }
    case "loadError": {
      const loadingIds = new Set(state.loadingIds);
      loadingIds.delete(action.id);
      const childErrors = new Map(state.childErrors).set(action.id, action.error);
      return { ...state, loadingIds, childErrors };
    }
    default:
      return state;
  }
}

function initState<Child>(): ExpansionState<Child> {
  return {
    expandedIds: new Set(),
    revealedIds: new Set(),
    childCache: new Map(),
    childErrors: new Map(),
    loadingIds: new Set(),
  };
}

export function useRowExpansion<Row, Child>({
  getRowId,
  getInlineChildren,
  loadChildren,
}: {
  getRowId: (row: Row) => string;
  getInlineChildren?: (row: Row) => Child[] | undefined;
  loadChildren?: (row: Row) => Promise<Child[]>;
}) {
  const [state, dispatch] = useReducer(reducer<Child>, undefined, initState<Child>);
  const inFlightIds = useRef(new Set<string>());

  const requestChildren = useCallback(
    async (row: Row, force = false) => {
      if (!loadChildren) return;
      const id = getRowId(row);
      if (inFlightIds.current.has(id) || (!force && state.childCache.has(id))) return;
      inFlightIds.current.add(id);
      dispatch({ type: "loadStart", id });
      try {
        const children = await loadChildren(row);
        dispatch({ type: "loadSuccess", id, children });
      } catch (requestError) {
        dispatch({ type: "loadError", id, error: requestError });
      } finally {
        inFlightIds.current.delete(id);
      }
    },
    [getRowId, loadChildren, state.childCache],
  );

  const toggleExpanded = useCallback(
    (row: Row) => {
      const id = getRowId(row);
      const opening = !state.expandedIds.has(id);
      const hasInlineChildren = getInlineChildren?.(row) !== undefined;
      dispatch({ type: "toggle", id });
      if (opening && loadChildren && !hasInlineChildren && !state.childCache.has(id)) void requestChildren(row);
    },
    [getInlineChildren, getRowId, loadChildren, requestChildren, state.childCache, state.expandedIds],
  );

  return { ...state, toggleExpanded, requestChildren };
}
