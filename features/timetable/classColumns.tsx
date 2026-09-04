import type { TableColumn } from "@/components/data-table";
import type { ClassStatus, FitnessClass } from "./classTypes";

const classStatusClasses: Record<ClassStatus, string> = {
  Scheduled: "bg-[#e8f3eb] text-[#397251]",
  Full: "bg-[#fff0df] text-[#a15f22]",
  Cancelled: "bg-[#f2efec] text-[#77736f] line-through",
};

export const timetableColumns: TableColumn<FitnessClass>[] = [
  { key: "className", header: "Class", accessor: (row) => row.className, sortable: true, pinned: "left" },
  { key: "instructor", header: "Instructor", accessor: (row) => row.instructor, sortable: true },
  { key: "startTime", header: "Time", accessor: (row) => row.startTime, sortable: true },
  {
    key: "attendance",
    header: "Attendance",
    accessor: (row) => `${row.bookedCount} / ${row.capacity}`,
    sortValue: (row) => (row.capacity === 0 ? 0 : row.bookedCount / row.capacity),
    sortable: true,
  },
  {
    key: "status",
    header: "Status",
    accessor: (row) => row.status,
    sortable: true,
    renderCell: (value, row) => (
      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${classStatusClasses[row.status]}`}>
        {String(value)}
      </span>
    ),
  },
];
