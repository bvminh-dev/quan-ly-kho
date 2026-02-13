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

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderDetail | null;
  warehouseMap: Record<string, WarehouseItem>;
}

const stateColors: Record<string, string> = {
  "Báo giá": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "Đã chốt": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "Chỉnh sửa": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Đã hoàn": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function OrderDetailDialog({
  open,
  onOpenChange,
  order,
  warehouseMap,
}: OrderDetailDialogProps) {
  if (!order) return null;

  const remaining = Math.max(0, -order.payment);
  const paid = order.totalPrice - remaining;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Chi tiết đơn hàng
            <Badge className={stateColors[order.state] || ""}>
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
                <span className="font-medium">${order.totalPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Tỷ giá: </span>
                <span className="font-medium">1 USD = {order.exchangeRate.toLocaleString()} NGN</span>
              </div>
              <div>
                <span className="text-muted-foreground">Đã trả: </span>
                <span className="font-medium text-green-600">${paid.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Còn lại: </span>
                <span className="font-medium text-red-600">${remaining.toFixed(2)}</span>
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
                    <div key={pIdx} className={`border rounded-lg p-3 ${isSet ? "bg-muted/30" : ""}`}>
                      {isSet && (
                        <div className="text-sm font-medium mb-2">
                          {product.nameSet} - Giá: ${product.priceSet.toFixed(2)} × {product.quantitySet}
                          {product.saleSet > 0 && ` (giảm $${product.saleSet.toFixed(2)})`}
                        </div>
                      )}
                      {product.items.map((it, iIdx) => {
                        const wh = warehouseMap[it.id];
                        const name = wh ? getWarehouseDisplayName(wh) : it.id;
                        return (
                          <div key={iIdx} className="flex items-center justify-between text-sm py-1">
                            <span className="truncate flex-1">{name}</span>
                            <span className="text-muted-foreground ml-2">
                              {it.quantity} × ${it.price.toFixed(2)}
                              {it.sale > 0 && ` (-$${it.sale.toFixed(2)})`}
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
                  <h4 className="text-sm font-semibold mb-2">Lịch sử thanh toán</h4>
                  <div className="space-y-2">
                    {order.history.map((h, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm border rounded-lg p-2">
                        <div>
                          <Badge variant={h.type === "khách trả" ? "default" : "destructive"} className="text-xs mr-2">
                            {h.type}
                          </Badge>
                          <span className="text-muted-foreground">
                            {new Date(h.datePaid).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">${h.moneyPaidDolar.toFixed(2)}</span>
                          <span className="text-muted-foreground ml-1">
                            (₦{h.moneyPaidNGN.toLocaleString()})
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
