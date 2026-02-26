"use client";

import { RoleGate } from "@/components/access-control";
import { DataTablePagination } from "@/components/layout/data-table-pagination";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PaginationMeta, WarehouseItem } from "@/types/api";
import { formatNumber } from "@/utils/currency";
import { quickSearchFilter } from "@/utils/search";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useDeleteWarehouse } from "../hooks/use-warehouses";
import { sortWarehouseItems } from "../utils/sort-warehouse";
import { AddStockDialog } from "./add-stock-dialog";

interface WarehouseTableProps {
  items: WarehouseItem[];
  meta: PaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function WarehouseTable({
  items,
  meta,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: WarehouseTableProps) {
  const [search, setSearch] = useState("");

  const sortedItems = useMemo(() => sortWarehouseItems(items), [items]);
  const filteredItems = useMemo(
    () =>
      quickSearchFilter(sortedItems, search, (item) => [
        item._id,
        item.inches,
        item.item,
        item.quality,
        item.style,
        item.color,
        item.totalAmount,
        item.amountAvailable,
        item.amountOccupied,
        item.unitOfCalculation,
      ]),
    [sortedItems, search],
  );

  // Calculate totals by unit
  const totals = useMemo(() => {
    const result = {
      stockKg: 0,
      stockPcs: 0,
      pendingExportKg: 0,
      pendingExportPcs: 0,
    };

    filteredItems.forEach((item) => {
      const isKg = item.unitOfCalculation.toLowerCase() === "kg";
      if (isKg) {
        result.stockKg += item.amountAvailable;
        result.pendingExportKg += item.amountOccupied;
      } else {
        result.stockPcs += item.amountAvailable;
        result.pendingExportPcs += item.amountOccupied;
      }
    });

    return result;
  }, [filteredItems]);
  const deleteWarehouse = useDeleteWarehouse();
  const [addStockWarehouse, setAddStockWarehouse] =
    useState<WarehouseItem | null>(null);
  const [deleteWarehouseItem, setDeleteWarehouseItem] =
    useState<WarehouseItem | null>(null);

  const handleDelete = () => {
    if (deleteWarehouseItem) {
      deleteWarehouse.mutate(deleteWarehouseItem._id, {
        onSuccess: () => setDeleteWarehouseItem(null),
      });
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
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <div className="p-3 border-b bg-muted/40 flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Tìm nhanh theo mọi cột..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Tồn kho:</span>
            <span className="font-medium text-green-600">
              {formatNumber(totals.stockKg)} kg,
            </span>
            <span className="font-medium text-green-600">
              {formatNumber(totals.stockPcs)} pcs
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Chờ giao:</span>
            <span className="font-medium text-orange-600">
              {formatNumber(totals.pendingExportKg)} kg,
            </span>
            <span className="font-medium text-orange-600">
              {formatNumber(totals.pendingExportPcs)} pcs
            </span>
          </div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Id</TableHead>
            <TableHead className="font-semibold">Inch</TableHead>
            <TableHead className="font-semibold">Item</TableHead>
            <TableHead className="font-semibold">Quality</TableHead>
            <TableHead className="font-semibold">Style</TableHead>
            <TableHead className="font-semibold">Color</TableHead>
            <TableHead className="font-semibold text-right">Tồn kho</TableHead>
            <TableHead className="font-semibold text-right">Chờ giao</TableHead>
            <TableHead className="font-semibold">Đơn vị</TableHead>
            <TableHead className="font-semibold text-center">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="h-24 text-center text-muted-foreground"
              >
                Không có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item) => (
              <TableRow key={item._id} className="hover:bg-muted/30">
                <TableCell className="font-mono font-medium">
                  {item._id.slice(-5).toUpperCase()}
                </TableCell>
                <TableCell className="font-medium">
                  {item.inches}&quot;
                </TableCell>
                <TableCell>{item.item}</TableCell>
                <TableCell>{item.quality}</TableCell>
                <TableCell>{item.style}</TableCell>
                <TableCell>{item.color}</TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  {formatNumber(item.amountAvailable)}
                </TableCell>
                <TableCell className="text-right text-orange-600">
                  {formatNumber(item.amountOccupied)}
                </TableCell>
                <TableCell>{item.unitOfCalculation}</TableCell>
                <TableCell
                  className="text-center"
                  onClick={(e) => e.stopPropagation()}
                >
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
                        onClick={() => setAddStockWarehouse(item)}
                        className="cursor-pointer"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm hàng hóa
                      </DropdownMenuItem>
                      <RoleGate role="admin">
                        <DropdownMenuItem
                          onClick={() => setDeleteWarehouseItem(item)}
                          className="cursor-pointer text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </RoleGate>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AddStockDialog
        open={!!addStockWarehouse}
        onOpenChange={(open) => !open && setAddStockWarehouse(null)}
        warehouse={addStockWarehouse}
      />

      <DataTablePagination
        current={meta.current}
        pageSize={meta.pageSize}
        total={meta.total}
        pages={meta.pages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      <Dialog
        open={!!deleteWarehouseItem}
        onOpenChange={(open) => !open && setDeleteWarehouseItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa lô hàng{" "}
              <strong>
                {deleteWarehouseItem?._id.slice(-5).toUpperCase()}
              </strong>
              ? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteWarehouseItem(null)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteWarehouse.isPending}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
