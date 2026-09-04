"use client";

import { CalendarX2, RefreshCw, WifiOff } from "lucide-react";
import { DataTable } from "@/components/data-table";
import type { PreviewState } from "./hooks/useTimetableState";
import { AttendeeList } from "@/features/timetable/AttendeeList";
import { Sidebar } from "@/components/ui/Sidebar";
import { Select } from "@/components/ui/Select";
import { fetchAttendees } from "@/features/timetable/classApi";
import { timetableColumns } from "@/features/timetable/classColumns";
import type { FitnessClass } from "@/features/timetable/classTypes";
import { fetchPaymentItems } from "@/features/payments/paymentApi";
import { payments } from "@/features/payments/paymentMock";
import { paymentColumns } from "@/features/payments/paymentColumns";
import { PaymentItemList } from "@/features/payments/PaymentItemList";
import type { Payment, PaymentItem } from "@/features/payments/paymentTypes";
import { useTimetableState, DEFAULT_PAGINATION } from "./hooks/useTimetableState";
import { usePaymentsState, PAYMENT_DEFAULT_PAGINATION } from "./hooks/usePaymentsState";

const stateEnter = "motion-safe:animate-[table-state-in_0.4s_ease-out]";

const focusRing = "focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#de674840]";
const segmentedControl = "inline-flex rounded-[10px] border border-[#ddd9d1] bg-[#ebe8e1] p-[3px]";
const segmentedButton = `min-h-[33px] cursor-pointer rounded-[7px] border-0 bg-transparent px-[13px] text-xs font-semibold text-[#6f736f] aria-pressed:bg-white aria-pressed:text-[#292e2d] aria-pressed:shadow-sm ${focusRing}`;

