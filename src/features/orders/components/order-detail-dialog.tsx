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
import type { OrderDetail, WarehouseItem } from "@/types/api";
import { getWarehouseDisplayName } from "@/features/warehouse/utils/sort-warehouse";
import { formatNGN, formatNumber } from "@/utils/currency";
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
  const lowerState = order.state?.toLowerCase() as keyof typeof ORDER_STATE_CONFIG | undefined;
  const stateCfg = lowerState ? ORDER_STATE_CONFIG[lowerState] : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
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
          <div className="space-y-4 pr-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">ID: </span>
                <span className="font-mono font-medium">
                  {order._id.slice(-5).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Khách hàng: </span>
                <span className="font-medium">{order.customer?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tổng tiền: </span>
                <span className="font-medium">
                  {formatNGN(order.totalPrice)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Tỷ giá: </span>
                <span className="font-medium">
                  1 USD = {formatNumber(order.exchangeRate)} NGN
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Đã trả: </span>
                <span className="font-medium text-green-600">
                  {formatNGN(paid)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Còn lại: </span>
                <span className="font-medium text-red-600">
                  {formatNGN(remaining)}
                </span>
              </div>
              {order.note && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Ghi chú: </span>
                  <span>{order.note}</span>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-semibold mb-2">Sản phẩm</h4>
              <div className="space-y-2">
                {order.products.map((product, pIdx) => {
                  const isSet = product.isCalcSet && product.items.length > 1;
                  return (
                    <div
                      key={pIdx}
                      className={`border rounded-lg p-3 ${isSet ? "bg-muted/30" : ""}`}
                    >
                      {isSet && (
                        <div className="text-sm font-medium mb-2">
                          {product.nameSet} - Giá: {formatNGN(product.priceSet)}{" "}
                          × {product.quantitySet}
                          {product.saleSet > 0 &&
                            ` (giảm ${formatNGN(product.saleSet)})`}
                        </div>
                      )}
                      {product.items.map((it, iIdx) => {
                        const wh = warehouseMap[it.id];
                        const name = wh ? getWarehouseDisplayName(wh) : it.id;
                        return (
                          <div
                            key={iIdx}
                            className="flex items-center justify-between text-sm py-1"
                          >
                            <span className="truncate flex-1">{name}</span>
                            <span className="text-muted-foreground ml-2">
                              {it.quantity} × {formatNGN(it.price)}
                              {it.sale > 0 && ` (-${formatNGN(it.sale)})`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
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
                        className="flex items-center justify-between text-sm border rounded-lg p-2"
                      >
                        <div>
                          <Badge
                            variant="outline"
                            className={`text-xs mr-2 ${
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
                        <div className="text-right">
                          <span className="font-medium">
                            {formatNGN(h.moneyPaidNGN)}
                          </span>
                        </div>
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
