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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/layout/data-table-pagination";
import { RoleGate } from "@/components/access-control";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useDeleteHistoryExport } from "../hooks/use-history-warehouse";
import type { HistoryExportItem, PaginationMeta } from "@/types/api";
import { HistoryExportFormDialog } from "./history-export-form-dialog";
import { HistoryExportDetailDialog } from "./history-export-detail-dialog";

interface HistoryExportTableProps {
  items: HistoryExportItem[];
  meta: PaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function HistoryExportTable({
  items,
  meta,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: HistoryExportTableProps) {
  const deleteHistory = useDeleteHistoryExport();
  const [editItem, setEditItem] = useState<HistoryExportItem | null>(null);
  const [detailItemId, setDetailItemId] = useState<string | null>(null);

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
              <TableHead className="font-semibold">Đơn hàng</TableHead>
              <TableHead className="font-semibold">Loại</TableHead>
              <TableHead className="font-semibold text-right">SL</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold text-right">Thanh toán</TableHead>
              <TableHead className="font-semibold">Ghi chú</TableHead>
              <TableHead className="font-semibold text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="h-24 text-center text-muted-foreground">
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
                  <TableCell className="font-mono text-xs">
                    {typeof item.orderId === "string"
                      ? item.orderId.slice(-5).toUpperCase()
                      : item.orderId._id?.slice(-5).toUpperCase() || "-"}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {item.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{item.quantityOrder}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      {item.stateOrder}
                    </span>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${item.paymentOrder >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {item.paymentOrder >= 0 ? "+" : ""}
                    {item.paymentOrder.toLocaleString()}
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
        <HistoryExportFormDialog
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          item={editItem}
        />
      )}

      <HistoryExportDetailDialog
        open={!!detailItemId}
        onOpenChange={(open) => !open && setDetailItemId(null)}
        itemId={detailItemId}
      />
    </>
  );
}
