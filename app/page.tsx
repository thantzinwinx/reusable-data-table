"use client";

import { DataTable } from "@/components/data-table";

type FitnessClass = {
  id: string;
  className: string;
  instructor: string;
  startTime: string;
  capacity: number;
  bookedCount: number;
};

const rows: FitnessClass[] = [
  { id: "1", className: "Boxing", instructor: "Mg Kyaw", startTime: "6:30 AM", capacity: 20, bookedCount: 12 },
  { id: "2", className: "Yoga", instructor: "Su Su", startTime: "8:00 AM", capacity: 15, bookedCount: 15 },
  { id: "3", className: "Gym", instructor: "Mg Mya", startTime: "9:15 AM", capacity: 25, bookedCount: 8 },
  { id: "4", className: "Boxing", instructor: "Mya Mya", startTime: "10:00 AM", capacity: 20, bookedCount: 5 },
  { id: "5", className: "Yoga", instructor: "Phyu Phyu", startTime: "11:00 AM", capacity: 15, bookedCount: 10 },
  { id: "6", className: "Gym", instructor: "Mg Kyaw", startTime: "1:00 PM", capacity: 25, bookedCount: 20 },
  { id: "7", className: "Boxing", instructor: "Su Su", startTime: "2:30 PM", capacity: 20, bookedCount: 18 },
];

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <p className="text-xs font-bold tracking-[0.12em] uppercase">Gym Studio</p>
      <h1 className="mt-3 mb-6 text-4xl font-semibold tracking-tight">Class timetable</h1>
      <DataTable
        rows={rows}
        getRowId={(row) => row.id}
        pageSizeOptions={[3, 5, 10]}
        columns={[
          { key: "className", header: "Class", accessor: (row) => row.className, sortable: true, pinned: "left" },
          { key: "instructor", header: "Instructor", accessor: (row) => row.instructor, sortable: true },
          { key: "startTime", header: "Time", accessor: (row) => row.startTime, sortable: true },
          {
            key: "attendance",
            header: "Attendance",
            accessor: (row) => `${row.bookedCount} / ${row.capacity}`,
            sortValue: (row) => row.bookedCount / row.capacity,
            sortable: true,
          },
        ]}
      />
    </main>
  );
}
