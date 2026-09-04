import { CircleAlert, Receipt, RefreshCw } from "lucide-react";
import type { ExpandedContentArgs } from "@/components/data-table";
import type { Payment, PaymentItem } from "./paymentTypes";

const mmkFormatter = new Intl.NumberFormat("en-US");

export function PaymentItemList({ children, loading, error, retry }: ExpandedContentArgs<Payment, PaymentItem>) {
  if (loading) {
    return (
      <div className="flex min-h-[82px] items-center justify-center gap-[9px] text-xs text-[#777b77]" aria-live="polite">
        <span
          className="size-[15px] animate-spin rounded-full border-2 border-[#ded9d1] border-t-[#de6748] motion-reduce:animate-none"
          aria-hidden="true"
        />
        Loading payment details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[82px] items-center justify-center gap-2.5 px-[22px] py-4 text-xs text-[#686b69]" role="alert">
        <CircleAlert size={17} aria-hidden="true" />
        <span>Could not load payment details.</span>
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
        <span>No details for this payment.</span>
      </div>
    );
  }

  const total = children.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="py-[18px] pr-[22px] pb-[22px] pl-[60px]">
      <div className="mb-2.5 flex items-center justify-between text-[0.68rem] font-semibold tracking-[0.06em] text-[#777b77] uppercase">
        <span>Breakdown</span>
        <span className="font-medium tracking-normal normal-case">{children.length} line items</span>
      </div>
      <ul className="grid list-none gap-px overflow-hidden rounded-[10px] border border-[#e4dfd7] bg-[#e4dfd7] p-0">
        {children.map((item) => (
          <li key={item.id} className="grid grid-cols-[34px_1fr_auto] items-center gap-[11px] bg-white px-[13px] py-[11px]">
            <span
              className="grid size-[31px] place-items-center rounded-full bg-[#e4ded3] text-[#645548]"
              aria-hidden="true"
            >
              <Receipt size={14} />
            </span>
            <span className="flex flex-col">
              <strong className="text-xs">{item.label}</strong>
              <span className="mt-[3px] text-[0.66rem] text-[#8b8e89]">{item.note}</span>
            </span>
            <span className="text-xs font-semibold tabular-nums">{mmkFormatter.format(item.amount)} MMK</span>
          </li>
        ))}
        <li className="grid grid-cols-[34px_1fr_auto] items-center gap-[11px] bg-[#faf7f2] px-[13px] py-[11px]">
          <span aria-hidden="true" />
          <span className="text-[0.68rem] font-semibold tracking-[0.04em] text-[#777b77] uppercase">Total</span>
          <span className="text-xs font-bold tabular-nums">{mmkFormatter.format(total)} MMK</span>
        </li>
      </ul>
    </div>
  );
}
