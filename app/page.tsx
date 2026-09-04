"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import type { PaginationState, SortState } from "@/components/data-table";
import { AttendeeList, type Attendee } from "@/features/timetable/AttendeeList";
import { Sidebar } from "@/components/ui/Sidebar";

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

type ClassStatus = "Scheduled" | "Full" | "Cancelled";

type FitnessClass = {
  id: string;
  className: string;
  instructor: string;
  startTime: string;
  capacity: number;
  bookedCount: number;
  status: ClassStatus;
  attendees?: Attendee[];
};

const classStatusClasses: Record<ClassStatus, string> = {
  Scheduled: "bg-[#e8f3eb] text-[#397251]",
  Full: "bg-[#fff0df] text-[#a15f22]",
  Cancelled: "bg-[#f2efec] text-[#77736f] line-through",
};

const rows: FitnessClass[] = [
  {
    id: "1",
    className: "Boxing",
    instructor: "Mg Kyaw",
    startTime: "6:30 AM",
    capacity: 20,
    bookedCount: 12,
    status: "Scheduled",
    attendees: [
      { id: "a1", name: "Su Su", paymentType: "Membership", bookingStatus: "Checked-in" },
      { id: "a2", name: "Mya Mya", paymentType: "Package", bookingStatus: "Booked" },
    ],
  },
  {
    id: "2",
    className: "Yoga",
    instructor: "Su Su",
    startTime: "8:00 AM",
    capacity: 15,
    bookedCount: 15,
    status: "Full",
    attendees: [{ id: "a3", name: "Phyu Phyu", paymentType: "One-time", bookingStatus: "Checked-in" }],
  },
  {
    id: "3",
    className: "Gym",
    instructor: "Mg Mya",
    startTime: "9:15 AM",
    capacity: 25,
    bookedCount: 8,
    status: "Cancelled",
    attendees: [],
  },
  {
    id: "4",
    className: "Boxing",
    instructor: "Mya Mya",
    startTime: "10:00 AM",
    capacity: 20,
    bookedCount: 5,
    status: "Scheduled",
    attendees: [{ id: "a4", name: "Mg Kyaw", paymentType: "Package", bookingStatus: "Booked" }],
  },
  {
    id: "5",
    className: "Yoga",
    instructor: "Phyu Phyu",
    startTime: "11:00 AM",
    capacity: 15,
    bookedCount: 10,
    status: "Scheduled",
    attendees: [
      { id: "a5", name: "Su Su", paymentType: "Membership", bookingStatus: "Checked-in" },
      { id: "a6", name: "Mg Mya", paymentType: "One-time", bookingStatus: "No-show" },
    ],
  },
  {
    id: "6",
    className: "Gym",
    instructor: "Mg Kyaw",
    startTime: "1:00 PM",
    capacity: 25,
    bookedCount: 20,
    status: "Scheduled",
    attendees: [{ id: "a7", name: "Mya Mya", paymentType: "Membership", bookingStatus: "Checked-in" }],
  },
  {
    id: "7",
    className: "Boxing",
    instructor: "Su Su",
    startTime: "2:30 PM",
    capacity: 20,
    bookedCount: 18,
    status: "Scheduled",
    attendees: [{ id: "a8", name: "Phyu Phyu", paymentType: "Package", bookingStatus: "Booked" }],
  },
];

const failedOnce = new Set<string>();

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadAttendees(row: FitnessClass): Promise<Attendee[]> {
  await wait(800);
  if (row.id === "3" && !failedOnce.has(row.id)) {
    failedOnce.add(row.id);
    throw new Error("Could not load attendees.");
  }
  return [
    { id: `${row.id}-a1`, name: "Mg Kyaw", paymentType: "One-time", bookingStatus: "Checked-in" },
    { id: `${row.id}-a2`, name: "Phyu Phyu", paymentType: "Membership", bookingStatus: "No-show" },
  ];
}

const sortValueByKey: Record<string, (row: FitnessClass) => string | number> = {
  className: (row) => row.className,
  instructor: (row) => row.instructor,
  startTime: (row) => row.startTime,
  attendance: (row) => row.bookedCount / row.capacity,
  status: (row) => row.status,
};

