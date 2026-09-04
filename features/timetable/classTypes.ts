import type { Attendee } from "./AttendeeList";

export type ClassStatus = "Scheduled" | "Full" | "Cancelled";
export type ClassRequestMode = "success" | "empty" | "error";

export type FitnessClass = {
  id: string;
  className: string;
  instructor: string;
  startTime: string;
  startTimeValue: number;
  endTime: string;
  capacity: number;
  bookedCount: number;
  status: ClassStatus;
  attendees?: Attendee[];
};