export default function Home() {
  const timetable = useTimetableState();
  const paymentsState = usePaymentsState();

  return (
    <div className="flex min-h-screen bg-[#f4f2ed]">
      <Sidebar />
      <main className="min-w-0 flex-1" id="top">
        <div className="mx-auto w-full max-w-[1320px] px-6 py-8">
          <p className="text-xs font-bold tracking-[0.12em] uppercase">Gym Studio</p>
          <h1 className="mt-3 mb-6 text-4xl font-semibold tracking-tight">Class timetable</h1>

          <div className="mb-4 flex flex-col items-stretch justify-between gap-[18px] md:flex-row md:items-end">
            <div className="flex flex-col items-start gap-2 min-[761px]:flex-row min-[761px]:flex-wrap min-[761px]:items-center">
              <fieldset className={segmentedControl}>
                <legend className="sr-only">Data processing mode</legend>
                <button
                  type="button"
                  className={segmentedButton}
                  aria-pressed={timetable.dataMode === "client"}
                  onClick={() => timetable.updateDataMode("client")}
                >
                  Client processing
                </button>
                <button
                  type="button"
                  className={segmentedButton}
                  aria-pressed={timetable.dataMode === "server"}
                  onClick={() => timetable.updateDataMode("server")}
                >
                  Server processing
                </button>
              </fieldset>
              <fieldset className={segmentedControl}>
                <legend className="sr-only">Attendee loading mode</legend>
                <button
                  type="button"
                  className={segmentedButton}
                  aria-pressed={timetable.attendeeMode === "inline"}
                  onClick={() => timetable.setAttendeeMode("inline")}
                >
                  Inline attendees
                </button>
                <button
                  type="button"
                  className={segmentedButton}
                  aria-pressed={timetable.attendeeMode === "lazy"}
                  onClick={() => timetable.setAttendeeMode("lazy")}
                >
                  Lazy attendees
                </button>
              </fieldset>
            </div>
            <div className="flex items-center justify-between gap-[9px] text-[0.72rem] font-semibold text-[#777b77] md:justify-start">
              <span>Preview table state</span>
              <Select<PreviewState>
                ariaLabel="Preview table state"
                value={timetable.preview}
                align="right"
                options={[
                  { label: "Live data", value: "success" },
                  { label: "Loading skeleton", value: "loading" },
                  { label: "Empty schedule", value: "empty" },
                  { label: "Fetch error", value: "error" },
                ]}
                onChange={timetable.updatePreview}
                triggerClassName={`flex h-9 min-w-[152px] items-center justify-between gap-2 rounded-lg border border-[#dcd8d0] bg-white pl-2.5 pr-2 text-xs text-[#383c3b] ${focusRing}`}
              />
            </div>
          </div>

          <DataTable<FitnessClass, NonNullable<FitnessClass["attendees"]>[number]>
            key={`${timetable.attendeeMode}-${timetable.dataMode}`}
            rows={timetable.rows}
            getRowId={(row) => row.id}
            columns={timetableColumns}
            loading={timetable.loading}
            error={
              timetable.error ? (
                <div className={`flex flex-col items-center gap-3 ${stateEnter}`}>
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#f7e4de] text-[#c2593a]">
                    <WifiOff size={22} strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-[0.9rem] font-semibold text-[#2c2f2e]">Could not reach the schedule</p>
                    <p className="mx-auto mt-1 max-w-[280px] text-[0.78rem] text-[#8b8e89]">{timetable.error.message}</p>
                  </div>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 rounded-lg border border-[#d5d0c8] bg-white px-3 py-[7px] text-[0.75rem] font-semibold text-[#414543] transition-colors hover:bg-[#f7f5f0] ${focusRing}`}
                    onClick={timetable.retryInitial}
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
            sortingMode={timetable.dataMode}
            sort={timetable.dataMode === "server" ? timetable.serverSort : undefined}
            onSortChange={timetable.dataMode === "server" ? timetable.updateServerSort : undefined}
            paginationMode={timetable.dataMode}
            pagination={timetable.dataMode === "server" ? timetable.serverPagination : undefined}
            onPaginationChange={timetable.dataMode === "server" ? timetable.updateServerPagination : undefined}
            totalCount={timetable.dataMode === "server" ? timetable.totalCount : undefined}
            defaultPagination={DEFAULT_PAGINATION}
            pageSizeOptions={[10, 25, 50]}
            getInlineChildren={timetable.attendeeMode === "inline" ? (row) => row.attendees : undefined}
            loadChildren={timetable.attendeeMode === "lazy" ? (row) => fetchAttendees(row) : undefined}
            getExpandLabel={(row, expanded) => `${expanded ? "Collapse" : "Expand"} attendees for ${row.className}`}
            renderExpandedContent={(args) => <AttendeeList {...args} />}
          />

          <div className="mt-12 mb-6 border-t border-[#dedbd3] pt-10">
            <p className="mb-2 text-[0.69rem] font-bold tracking-[0.12em] text-[#858781] uppercase">Reusable component demo</p>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Recent Payments</h2>
                <p className="mt-1 text-[0.78rem] text-[#81847f]">
                  A different row shape, with its own server mode and on-demand details.
                </p>
              </div>
              <fieldset className={segmentedControl}>
                <legend className="sr-only">Payments processing mode</legend>
                <button
                  type="button"
                  className={segmentedButton}
                  aria-pressed={paymentsState.mode === "client"}
                  onClick={() => paymentsState.updateMode("client")}
                >
                  Client processing
                </button>
                <button
                  type="button"
                  className={segmentedButton}
                  aria-pressed={paymentsState.mode === "server"}
                  onClick={() => paymentsState.updateMode("server")}
                >
                  Server processing
                </button>
              </fieldset>
            </div>
          </div>
          <DataTable<Payment, PaymentItem>
            key={paymentsState.mode}
            rows={paymentsState.mode === "server" ? paymentsState.rows : payments}
            getRowId={(row) => row.id}
            columns={paymentColumns}
            loading={paymentsState.mode === "server" ? paymentsState.loading : false}
            sortingMode={paymentsState.mode}
            sort={paymentsState.mode === "server" ? paymentsState.serverSort : undefined}
            onSortChange={paymentsState.mode === "server" ? paymentsState.updateServerSort : undefined}
            paginationMode={paymentsState.mode}
            pagination={paymentsState.mode === "server" ? paymentsState.serverPagination : undefined}
            onPaginationChange={paymentsState.mode === "server" ? paymentsState.updateServerPagination : undefined}
            totalCount={paymentsState.mode === "server" ? paymentsState.totalCount : undefined}
            defaultPagination={PAYMENT_DEFAULT_PAGINATION}
            pageSizeOptions={[3, 5, 10]}
            loadChildren={(row) => fetchPaymentItems(row)}
            getExpandLabel={(row, expanded) => `${expanded ? "Collapse" : "Show"} details for ${row.memberName}`}
            renderExpandedContent={(args) => <PaymentItemList {...args} />}
          />
        </div>
      </main>
    </div>
  );
}
