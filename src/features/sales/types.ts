import type { WarehouseItem } from "@/types/api";

export interface SelectedItem {
  tempId: string;
  warehouseId: string;
  warehouse: WarehouseItem;
  quantity: number;
  price: number;
  sale: number;
  customPrice: boolean;
  customSale: boolean;
  orderIndex: number;
}

export interface OrderSet {
  id: string;
  nameSet: string;
  priceSet: number;
  saleSet: number;
  quantitySet: number;
  items: SelectedItem[];
  orderIndex: number;
}

export const SET_COLORS = [
  "bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700",
  "bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700",
  "bg-orange-50 border-orange-300 dark:bg-orange-950/30 dark:border-orange-700",
  "bg-purple-50 border-purple-300 dark:bg-purple-950/30 dark:border-purple-700",
  "bg-pink-50 border-pink-300 dark:bg-pink-950/30 dark:border-pink-700",
  "bg-cyan-50 border-cyan-300 dark:bg-cyan-950/30 dark:border-cyan-700",
  "bg-yellow-50 border-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-700",
  "bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700",
];

/** Border colors for invoice (matches SET_COLORS order) */
export const SET_INVOICE_BORDER_COLORS = [
  "border-blue-400",
  "border-green-400",
  "border-orange-400",
  "border-purple-400",
  "border-pink-400",
  "border-cyan-400",
  "border-yellow-400",
  "border-red-400",
];

/** Background colors for invoice (matches SET_COLORS order) */
export const SET_INVOICE_BG_COLORS = [
  "bg-blue-50",
  "bg-green-50",
  "bg-orange-50",
  "bg-purple-50",
  "bg-pink-50",
  "bg-cyan-50",
  "bg-yellow-50",
  "bg-red-50",
];
