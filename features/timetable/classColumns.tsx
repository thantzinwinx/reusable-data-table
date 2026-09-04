import type { TableColumn } from "@/components/data-table";
import type { ClassStatus, FitnessClass } from "./classTypes";

const classStatusClasses: Record<ClassStatus, string> = {
  Scheduled: "bg-[#e8f3eb] text-[#397251]",
  Full: "bg-[#fff0df] text-[#a15f22]",
  Cancelled: "bg-[#f2efec] text-[#77736f] line-through",
};

export const timetableColumns: TableColumn<FitnessClass>[] = [
  {
    key: "className",
    header: "Class",
    accessor: (row) => row.className,
    sortable: true,
    pinned: "left",
    preferredWidth: 300,
    minWidth: 176,
    maxWidth: 300,
  },
  {
    key: "instructor",
    header: "Instructor",
    accessor: (row) => row.instructor,
    sortable: true,
    preferredWidth: 240,
    minWidth: 200,
    maxWidth: 240,
  },
  {
    key: "startTime",
    header: "Time",
    accessor: (row) => `${row.startTime} - ${row.endTime}`,
    sortValue: (row) => row.startTimeValue,
    sortable: true,
    width: 220,
  },
  {
    key: "attendance",
    header: "Attendance",
    accessor: (row) => `${row.bookedCount} / ${row.capacity}`,
    sortValue: (row) => (row.capacity === 0 ? 0 : row.bookedCount / row.capacity),
    sortable: true,
    width: 140,
  },
  {
    key: "status",
    header: "Status",
    accessor: (row) => row.status,
    sortable: true,
    preferredWidth: 350,
    minWidth: 300,
    maxWidth: 420,
    renderCell: (value, row) => (
      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${classStatusClasses[row.status]}`}>
        {String(value)}
      </span>
    ),
  },
];
