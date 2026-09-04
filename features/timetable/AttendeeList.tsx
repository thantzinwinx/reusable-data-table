import { Check, CircleAlert, CreditCard, RefreshCw } from "lucide-react";
import type { ExpandedContentArgs } from "@/components/data-table";

export type Attendee = {
  id: string;
  name: string;
  paymentType: "One-time" | "Package" | "Membership";
  bookingStatus: "Booked" | "Checked-in" | "Cancelled" | "No-show";
};

const bookingStatusClasses: Record<Attendee["bookingStatus"], string> = {
  Booked: "bg-[#f2f0ec] text-[#6e716e]",
  "Checked-in": "bg-[#e7f3ea] text-[#397251]",
  Cancelled: "bg-[#f4eae7] text-[#965848]",
  "No-show": "bg-[#f4eae7] text-[#965848]",
};

export function AttendeeList<Row>({ children, loading, error, retry }: ExpandedContentArgs<Row, Attendee>) {
  if (loading) {
    return (
      <div className="flex min-h-[82px] items-center justify-center gap-[9px] text-xs text-[#777b77]" aria-live="polite">
        <span
          className="size-[15px] animate-spin rounded-full border-2 border-[#ded9d1] border-t-[#de6748] motion-reduce:animate-none"
          aria-hidden="true"
        />
        Fetching attendee list...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[82px] items-center justify-center gap-2.5 px-[22px] py-4 text-xs text-[#686b69]" role="alert">
        <CircleAlert size={17} aria-hidden="true" />
        <span>Could not load attendees for this class.</span>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-[7px] border border-[#d4cfc6] bg-white px-[9px] py-[5px] font-semibold text-[#383b3c] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#de674848]"
          onClick={retry}
        >
          <RefreshCw size={13} aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="flex min-h-[82px] items-center justify-center gap-[9px] text-xs text-[#777b77]">
        <CircleAlert size={17} aria-hidden="true" />
        <span>No attendees for this class.</span>
      </div>
    );
  }

  return (
    <div className="py-[18px] pr-[22px] pb-[22px] pl-[60px]">
      <div className="mb-2.5 flex items-center justify-between text-[0.68rem] font-semibold tracking-[0.06em] text-[#777b77] uppercase">
        <span>Attendees</span>
        <span className="font-medium tracking-normal normal-case">{children.length} shown</span>
      </div>
      <ul className="grid list-none gap-px overflow-hidden rounded-[10px] border border-[#e4dfd7] bg-[#e4dfd7] p-0">
        {children.map((attendee) => (
          <li key={attendee.id} className="grid grid-cols-[34px_1fr_auto] items-center gap-[11px] bg-white px-[13px] py-[11px]">
            <span
              className="grid size-[31px] place-items-center rounded-full bg-[#e4ded3] text-[0.63rem] font-bold text-[#645548]"
              aria-hidden="true"
            >
              {attendee.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </span>
            <span className="flex flex-col">
              <strong className="text-xs">{attendee.name}</strong>
              <span className="mt-[3px] flex items-center gap-[5px] text-[0.66rem] text-[#8b8e89]">
                <CreditCard size={13} aria-hidden="true" />
                {attendee.paymentType}
              </span>
            </span>
            <span
              className={`inline-flex w-fit items-center gap-[5px] rounded-full px-2 py-[5px] text-[0.67rem] font-semibold ${bookingStatusClasses[attendee.bookingStatus]}`}
            >
              {attendee.bookingStatus === "Checked-in" ? <Check size={13} aria-hidden="true" /> : null}
              {attendee.bookingStatus}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
