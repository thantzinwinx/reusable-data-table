import type { TableColumn } from "@/components/data-table";
import type { Payment, PaymentStatus } from "./paymentTypes";

const paymentStatusClasses: Record<PaymentStatus, string> = {
  Paid: "bg-[#e8f3eb] text-[#397251]",
  Pending: "bg-[#fff0df] text-[#a15f22]",
  Refunded: "bg-[#f4eae7] text-[#965848]",
};

const mmkFormatter = new Intl.NumberFormat("en-US");

export const paymentColumns: TableColumn<Payment>[] = [
  { key: "memberName", header: "Member", accessor: (row) => row.memberName, sortable: true, pinned: "left" },
  {
    key: "amount",
    header: "Amount",
    accessor: (row) => row.amount,
    sortable: true,
    renderCell: (value) => `${mmkFormatter.format(value as number)} MMK`,
  },
  { key: "method", header: "Method", accessor: (row) => row.method, sortable: true },
  {
    key: "status",
    header: "Status",
    accessor: (row) => row.status,
    sortable: true,
    renderCell: (value, row) => (
      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${paymentStatusClasses[row.status]}`}>
        {String(value)}
      </span>
    ),
  },
  { key: "date", header: "Date", accessor: (row) => row.date, sortable: true },
];
