"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/layout/data-table-pagination";
import { sortWarehouseItems } from "../utils/sort-warehouse";
import type { WarehouseItem, PaginationMeta } from "@/types/api";

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
  const sortedItems = useMemo(() => sortWarehouseItems(items), [items]);

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
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Id</TableHead>
            <TableHead className="font-semibold">Inch</TableHead>
            <TableHead className="font-semibold">Item</TableHead>
            <TableHead className="font-semibold">Quality</TableHead>
            <TableHead className="font-semibold">Style</TableHead>
            <TableHead className="font-semibold">Color</TableHead>
            <TableHead className="font-semibold text-right">Tổng SL</TableHead>
            <TableHead className="font-semibold text-right">Khả dụng</TableHead>
            <TableHead className="font-semibold text-right">Chiếm dụng</TableHead>
            <TableHead className="font-semibold">Đơn vị</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          ) : (
            sortedItems.map((item) => (
              <TableRow key={item._id} className="hover:bg-muted/30">
                <TableCell className="font-mono font-medium">{item._id.slice(-5).toUpperCase()}</TableCell>
                <TableCell className="font-medium">{item.inches}&quot;</TableCell>
                <TableCell>{item.item}</TableCell>
                <TableCell>{item.quality}</TableCell>
                <TableCell>{item.style}</TableCell>
                <TableCell>{item.color}</TableCell>
                <TableCell className="text-right">{item.totalAmount}</TableCell>
                <TableCell className="text-right font-medium text-green-600">
                  {item.amountAvailable}
                </TableCell>
                <TableCell className="text-right text-orange-600">
                  {item.amountOccupied}
                </TableCell>
                <TableCell>{item.unitOfCalculation}</TableCell>
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
  );
}
