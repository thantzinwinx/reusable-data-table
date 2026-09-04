"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarX2, RefreshCw, WifiOff } from "lucide-react";
import { DataTable } from "@/components/data-table";
import type { PaginationState, SortState } from "@/components/data-table";
import { AttendeeList } from "@/features/timetable/AttendeeList";
import { Sidebar } from "@/components/ui/Sidebar";
import { Select } from "@/components/ui/Select";
import { fetchAttendees, fetchClassPage, fetchClasses } from "@/features/timetable/classApi";
import { timetableColumns } from "@/features/timetable/classColumns";
import type { ClassRequestMode, FitnessClass } from "@/features/timetable/classTypes";

const stateEnter = "motion-safe:animate-[table-state-in_0.4s_ease-out]";

const focusRing = "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#de674840]";
const segmentedControl = "inline-flex rounded-[10px] border border-[#ddd9d1] bg-[#ebe8e1] p-[3px]";
const segmentedButton = `min-h-[33px] cursor-pointer rounded-[7px] border-0 bg-transparent px-[13px] text-xs font-semibold text-[#6f736f] aria-pressed:bg-white aria-pressed:text-[#292e2d] aria-pressed:shadow-sm ${focusRing}`;

type Payment = {
  id: string;
  memberName: string;
  amount: number;
  method: "Cash" | "Card" | "Mobile Banking";
  status: "Paid" | "Pending" | "Refunded";
  date: string;
};

const payments: Payment[] = [
  { id: "p1", memberName: "Su Su", amount: 120000, method: "Mobile Banking", status: "Paid", date: "2026-09-01" },
  { id: "p2", memberName: "Mg Kyaw", amount: 45000, method: "Cash", status: "Paid", date: "2026-09-02" },
  { id: "p3", memberName: "Mya Mya", amount: 80000, method: "Card", status: "Pending", date: "2026-09-02" },
  { id: "p4", memberName: "Phyu Phyu", amount: 60000, method: "Mobile Banking", status: "Refunded", date: "2026-09-03" },
  { id: "p5", memberName: "Mg Mya", amount: 150000, method: "Card", status: "Paid", date: "2026-09-03" },
];

const paymentStatusClasses: Record<Payment["status"], string> = {
  Paid: "bg-[#e8f3eb] text-[#397251]",
  Pending: "bg-[#fff0df] text-[#a15f22]",
  Refunded: "bg-[#f4eae7] text-[#965848]",
};

const mmkFormatter = new Intl.NumberFormat("en-US");

type DataMode = "client" | "server";
type PreviewState = ClassRequestMode | "loading";

const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 3 };

