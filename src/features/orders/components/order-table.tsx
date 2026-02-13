"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/layout/data-table-pagination";
import {
  Eye,
  MoreHorizontal,
  CreditCard,
  RotateCcw,
  Pencil,
  FileText,
} from "lucide-react";
import { OrderDetailDialog } from "./order-detail-dialog";
import { PaymentDialog } from "./payment-dialog";
import { InvoiceDialog } from "@/features/sales/components/invoice-dialog";
import { useRevertOrder } from "../hooks/use-orders";
import { useRouter } from "next/navigation";
import type { OrderDetail, PaginationMeta, WarehouseItem } from "@/types/api";

interface OrderTableProps {
  orders: OrderDetail[];
  meta: PaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  warehouseMap: Record<string, WarehouseItem>;
}

const stateConfig: Record<string, { className: string; dot: string }> = {
  "Báo giá": {
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  "Đã chốt": {
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  "Chỉnh sửa": {
    className: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800",
    dot: "bg-sky-500",
  },
  "Đã hoàn": {
    className: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
    dot: "bg-rose-500",
  },
};

export function OrderTable({
  orders,
  meta,
  isLoading,
  onPageChange,
  onPageSizeChange,
  warehouseMap,
}: OrderTableProps) {
  const router = useRouter();
  const revertOrder = useRevertOrder();

  const [detailOrder, setDetailOrder] = useState<OrderDetail | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<OrderDetail | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<OrderDetail | null>(null);
  const [invoicePriceType, setInvoicePriceType] = useState<"high" | "low">("high");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Khách hàng</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold text-right">Tổng tiền</TableHead>
              <TableHead className="font-semibold text-right">Đã trả</TableHead>
              <TableHead className="font-semibold text-right">Còn lại</TableHead>
              <TableHead className="font-semibold">Ghi chú</TableHead>
              <TableHead className="font-semibold text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const remaining = Math.max(0, -order.payment);
                const paid = order.totalPrice - remaining;
                return (
                  <TableRow key={order._id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-medium">
                      {order._id.slice(-5).toUpperCase()}
                    </TableCell>
                    <TableCell>{order.customer?.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={stateConfig[order.state]?.className || ""}
                      >
                        <span
                          className={`size-2 rounded-full shrink-0 ${stateConfig[order.state]?.dot || "bg-gray-400"}`}
                        />
                        {order.state}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${order.totalPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      ${paid.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      ${remaining.toFixed(2)}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {order.note || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setDetailOrder(order)}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setInvoicePriceType("high");
                              setInvoiceOrder(order);
                            }}
                            className="cursor-pointer"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Xem hóa đơn (C)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setInvoicePriceType("low");
                              setInvoiceOrder(order);
                            }}
                            className="cursor-pointer"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Xem hóa đơn (T)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setPaymentOrder(order)}
                            className="cursor-pointer"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Ghi nhận thanh toán
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => revertOrder.mutate(order._id)}
                            className="cursor-pointer"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Hoàn đơn
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/orders/${order._id}/edit`)
                            }
                            className="cursor-pointer"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <DataTablePagination
          current={meta.current}
          pageSize={meta.pageSize}
          total={meta.total}
          pages={meta.pages}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>

      <OrderDetailDialog
        open={!!detailOrder}
        onOpenChange={(open) => !open && setDetailOrder(null)}
        order={detailOrder}
        warehouseMap={warehouseMap}
      />

      <PaymentDialog
        open={!!paymentOrder}
        onOpenChange={(open) => !open && setPaymentOrder(null)}
        order={paymentOrder}
      />

      <InvoiceDialog
        open={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        order={invoiceOrder}
        priceType={invoicePriceType}
        warehouseMap={warehouseMap}
      />
    </>
  );
}
