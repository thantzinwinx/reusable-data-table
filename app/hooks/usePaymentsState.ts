import { useCallback, useReducer, useRef } from "react";
import type { PaginationState, SortState } from "@/components/data-table";
import { fetchPaymentPage } from "@/features/payments/paymentApi";
import type { Payment } from "@/features/payments/paymentTypes";
import type { DataMode } from "./useTimetableState";

export const PAYMENT_DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 3 };

type State = {
  mode: DataMode;
  rows: Payment[];
  totalCount: number;
  loading: boolean;
  serverSort: SortState;
  serverPagination: PaginationState;
};

type Action =
  | { type: "requestStart" }
  | { type: "requestSuccess"; rows: Payment[]; totalCount: number }
  | { type: "requestSettled" }
  | { type: "setMode"; mode: DataMode }
  | { type: "setServerSort"; sort: SortState }
  | { type: "setServerPagination"; pagination: PaginationState };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "requestStart":
      return { ...state, loading: true };
    case "requestSuccess":
      return { ...state, loading: false, rows: action.rows, totalCount: action.totalCount };
    case "requestSettled":
      return { ...state, loading: false };
    case "setMode":
      return {
        ...state,
        mode: action.mode,
        serverSort: null,
        serverPagination: PAYMENT_DEFAULT_PAGINATION,
      };
    case "setServerSort":
      return { ...state, serverSort: action.sort, serverPagination: { ...state.serverPagination, pageIndex: 0 } };
    case "setServerPagination":
      return { ...state, serverPagination: action.pagination };
    default:
      return state;
  }
}

const initialState: State = {
  mode: "client",
  rows: [],
  totalCount: 0,
  loading: false,
  serverSort: null,
  serverPagination: PAYMENT_DEFAULT_PAGINATION,
};

export function usePaymentsState() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const requestSequence = useRef(0);

  const loadPaymentPage = useCallback(async (sort: SortState, pagination: PaginationState) => {
    const requestId = ++requestSequence.current;
    dispatch({ type: "requestStart" });
    try {
      const result = await fetchPaymentPage(sort, pagination);
      if (requestId !== requestSequence.current) return;
      dispatch({ type: "requestSuccess", rows: result.rows, totalCount: result.totalCount });
    } finally {
      if (requestId === requestSequence.current) dispatch({ type: "requestSettled" });
    }
  }, []);

  const updateMode = (mode: DataMode) => {
    if (mode === state.mode) return;
    dispatch({ type: "setMode", mode });
    if (mode === "server") void loadPaymentPage(null, PAYMENT_DEFAULT_PAGINATION);
  };

  const updateServerSort = (sort: SortState) => {
    const firstPage = { ...state.serverPagination, pageIndex: 0 };
    dispatch({ type: "setServerSort", sort });
    void loadPaymentPage(sort, firstPage);
  };

  const updateServerPagination = (pagination: PaginationState) => {
    dispatch({ type: "setServerPagination", pagination });
    void loadPaymentPage(state.serverSort, pagination);
  };

  return { ...state, updateMode, updateServerSort, updateServerPagination };
}
