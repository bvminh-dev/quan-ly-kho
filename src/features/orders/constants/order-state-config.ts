import type { OrderDetail } from "@/types/api";

type OrderStateKey = Lowercase<OrderDetail["state"]>;

export const ORDER_STATE_CONFIG: Record<
  OrderStateKey,
  { className: string; dot: string }
> = {
  "báo giá": {
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  "đã chốt": {
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  "chỉnh sửa": {
    className:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800",
    dot: "bg-sky-500",
  },
  "hoàn tác": {
    className:
      "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
    dot: "bg-slate-500",
  },
  "đã hoàn": {
    className:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
    dot: "bg-rose-500",
  },
  "đã xong": {
    className:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800",
    dot: "bg-violet-500",
  },
  "khách trả": {
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  "hoàn đơn": {
    className:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
    dot: "bg-rose-500",
  },
};
