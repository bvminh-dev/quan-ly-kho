"use client";

import { useMemo, useState } from "react";
import { DataTablePagination } from "@/components/layout/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceDialog } from "@/features/sales/components/invoice-dialog";
import type { OrderDetail, PaginationMeta, WarehouseItem } from "@/types/api";
import { ORDER_STATE_CONFIG } from "../constants/order-state-config";
import {
  CreditCard,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  CheckCircle2,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatNGN } from "@/utils/currency";
import { OrderDetailDialog } from "./order-detail-dialog";
import { PaymentDialog } from "./payment-dialog";
import { RevertOrderDialog } from "./revert-order-dialog";
import { quickSearchFilter } from "@/utils/search";
import { useConfirmOrder, useDeliverOrder } from "../hooks/use-orders";

function getOrderCreatorName(createdBy: OrderDetail["createdBy"]) {
  if (createdBy && typeof createdBy === "object") {
    return createdBy.name;
  }
  return "-";
}

interface OrderTableProps {
  orders: OrderDetail[];
  meta: PaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  warehouseMap: Record<string, WarehouseItem>;
}

export function OrderTable({
  orders,
  meta,
  isLoading,
  onPageChange,
  onPageSizeChange,
  warehouseMap,
}: OrderTableProps) {
  const router = useRouter();

  const [detailOrder, setDetailOrder] = useState<OrderDetail | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<OrderDetail | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<OrderDetail | null>(null);
  const [revertOrder, setRevertOrder] = useState<OrderDetail | null>(null);
  const [editOrder, setEditOrder] = useState<OrderDetail | null>(null);
  const [search, setSearch] = useState("");
  const [confirmOrder, setConfirmOrder] = useState<OrderDetail | null>(null);
  const [deliverOrder, setDeliverOrder] = useState<OrderDetail | null>(null);
  const [deliverNote, setDeliverNote] = useState("");
  const confirmOrderMutation = useConfirmOrder();
  const deliverOrderMutation = useDeliverOrder();

  const handleConfirmEdit = () => {
    if (!editOrder) return;
    const id = editOrder._id;
    setEditOrder(null);
    router.push(`/dashboard/orders/${id}/edit`);
  };

  const handleConfirmOrder = () => {
    if (!confirmOrder) return;
    confirmOrderMutation.mutate(confirmOrder._id, {
      onSuccess: () => {
        setConfirmOrder(null);
      },
    });
  };

  const handleDeliverOrder = () => {
    if (!deliverOrder) return;
    deliverOrderMutation.mutate(
      { id: deliverOrder._id, note: deliverNote },
      {
        onSuccess: () => {
          setDeliverOrder(null);
          setDeliverNote("");
        },
      },
    );
  };

  const filteredOrders = useMemo(
    () =>
      quickSearchFilter(orders, search, (order) => {
        const { paidNGN } = (order.history || []).reduce(
          (acc, h) => {
            const type = h.type?.toLowerCase();
            const sign = type === "hoàn tiền" ? -1 : 1;
            return {
              paidNGN: acc.paidNGN + (h.moneyPaidNGN || 0) * sign,
            };
          },
          { paidNGN: 0 },
        );
        const remaining = order.totalPrice - paidNGN;
        const balance = paidNGN - order.totalPrice;
        const creatorName = getOrderCreatorName(order.createdBy);
        return [
          order._id,
          order.type,
          order.customer?.name,
          order.state,
          order.totalPrice,
          paidNGN,
          remaining,
          balance,
          order.note,
          creatorName,
          order.createdAt,
        ];
      }),
    [orders, search],
  );

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
        <div className="p-3 border-b bg-muted/40">
          <Input
            placeholder="Tìm nhanh theo mọi cột..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Khách hàng</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold text-right">
                Tổng tiền
              </TableHead>
              <TableHead className="font-semibold text-right">Đã trả</TableHead>
              <TableHead className="font-semibold text-right">
                Còn lại
              </TableHead>
              <TableHead className="font-semibold">Ghi chú</TableHead>
              <TableHead className="font-semibold">Người tạo</TableHead>
              <TableHead className="font-semibold">Thời gian tạo</TableHead>
              <TableHead className="font-semibold text-center">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const { paidNGN } = (order.history || []).reduce(
                  (acc, h) => {
                    const type = h.type?.toLowerCase();
                    const sign = type === "hoàn tiền" ? -1 : 1;
                    return {
                      paidNGN: acc.paidNGN + (h.moneyPaidNGN || 0) * sign,
                    };
                  },
                  { paidNGN: 0 },
                );
                const balance = paidNGN - order.totalPrice;
                const lowerState = order.state?.toLowerCase();
                const stateCfg = ORDER_STATE_CONFIG[lowerState as keyof typeof ORDER_STATE_CONFIG];
                const isLocked =
                  lowerState === "hoàn tác" ||
                  lowerState === "đã xong" ||
                  lowerState === "đã giao" ||
                  lowerState === "đã hoàn" ||
                  lowerState === "hoàn đơn";
                const canRevert = !isLocked && paidNGN === 0;
                const canConfirm =
                  lowerState === "báo giá" || lowerState === "chỉnh sửa";
                const canAddPayment = lowerState === "đã chốt";
                const canDeliver =
                  (order.payment || 0) + order.totalPrice !== 0;
                return (
                  <TableRow key={order._id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-medium">
                      {order._id.slice(-5).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {order.customer?.name}
                      {order.type === "cao" ? " (C)" : " (T)"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          stateCfg?.className ||
                          "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
                        }
                      >
                        <span
                          className={`size-2 rounded-full shrink-0 ${stateCfg?.dot || "bg-gray-500"}`}
                        />
                        {order.state.charAt(0).toUpperCase() +
                          order.state.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNGN(order.totalPrice)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatNGN(paidNGN)}
                    </TableCell>
                    <TableCell className="text-right">
                      {balance === 0 ? (
                        <span className="text-muted-foreground">
                          {formatNGN(0)}
                        </span>
                      ) : (
                        <span
                          className={
                            balance < 0 ? "text-red-600" : "text-green-600"
                          }
                        >
                          {balance < 0 ? "-" : "+"}
                          {formatNGN(Math.abs(balance))}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {order.note || "-"}
                    </TableCell>
                    <TableCell>
                      {getOrderCreatorName(order.createdBy)}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const date = new Date(order.createdAt);
                        const day = String(date.getDate()).padStart(2, "0");
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0",
                        );
                        const year = date.getFullYear();
                        const hours = String(date.getHours()).padStart(2, "0");
                        const minutes = String(date.getMinutes()).padStart(
                          2,
                          "0",
                        );
                        return `${day}-${month}-${year} ${hours}:${minutes}`;
                      })()}
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
                            onClick={() => setInvoiceOrder(order)}
                            className="cursor-pointer"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Xem hóa đơn
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (!canConfirm) return;
                              setConfirmOrder(order);
                            }}
                            disabled={!canConfirm}
                            className="cursor-pointer"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Chốt đơn
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (!canAddPayment) return;
                              setPaymentOrder(order);
                            }}
                            disabled={!canAddPayment}
                            className="cursor-pointer"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Ghi nhận thanh toán
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (!canDeliver) return;
                              setDeliverOrder(order);
                              setDeliverNote("");
                            }}
                            disabled={!canDeliver}
                            className="cursor-pointer"
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Đã giao
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (!canRevert) return;
                              setRevertOrder(order);
                            }}
                            disabled={!canRevert}
                            className="cursor-pointer"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Hoàn đơn
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (isLocked) return;
                              setEditOrder(order);
                            }}
                            disabled={isLocked}
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
        warehouseMap={warehouseMap}
      />

      <RevertOrderDialog
        open={!!revertOrder}
        onOpenChange={(open) => !open && setRevertOrder(null)}
        order={revertOrder}
      />

      <Dialog open={!!editOrder} onOpenChange={(open) => !open && setEditOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đồng ý chỉnh sửa đơn</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn chỉnh sửa đơn hàng{" "}
              <strong>#{editOrder?._id.slice(-5).toUpperCase()}</strong>? Những thay đổi
              tiếp theo có thể ảnh hưởng tới kho và công nợ.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOrder(null)}>
              Hủy
            </Button>
            <Button onClick={handleConfirmEdit} className="cursor-pointer">
              Đồng ý chỉnh sửa đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmOrder}
        onOpenChange={(open) => !open && setConfirmOrder(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đồng ý chốt đơn</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn chốt đơn hàng{" "}
              <strong>#{confirmOrder?._id.slice(-5).toUpperCase()}</strong>? Sau khi
              chốt, chỉ có thể chỉnh sửa thông qua nghiệp vụ chỉnh sửa đơn.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOrder(null)}>
              Hủy
            </Button>
            <Button
              onClick={handleConfirmOrder}
              className="cursor-pointer"
              disabled={confirmOrderMutation.isPending}
            >
              Đồng ý chốt đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deliverOrder}
        onOpenChange={(open) => {
          if (!open) {
            setDeliverOrder(null);
            setDeliverNote("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chuyển đơn hàng sang Đã giao</DialogTitle>
            <DialogDescription>
              Nhập ghi chú cho lần cập nhật trạng thái này nếu cần.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Input
              value={deliverNote}
              onChange={(e) => setDeliverNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeliverOrder(null);
                setDeliverNote("");
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleDeliverOrder}
              className="cursor-pointer"
              disabled={deliverOrderMutation.isPending}
            >
              Xác nhận Đã giao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
