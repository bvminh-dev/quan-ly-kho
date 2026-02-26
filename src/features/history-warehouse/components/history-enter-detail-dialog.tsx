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
import { formatNumber } from "@/utils/currency";
import { useHistoryEnterItem } from "../hooks/use-history-warehouse";

interface HistoryEnterDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
}

export function HistoryEnterDetailDialog({
  open,
  onOpenChange,
  itemId,
}: HistoryEnterDetailDialogProps) {
  const { data, isLoading } = useHistoryEnterItem(itemId || "");

  const item = data?.data;

  const formatMetadata = () => {
    if (!item) return null;
    const { type, metadata } = item;
    switch (type) {
      case "Tạo mới":
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Tổng số lượng:</span>{" "}
                <span className="font-medium">{formatNumber(metadata.totalAmount ?? 0)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Giá cao:</span>{" "}
                <span className="font-medium">{formatNumber(metadata.priceHigh ?? 0)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Giá thấp:</span>{" "}
                <span className="font-medium">{formatNumber(metadata.priceLow ?? 0)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Giảm giá:</span>{" "}
                <span className="font-medium">{formatNumber(metadata.sale ?? 0)}</span>
              </div>
            </div>
          </div>
        );
      case "Nhập thêm hàng":
        return (
          <div>
            <span className="text-muted-foreground">Số lượng nhập thêm:</span>{" "}
            <span className="font-medium">{formatNumber(metadata.quantity ?? 0)}</span>
          </div>
        );
      case "Hoàn đơn":
        return (
          <div className="space-y-2">
            <div>
              <span className="text-muted-foreground">Số lượng hoàn:</span>{" "}
              <span className="font-medium">{formatNumber(metadata.quantityRevert ?? 0)}</span>
            </div>
            {metadata.orderId && (
              <div>
                <span className="text-muted-foreground">ID đơn hàng:</span>{" "}
                <span className="font-mono font-medium">
                  {typeof metadata.orderId === "string"
                    ? metadata.orderId.slice(-5).toUpperCase()
                    : metadata.orderId._id?.slice(-5).toUpperCase() || "-"}
                </span>
              </div>
            )}
          </div>
        );
      case "Sửa giá":
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">Giá cao cũ:</span>{" "}
                <span className="font-medium">{formatNumber(metadata.priceHighOld ?? 0)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Giá cao mới:</span>{" "}
                <span className="font-medium text-green-600">
                  {formatNumber(metadata.priceHighNew ?? 0)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Giá thấp cũ:</span>{" "}
                <span className="font-medium">{formatNumber(metadata.priceLowOld ?? 0)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Giá thấp mới:</span>{" "}
                <span className="font-medium text-green-600">
                  {formatNumber(metadata.priceLowNew ?? 0)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Sale cũ:</span>{" "}
                <span className="font-medium">{formatNumber(metadata.saleOld ?? 0)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Sale mới:</span>{" "}
                <span className="font-medium text-green-600">
                  {formatNumber(metadata.saleNew ?? 0)}
                </span>
              </div>
            </div>
          </div>
        );
      case "Xóa":
        return <div className="text-muted-foreground">Đã xóa bản ghi này</div>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Chi tiết lịch sử nhập kho
            {item && (
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {item.type}
              </Badge>
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
                <h4 className="text-sm font-semibold mb-3">Chi tiết thay đổi</h4>
                {formatMetadata()}
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
