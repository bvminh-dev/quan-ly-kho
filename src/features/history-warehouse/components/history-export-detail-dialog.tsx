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
import { Skeleton } from "@/components/ui/skeleton";
import { useHistoryExportItem } from "../hooks/use-history-warehouse";

interface HistoryExportDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
}

export function HistoryExportDetailDialog({
  open,
  onOpenChange,
  itemId,
}: HistoryExportDetailDialogProps) {
  const { data, isLoading } = useHistoryExportItem(itemId || "");

  const item = data?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Chi tiết lịch sử xuất kho
            {item && (
              <>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {item.type}
                </Badge>
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  {item.stateOrder}
                </Badge>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          {isLoading ? (
            <div className="space-y-4 pr-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : item ? (
            <div className="space-y-4 pr-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ID:</span>{" "}
                  <span className="font-mono font-medium">
                    {item._id.slice(-5).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày tạo:</span>{" "}
                  <span className="font-medium">
                    {(() => {
                      const date = new Date(item.createdAt);
                      const day = String(date.getDate()).padStart(2, "0");
                      const month = String(date.getMonth() + 1).padStart(2, "0");
                      const year = date.getFullYear();
                      const hours = String(date.getHours()).padStart(2, "0");
                      const minutes = String(date.getMinutes()).padStart(2, "0");
                      return `${day}/${month}/${year} ${hours}:${minutes}`;
                    })()}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold mb-3">Thông tin sản phẩm</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Item:</span>{" "}
                    <span className="font-medium">{item.item}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Inch:</span>{" "}
                    <span className="font-medium">{item.inches}&quot;</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quality:</span>{" "}
                    <span className="font-medium">{item.quality}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Style:</span>{" "}
                    <span className="font-medium">{item.style}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Color:</span>{" "}
                    <span className="font-medium">{item.color}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Warehouse ID:</span>{" "}
                    <span className="font-mono font-medium text-xs">
                      {typeof item.warehouseId === "string"
                        ? item.warehouseId.slice(-5).toUpperCase()
                        : item.warehouseId._id?.slice(-5).toUpperCase() || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold mb-3">Thông tin giá</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Giá cao:</span>{" "}
                    <span className="font-medium">{item.priceHigh}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Giá thấp:</span>{" "}
                    <span className="font-medium">{item.priceLow}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Giảm giá:</span>{" "}
                    <span className="font-medium">{item.sale}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold mb-3">Thông tin đơn hàng</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">ID đơn hàng:</span>{" "}
                    <span className="font-mono font-medium">
                      {typeof item.orderId === "string"
                        ? item.orderId.slice(-5).toUpperCase()
                        : item.orderId._id?.slice(-5).toUpperCase() || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Loại đơn:</span>{" "}
                    <span className="font-medium">{item.type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Số lượng:</span>{" "}
                    <span className="font-medium">{item.quantityOrder}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Giá bán:</span>{" "}
                    <span className="font-medium">{item.priceOrder}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Giá sale:</span>{" "}
                    <span className="font-medium">{item.saleOrder}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thanh toán:</span>{" "}
                    <span
                      className={`font-medium ${
                        item.paymentOrder >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.paymentOrder >= 0 ? "+" : ""}
                      {item.paymentOrder.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {item.note && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Ghi chú</h4>
                    <p className="text-sm text-muted-foreground">{item.note}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <span>Ngày cập nhật:</span>{" "}
                  <span>
                    {(() => {
                      const date = new Date(item.updatedAt);
                      const day = String(date.getDate()).padStart(2, "0");
                      const month = String(date.getMonth() + 1).padStart(2, "0");
                      const year = date.getFullYear();
                      const hours = String(date.getHours()).padStart(2, "0");
                      const minutes = String(date.getMinutes()).padStart(2, "0");
                      return `${day}/${month}/${year} ${hours}:${minutes}`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Không tìm thấy dữ liệu
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
