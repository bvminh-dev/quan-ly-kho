"use client";

import { RoleGate } from "@/components/access-control";
import { DataTablePagination } from "@/components/layout/data-table-pagination";
import { Button } from "@/components/ui/button";
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
import type { HistoryEnterItem, PaginationMeta } from "@/types/api";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteHistoryEnter } from "../hooks/use-history-warehouse";
import { HistoryEnterDetailDialog } from "./history-enter-detail-dialog";
import { HistoryEnterFormDialog } from "./history-enter-form-dialog";

interface HistoryEnterTableProps {
  items: HistoryEnterItem[];
  meta: PaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const typeConfig: Record<string, string> = {
  "Tạo mới": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  "Nhập thêm hàng": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  "Hoàn đơn": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  "Sửa giá": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  "Xóa": "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
};

export function HistoryEnterTable({
  items,
  meta,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: HistoryEnterTableProps) {
  const deleteHistory = useDeleteHistoryEnter();
  const [editItem, setEditItem] = useState<HistoryEnterItem | null>(null);
  const [detailItemId, setDetailItemId] = useState<string | null>(null);

  const formatMetadata = (item: HistoryEnterItem) => {
    const { type, metadata } = item;
    switch (type) {
      case "Tạo mới":
        return `SL: ${metadata.totalAmount || 0}, Cao: ${metadata.priceHigh || 0}, Thấp: ${metadata.priceLow || 0}`;
      case "Nhập thêm hàng":
        return `Số lượng: ${metadata.quantity || 0}`;
      case "Hoàn đơn":
        const orderIdStr =
          typeof metadata.orderId === "string"
            ? metadata.orderId.slice(-5).toUpperCase()
            : metadata.orderId?._id?.slice(-5).toUpperCase() || "";
        return `SL hoàn: ${metadata.quantityRevert || 0}, Đơn: ${orderIdStr}`;
      case "Sửa giá":
        return `${metadata.priceHighOld !== metadata.priceHighNew ? `Giá cao: ${metadata.priceHighOld || 0} → ${metadata.priceHighNew || 0}` : ""} ${metadata.priceLowOld !== metadata.priceLowNew ? `Giá thấp: ${metadata.priceLowOld || 0} → ${metadata.priceLowNew || 0}` : ""} ${metadata.saleOld !== metadata.saleNew ? `sale: ${metadata.saleOld || 0} → ${metadata.saleNew || 0}` : ""}`.trim();
      case "Xóa":
        return "Đã xóa";
      default:
        return "-";
    }
  };

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
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden w-full min-w-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Ngày</TableHead>
              <TableHead className="font-semibold">Item</TableHead>
              <TableHead className="font-semibold">Inch</TableHead>
              <TableHead className="font-semibold">Quality</TableHead>
              <TableHead className="font-semibold">Style</TableHead>
              <TableHead className="font-semibold">Color</TableHead>
              <TableHead className="font-semibold">Loại</TableHead>
              <TableHead className="font-semibold">Chi tiết</TableHead>
              <TableHead className="font-semibold">Ghi chú</TableHead>
              <TableHead className="font-semibold text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={item._id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => setDetailItemId(item._id)}
                >
                  <TableCell className="font-medium">
                    {(() => {
                      const date = new Date(item.createdAt);
                      const day = String(date.getDate()).padStart(2, "0");
                      const month = String(date.getMonth() + 1).padStart(2, "0");
                      const year = date.getFullYear();
                      const hours = String(date.getHours()).padStart(2, "0");
                      const minutes = String(date.getMinutes()).padStart(2, "0");
                      return `${day}/${month}/${year} ${hours}:${minutes}`;
                    })()}
                  </TableCell>
                  <TableCell>{item.item}</TableCell>
                  <TableCell>{item.inches}&quot;</TableCell>
                  <TableCell>{item.quality}</TableCell>
                  <TableCell>{item.style}</TableCell>
                  <TableCell>{item.color}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeConfig[item.type] || "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"}`}>
                      {item.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {formatMetadata(item)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{item.note || "-"}</TableCell>
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <RoleGate role="admin">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditItem(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (confirm("Bạn có chắc chắn muốn xóa?")) {
                                deleteHistory.mutate(item._id);
                              }
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </RoleGate>
                  </TableCell>
                </TableRow>
              ))
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

      {editItem && (
        <HistoryEnterFormDialog
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          item={editItem}
        />
      )}

      <HistoryEnterDetailDialog
        open={!!detailItemId}
        onOpenChange={(open) => !open && setDetailItemId(null)}
        itemId={detailItemId}
      />
    </>
  );
}
