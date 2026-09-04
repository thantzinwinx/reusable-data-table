import type { PaginationState, SortState } from "@/components/data-table";
import { itemsForPayment, payments } from "./paymentMock";
import type { Payment, PaymentItem, PaymentRequestMode } from "./paymentTypes";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const sortValueByKey: Record<string, (row: Payment) => string | number> = {
  memberName: (row) => row.memberName,
  amount: (row) => row.amount,
  method: (row) => row.method,
  status: (row) => row.status,
  date: (row) => row.date,
};

export async function fetchPaymentPage(
  sort: SortState,
  pagination: PaginationState,
  mode: PaymentRequestMode = "success",
  latency = 550,
): Promise<{ rows: Payment[]; totalCount: number }> {
  await wait(latency);
  if (mode === "error") throw new Error("We could not load recent payments.");
  if (mode === "empty") return { rows: [], totalCount: 0 };

  let sorted = payments;
  if (sort) {
    const getValue = sortValueByKey[sort.key];
    if (getValue) {
      sorted = [...payments].sort((a, b) => {
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

export async function fetchPaymentItems(payment: Payment): Promise<PaymentItem[]> {
  await wait(700);
  if (payment.id === "payment-1" && !failedOnce.has(payment.id)) {
    failedOnce.add(payment.id);
    throw new Error("Could not load payment details.");
  }
  return itemsForPayment(payment);
}
