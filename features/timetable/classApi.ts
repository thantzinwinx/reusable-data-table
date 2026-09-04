import type { PaginationState, SortState } from "@/components/data-table";
import type { Attendee } from "./AttendeeList";
import { classRows } from "./classMock";
import type { ClassRequestMode, FitnessClass } from "./classTypes";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchClasses(mode: ClassRequestMode = "success", latency = 900): Promise<FitnessClass[]> {
  await wait(latency);
  if (mode === "error") throw new Error("We could not load the class list.");
  if (mode === "empty") return [];
  return classRows;
}

const sortValueByKey: Record<string, (row: FitnessClass) => string | number> = {
  className: (row) => row.className,
  instructor: (row) => row.instructor,
  startTime: (row) => row.startTimeValue,
  attendance: (row) => (row.capacity === 0 ? 0 : row.bookedCount / row.capacity),
  status: (row) => row.status,
};

export async function fetchClassPage(
  sort: SortState,
  pagination: PaginationState,
  mode: ClassRequestMode = "success",
  latency = 650,
): Promise<{ rows: FitnessClass[]; totalCount: number }> {
  await wait(latency);
  if (mode === "error") throw new Error("We could not load the class list.");
  if (mode === "empty") return { rows: [], totalCount: 0 };

  let sorted = classRows;
  if (sort) {
    const getValue = sortValueByKey[sort.key];
    if (getValue) {
      sorted = [...classRows].sort((a, b) => {
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

const failedOnce = new Set<string>();

export async function fetchAttendees(row: FitnessClass): Promise<Attendee[]> {
  await wait(800);
  if (row.id === "class-3" && !failedOnce.has(row.id)) {
    failedOnce.add(row.id);
    throw new Error("Could not load attendees.");
  }
  return [
    { id: `${row.id}-a1`, name: "Mg Kyaw", paymentType: "One-time", bookingStatus: "Checked-in" },
    { id: `${row.id}-a2`, name: "Phyu Phyu", paymentType: "Membership", bookingStatus: "No-show" },
  ];
}
