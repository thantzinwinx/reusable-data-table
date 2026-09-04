import type { Payment, PaymentItem, PaymentMethod, PaymentStatus } from "./paymentTypes";

const memberNames = ["Su Su", "Mg Kyaw", "Mya Mya", "Phyu Phyu", "Mg Mya"];
const methods: PaymentMethod[] = ["Mobile Banking", "Cash", "Card"];
const statuses: PaymentStatus[] = ["Paid", "Pending", "Refunded"];

function createPayments(count: number): Payment[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `payment-${index}`,
    memberName: memberNames[index % memberNames.length],
    amount: 25_000 + (index % 6) * 25_000,
    method: methods[index % methods.length],
    status: statuses[index % 7 === 0 ? 2 : index % 5 === 0 ? 1 : 0],
    date: `2026-09-0${(index % 9) + 1}`,
  }));
}

export const payments: Payment[] = createPayments(5);

export function itemsForPayment(payment: Payment): PaymentItem[] {
  return [
    { id: `${payment.id}-fee`, label: "Membership fee", note: "Billed monthly", amount: payment.amount - 5_000 },
    { id: `${payment.id}-service`, label: "Service charge", note: "Front desk support", amount: 5_000 },
  ];
}