async function fetchClassPage(sort: SortState, pagination: PaginationState) {
  await wait(500);
  let sorted = rows;
  if (sort) {
    const getValue = sortValueByKey[sort.key];
    if (getValue) {
      sorted = [...rows].sort((a, b) => {
        const valueA = getValue(a);
        const valueB = getValue(b);
        const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        return sort.direction === "asc" ? comparison : -comparison;
      });
    }
  }
  const start = pagination.pageIndex * pagination.pageSize;
  return { rows: sorted.slice(start, start + pagination.pageSize), totalCount: sorted.length };
}

export default function Home() {
  const [mode, setMode] = useState<"client" | "server">("client");
  const [attendeeMode, setAttendeeMode] = useState<"inline" | "lazy">("inline");
  const [serverSort, setServerSort] = useState<SortState>(null);
  const [serverPagination, setServerPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 3 });
  const [serverRows, setServerRows] = useState<FitnessClass[]>([]);
  const [serverTotalCount, setServerTotalCount] = useState(0);
  const [serverLoading, setServerLoading] = useState(false);

  useEffect(() => {
    if (mode !== "server") return;
    let cancelled = false;
    fetchClassPage(serverSort, serverPagination).then((result) => {
      if (cancelled) return;
      setServerRows(result.rows);
      setServerTotalCount(result.totalCount);
      setServerLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [mode, serverSort, serverPagination]);

  const timetableColumns = [
    { key: "className", header: "Class", accessor: (row: FitnessClass) => row.className, sortable: true, pinned: "left" as const },
    { key: "instructor", header: "Instructor", accessor: (row: FitnessClass) => row.instructor, sortable: true },
    { key: "startTime", header: "Time", accessor: (row: FitnessClass) => row.startTime, sortable: true },
    {
      key: "attendance",
      header: "Attendance",
      accessor: (row: FitnessClass) => `${row.bookedCount} / ${row.capacity}`,
      sortValue: (row: FitnessClass) => row.bookedCount / row.capacity,
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      accessor: (row: FitnessClass) => row.status,
      sortable: true,
      renderCell: (value: unknown, row: FitnessClass) => (
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${classStatusClasses[row.status]}`}>
          {String(value)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f4f2ed]">
      <Sidebar />
      <main className="min-w-0 flex-1" id="top">
      <div className="mx-auto w-full max-w-[1320px] px-6 py-8">
      <p className="text-xs font-bold tracking-[0.12em] uppercase">Gym Studio</p>
      <h1 className="mt-3 mb-6 text-4xl font-semibold tracking-tight">Class timetable</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <fieldset className={segmentedControl}>
          <legend className="sr-only">Data processing mode</legend>
          <button type="button" className={segmentedButton} aria-pressed={mode === "client"} onClick={() => setMode("client")}>
            Client processing
          </button>
          <button
            type="button"
            className={segmentedButton}
            aria-pressed={mode === "server"}
            onClick={() => {
              setMode("server");
              setServerLoading(true);
            }}
          >
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

      <DataTable
        rows={mode === "server" ? serverRows : rows}
        getRowId={(row) => row.id}
        pageSizeOptions={[3, 5, 10]}
        columns={timetableColumns}
        loading={mode === "server" ? serverLoading : false}
        sortingMode={mode}
        paginationMode={mode}
        sort={mode === "server" ? serverSort : undefined}
        onSortChange={
          mode === "server"
            ? (next) => {
                setServerLoading(true);
                setServerSort(next);
              }
            : undefined
        }
        pagination={mode === "server" ? serverPagination : undefined}
        onPaginationChange={
          mode === "server"
            ? (next) => {
                setServerLoading(true);
                setServerPagination(next);
              }
            : undefined
        }
        totalCount={mode === "server" ? serverTotalCount : undefined}
        getInlineChildren={attendeeMode === "inline" ? (row) => row.attendees : undefined}
        loadChildren={attendeeMode === "lazy" ? loadAttendees : undefined}
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