export default function Home() {
  const [rows, setRows] = useState<FitnessClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [preview, setPreview] = useState<PreviewState>("success");
  const [attendeeMode, setAttendeeMode] = useState<"inline" | "lazy">("inline");
  const [dataMode, setDataMode] = useState<DataMode>("client");
  const [serverSort, setServerSort] = useState<SortState>(null);
  const [serverPagination, setServerPagination] = useState<PaginationState>(DEFAULT_PAGINATION);
  const [totalCount, setTotalCount] = useState(0);
  const requestSequence = useRef(0);

  const loadSchedule = useCallback(async (mode: ClassRequestMode, latency = 650) => {
    const requestId = ++requestSequence.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchClasses(mode, latency);
      if (requestId !== requestSequence.current) return;
      setRows(result);
      setTotalCount(result.length);
    } catch (requestError) {
      if (requestId !== requestSequence.current) return;
      setRows([]);
      setTotalCount(0);
      setError(requestError instanceof Error ? requestError : new Error("Unexpected request failure"));
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  }, []);

  const loadServerSchedule = useCallback(
    async (sort: SortState, pagination: PaginationState, mode: ClassRequestMode = "success", latency = 650) => {
      const requestId = ++requestSequence.current;
      setLoading(true);
      setError(null);
      try {
        const result = await fetchClassPage(sort, pagination, mode, latency);
        if (requestId !== requestSequence.current) return;
        setRows(result.rows);
        setTotalCount(result.totalCount);
      } catch (requestError) {
        if (requestId !== requestSequence.current) return;
        setRows([]);
        setTotalCount(0);
        setError(requestError instanceof Error ? requestError : new Error("Unexpected request failure"));
      } finally {
        if (requestId === requestSequence.current) setLoading(false);
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
          setRows(result);
          setTotalCount(result.length);
        }
      })
      .catch((requestError: unknown) => {
        if (active && requestId === requestSequence.current) {
          setError(requestError instanceof Error ? requestError : new Error("Unexpected request failure"));
        }
      })
      .finally(() => {
        if (active && requestId === requestSequence.current) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updatePreview = (state: PreviewState) => {
    setPreview(state);
    if (state === "loading") {
      requestSequence.current += 1;
      setRows([]);
      setError(null);
      setLoading(true);
      return;
    }
    if (dataMode === "server") void loadServerSchedule(serverSort, serverPagination, state);
    else void loadSchedule(state);
  };

  const updateDataMode = (mode: DataMode) => {
    if (mode === dataMode) return;
    setDataMode(mode);
    setPreview("success");
    setServerSort(null);
    setServerPagination(DEFAULT_PAGINATION);
    if (mode === "server") void loadServerSchedule(null, DEFAULT_PAGINATION);
    else void loadSchedule("success");
  };

  const updateServerSort = (sort: SortState) => {
    const firstPage = { ...serverPagination, pageIndex: 0 };
    setServerSort(sort);
    setServerPagination(firstPage);
    void loadServerSchedule(sort, firstPage);
  };

  const updateServerPagination = (pagination: PaginationState) => {
    setServerPagination(pagination);
    void loadServerSchedule(serverSort, pagination);
  };

  const retryInitial = () => {
    setPreview("success");
    if (dataMode === "server") void loadServerSchedule(serverSort, serverPagination);
    else void loadSchedule("success");
  };

  return (
    <div className="flex min-h-screen bg-[#f4f2ed]">
      <Sidebar />
      <main className="min-w-0 flex-1" id="top">
        <div className="mx-auto w-full max-w-[1320px] px-6 py-8">
          <p className="text-xs font-bold tracking-[0.12em] uppercase">Gym Studio</p>
          <h1 className="mt-3 mb-6 text-4xl font-semibold tracking-tight">Class timetable</h1>

          <div className="mb-4 flex flex-col items-stretch justify-between gap-[18px] md:flex-row md:items-end">
            <div className="grid gap-2 min-[761px]:flex min-[761px]:flex-wrap">
              <fieldset className={segmentedControl}>
                <legend className="sr-only">Data processing mode</legend>
                <button type="button" className={segmentedButton} aria-pressed={dataMode === "client"} onClick={() => updateDataMode("client")}>
                  Client processing
                </button>
                <button type="button" className={segmentedButton} aria-pressed={dataMode === "server"} onClick={() => updateDataMode("server")}>
                  Server processing
                </button>
              </fieldset>
              <fieldset className={segmentedControl}>
                <legend className="sr-only">Attendee loading mode</legend>
                <button
                  type="button"
                  className={segmentedButton}
                  aria-pressed={attendeeMode === "inline"}
                  onClick={() => setAttendeeMode("inline")}
                >
                  Inline attendees
                </button>
                <button
                  type="button"
                  className={segmentedButton}
                  aria-pressed={attendeeMode === "lazy"}
                  onClick={() => setAttendeeMode("lazy")}
                >
                  Lazy attendees
                </button>
              </fieldset>
            </div>
            <div className="flex items-center justify-between gap-[9px] text-[0.72rem] font-semibold text-[#777b77] md:justify-start">
              <span>Preview table state</span>
              <Select<PreviewState>
                ariaLabel="Preview table state"
                value={preview}
                align="right"
                options={[
                  { label: "Live data", value: "success" },
                  { label: "Loading skeleton", value: "loading" },
                  { label: "Empty schedule", value: "empty" },
                  { label: "Fetch error", value: "error" },
                ]}
                onChange={updatePreview}
                triggerClassName={`flex h-9 min-w-[152px] items-center justify-between gap-2 rounded-lg border border-[#dcd8d0] bg-white pl-2.5 pr-2 text-xs text-[#383c3b] ${focusRing}`}
              />
            </div>
          </div>

          <DataTable<FitnessClass, NonNullable<FitnessClass["attendees"]>[number]>
            key={`${attendeeMode}-${dataMode}`}
            rows={rows}
            getRowId={(row) => row.id}
            columns={timetableColumns}
            loading={loading}
            error={
              error ? (
                <div className={`flex flex-col items-center gap-3 ${stateEnter}`}>
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#f7e4de] text-[#c2593a]">
                    <WifiOff size={22} strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-[0.9rem] font-semibold text-[#2c2f2e]">Could not reach the schedule</p>
                    <p className="mx-auto mt-1 max-w-[280px] text-[0.78rem] text-[#8b8e89]">{error.message}</p>
                  </div>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 rounded-lg border border-[#d5d0c8] bg-white px-3 py-[7px] text-[0.75rem] font-semibold text-[#414543] transition-colors hover:bg-[#f7f5f0] ${focusRing}`}
                    onClick={retryInitial}
                  >
                    <RefreshCw size={13} strokeWidth={2} />
                    Try again
                  </button>
                </div>
              ) : undefined
            }
            emptyState={
              <div className={`flex flex-col items-center gap-3 ${stateEnter}`}>
                <span className="grid size-12 place-items-center rounded-2xl bg-[#ece9e2] text-[#8a8d87]">
                  <CalendarX2 size={22} strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-[0.9rem] font-semibold text-[#2c2f2e]">No classes on this schedule</p>
                  <p className="mx-auto mt-1 max-w-[280px] text-[0.78rem] text-[#8b8e89]">
                    Choose another date or add the first class for today.
                  </p>
                </div>
              </div>
            }
            skeletonRowCount={5}
            sortingMode={dataMode}
            sort={dataMode === "server" ? serverSort : undefined}
            onSortChange={dataMode === "server" ? updateServerSort : undefined}
            paginationMode={dataMode}
            pagination={dataMode === "server" ? serverPagination : undefined}
            onPaginationChange={dataMode === "server" ? updateServerPagination : undefined}
            totalCount={dataMode === "server" ? totalCount : undefined}
            defaultPagination={DEFAULT_PAGINATION}
            pageSizeOptions={[3, 5, 10]}
            getInlineChildren={attendeeMode === "inline" ? (row) => row.attendees : undefined}
            loadChildren={attendeeMode === "lazy" ? (row) => fetchAttendees(row) : undefined}
            getExpandLabel={(row, expanded) => `${expanded ? "Collapse" : "Expand"} attendees for ${row.className}`}
            renderExpandedContent={(args) => <AttendeeList {...args} />}
          />

          <div className="mt-12 mb-6 border-t border-[#dedbd3] pt-10">
            <p className="mb-2 text-[0.69rem] font-bold tracking-[0.12em] text-[#858781] uppercase">Reusable component demo</p>
            <div className="flex items-end justify-between gap-6">
              <h2 className="text-2xl font-semibold tracking-tight">Recent Payments</h2>
              <p className="mb-0.5 hidden text-[0.78rem] text-[#81847f] md:block">A different row shape, the same typed table.</p>
            </div>
          </div>
          <DataTable
            rows={payments}
            getRowId={(row) => row.id}
            pageSizeOptions={[3, 5, 10]}
            columns={[
              { key: "memberName", header: "Member", accessor: (row) => row.memberName, sortable: true, pinned: "left" },
              {
                key: "amount",
                header: "Amount",
                accessor: (row) => row.amount,
                sortable: true,
                renderCell: (value) => `${mmkFormatter.format(value as number)} MMK`,
              },
              { key: "method", header: "Method", accessor: (row) => row.method, sortable: true },
              {
                key: "status",
                header: "Status",
                accessor: (row) => row.status,
                sortable: true,
                renderCell: (value, row) => (
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${paymentStatusClasses[row.status]}`}>
                    {String(value)}
                  </span>
                ),
              },
              { key: "date", header: "Date", accessor: (row) => row.date, sortable: true },
            ]}
          />
        </div>
      </main>
    </div>
  );
}
