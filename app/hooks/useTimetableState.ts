import { useCallback, useEffect, useReducer, useRef } from "react";
import type { PaginationState, SortState } from "@/components/data-table";
import { fetchClassPage, fetchClasses } from "@/features/timetable/classApi";
import type { ClassRequestMode, FitnessClass } from "@/features/timetable/classTypes";

export type DataMode = "client" | "server";
export type PreviewState = ClassRequestMode | "loading";

export const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 };

type State = {
  rows: FitnessClass[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  dataMode: DataMode;
  attendeeMode: "inline" | "lazy";
  preview: PreviewState;
  serverSort: SortState;
  serverPagination: PaginationState;
};

type Action =
  | { type: "requestStart" }
  | { type: "requestSuccess"; rows: FitnessClass[]; totalCount: number }
  | { type: "requestError"; error: Error }
  | { type: "setDataMode"; mode: DataMode }
  | { type: "setAttendeeMode"; mode: "inline" | "lazy" }
  | { type: "setPreview"; preview: PreviewState }
  | { type: "forceLoading" }
  | { type: "setServerSort"; sort: SortState }
  | { type: "setServerPagination"; pagination: PaginationState };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "requestStart":
      return { ...state, loading: true, error: null };
    case "requestSuccess":
      return { ...state, loading: false, rows: action.rows, totalCount: action.totalCount };
    case "requestError":
      return { ...state, loading: false, rows: [], totalCount: 0, error: action.error };
    case "setDataMode":
      return {
        ...state,
        dataMode: action.mode,
        preview: "success",
        serverSort: null,
        serverPagination: DEFAULT_PAGINATION,
      };
    case "setAttendeeMode":
      return { ...state, attendeeMode: action.mode };
    case "setPreview":
      return { ...state, preview: action.preview };
    case "forceLoading":
      return { ...state, loading: true, error: null, rows: [] };
    case "setServerSort":
      return { ...state, serverSort: action.sort, serverPagination: { ...state.serverPagination, pageIndex: 0 } };
    case "setServerPagination":
      return { ...state, serverPagination: action.pagination };
    default:
      return state;
  }
}

const initialState: State = {
  rows: [],
  loading: true,
  error: null,
  totalCount: 0,
  dataMode: "client",
  attendeeMode: "inline",
  preview: "success",
  serverSort: null,
  serverPagination: DEFAULT_PAGINATION,
};

export function useTimetableState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const requestSequence = useRef(0);

  const loadSchedule = useCallback(async (mode: ClassRequestMode, latency = 650) => {
    const requestId = ++requestSequence.current;
    dispatch({ type: "requestStart" });
    try {
      const result = await fetchClasses(mode, latency);
      if (requestId !== requestSequence.current) return;
      dispatch({ type: "requestSuccess", rows: result, totalCount: result.length });
    } catch (requestError) {
      if (requestId !== requestSequence.current) return;
      dispatch({
        type: "requestError",
        error: requestError instanceof Error ? requestError : new Error("Unexpected request failure"),
      });
    }
  }, []);

  const loadServerSchedule = useCallback(
    async (sort: SortState, pagination: PaginationState, mode: ClassRequestMode = "success", latency = 650) => {
      const requestId = ++requestSequence.current;
      dispatch({ type: "requestStart" });
      try {
        const result = await fetchClassPage(sort, pagination, mode, latency);
        if (requestId !== requestSequence.current) return;
        dispatch({ type: "requestSuccess", rows: result.rows, totalCount: result.totalCount });
      } catch (requestError) {
        if (requestId !== requestSequence.current) return;
        dispatch({
          type: "requestError",
          error: requestError instanceof Error ? requestError : new Error("Unexpected request failure"),
        });
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;
    const requestId = ++requestSequence.current;
    fetchClasses("success", 900)
      .then((result) => {
        if (active && requestId === requestSequence.current) {
          dispatch({ type: "requestSuccess", rows: result, totalCount: result.length });
        }
      })
      .catch((requestError: unknown) => {
        if (active && requestId === requestSequence.current) {
          dispatch({
            type: "requestError",
            error: requestError instanceof Error ? requestError : new Error("Unexpected request failure"),
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const setAttendeeMode = (mode: "inline" | "lazy") => dispatch({ type: "setAttendeeMode", mode });

  const updatePreview = (preview: PreviewState) => {
    dispatch({ type: "setPreview", preview });
    if (preview === "loading") {
      requestSequence.current += 1;
      dispatch({ type: "forceLoading" });
      return;
    }
    if (state.dataMode === "server") void loadServerSchedule(state.serverSort, state.serverPagination, preview);
    else void loadSchedule(preview);
  };

  const updateDataMode = (mode: DataMode) => {
    if (mode === state.dataMode) return;
    dispatch({ type: "setDataMode", mode });
    if (mode === "server") void loadServerSchedule(null, DEFAULT_PAGINATION);
    else void loadSchedule("success");
  };

  const updateServerSort = (sort: SortState) => {
    const firstPage = { ...state.serverPagination, pageIndex: 0 };
    dispatch({ type: "setServerSort", sort });
    void loadServerSchedule(sort, firstPage);
  };

  const updateServerPagination = (pagination: PaginationState) => {
    dispatch({ type: "setServerPagination", pagination });
    void loadServerSchedule(state.serverSort, pagination);
  };

  const retryInitial = () => {
    dispatch({ type: "setPreview", preview: "success" });
    if (state.dataMode === "server") void loadServerSchedule(state.serverSort, state.serverPagination);
    else void loadSchedule("success");
  };

  return {
    ...state,
    setAttendeeMode,
    updatePreview,
    updateDataMode,
    updateServerSort,
    updateServerPagination,
    retryInitial,
  };
}
