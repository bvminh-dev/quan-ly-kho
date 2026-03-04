"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Fragment } from "react";
import type { OrderDetail, WarehouseItem } from "@/types/api";
import { getWarehouseDisplayName } from "@/features/warehouse/utils/sort-warehouse";
import { formatNGN, formatNumber, formatUSD } from "@/utils/currency";
import { ORDER_STATE_CONFIG } from "../constants/order-state-config";

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderDetail | null;
  warehouseMap: Record<string, WarehouseItem>;
}

export function OrderDetailDialog({
  open,
  onOpenChange,
  order,
  warehouseMap,
}: OrderDetailDialogProps) {
  if (!order) return null;

  const remaining = Math.max(0, -order.payment);
  const paid = order.totalPrice - remaining;
  const exchangeRate = order.exchangeRate || 1;
  const totalUSD = order.totalPrice / exchangeRate;
  const paidUSD = paid / exchangeRate;
  const remainingUSD = remaining / exchangeRate;
  const lowerState = order.state?.toLowerCase() as
    | keyof typeof ORDER_STATE_CONFIG
    | undefined;
  const stateCfg = lowerState ? ORDER_STATE_CONFIG[lowerState] : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[85vh]">
        <DialogHeader className="pr-10">
          <DialogTitle className="flex flex-wrap items-center gap-2 sm:gap-3">
            Chi tiết đơn hàng
            <Badge
              className={
                stateCfg?.className ||
                "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
              }
            >
              <span
                className={`size-2 rounded-full shrink-0 mr-2 ${stateCfg?.dot || "bg-gray-500"}`}
              />
              {order.state}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="space-y-4 pr-4 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="min-w-0">
                <span className="text-muted-foreground">ID: </span>
                <span className="font-mono font-medium">
                  {order._id.slice(-5).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground">Khách hàng: </span>
                <span className="font-medium wrap-break-word">
                  {order.customer?.name}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1 min-w-0">
                <span className="text-muted-foreground shrink-0">
                  Tổng tiền:{" "}
                </span>
                <span className="font-medium tabular-nums break-all">
                  {formatUSD(totalUSD)} / {formatNGN(order.totalPrice)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1 min-w-0">
                <span className="text-muted-foreground shrink-0">Đã trả: </span>
                <span className="font-medium text-green-600 dark:text-green-500 tabular-nums break-all">
                  {formatUSD(paidUSD)} / {formatNGN(paid)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1 min-w-0">
                <span className="text-muted-foreground shrink-0">
                  Còn lại:{" "}
                </span>
                <span className="font-medium text-red-600 dark:text-red-500 tabular-nums break-all">
                  {formatUSD(remainingUSD)} / {formatNGN(remaining)}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground">Tỷ giá: </span>
                <span className="font-medium">
                  1 USD = {formatNumber(order.exchangeRate)} NGN
                </span>
              </div>
              {order.note && (
                <div className="col-span-2 min-w-0">
                  <span className="text-muted-foreground">Ghi chú: </span>
                  <span className="wrap-break-word">{order.note}</span>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-semibold mb-2">Sản phẩm</h4>
              <div className="space-y-2">
                {order.products.map((product, pIdx) => {
                  const isSet = product.isCalcSet && product.items.length > 1;
                  const firstItem = product.items[0];
                  const firstWh = firstItem
                    ? warehouseMap[firstItem.id]
                    : undefined;
                  const setUnit =
                    firstItem?.unitOfCalculation || firstWh?.unitOfCalculation;
                  return (
                    <Fragment key={pIdx}>
                      {isSet && (
                        <div className="font-medium py-1 text-sm min-w-0 wrap-break-word">
                          {product.nameSet} — {formatUSD(product.priceSet)} ×{" "}
                          {product.quantitySet}
                          {setUnit && (
                            <span className="text-muted-foreground font-normal ml-1">
                              ({setUnit})
                            </span>
                          )}
                          {product.saleSet > 0 && (
                            <span className="text-red-600 dark:text-red-500 ml-2">
                              Giảm {formatUSD(product.saleSet)}
                            </span>
                          )}
                        </div>
                      )}
                      {product.items.map((it, iIdx) => {
                        const wh = warehouseMap[it.id];
                        const name = wh ? getWarehouseDisplayName(wh) : it.id;
                        const unit =
                          it.unitOfCalculation || wh?.unitOfCalculation;
                        return (
                          <div
                            key={`${pIdx}-${iIdx}`}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2 text-sm py-0.5 min-w-0"
                          >
                            <span className="min-w-0 wrap-break-word">
                              {name}
                            </span>
                            <span className="text-muted-foreground tabular-nums shrink-0">
                              {it.quantity} {unit} × {formatUSD(it.price)}
                              {it.sale > 0 && ` (-${formatUSD(it.sale)})`}
                            </span>
                          </div>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </div>
            </div>

            {order.history.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Lịch sử thanh toán
                  </h4>
                  <div className="space-y-2">
                    {order.history.map((h, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-sm py-1.5 min-w-0"
                      >
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              h.type === "khách trả"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800"
                            }`}
                          >
                            {h.type}
                          </Badge>
                          <span className="text-muted-foreground">
                            {new Date(h.datePaid).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <span className="font-medium tabular-nums shrink-0">
                          {formatNGN(h.moneyPaidNGN)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
