export type PaymentMethod = "Cash" | "Card" | "Mobile Banking";
export type PaymentStatus = "Paid" | "Pending" | "Refunded";
export type PaymentRequestMode = "success" | "empty" | "error";

export type PaymentItem = {
  id: string;
  label: string;
  note: string;
  amount: number;
};

export type Payment = {
  id: string;
  memberName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
};
