"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/layout/data-table-pagination";
import { Pencil, Check, X } from "lucide-react";
import { sortWarehouseItems } from "@/features/warehouse/utils/sort-warehouse";
import { useUpdateWarehouse } from "@/features/warehouse/hooks/use-warehouses";
import { useAccessControl } from "@/components/access-control";
import type { WarehouseItem, PaginationMeta } from "@/types/api";

interface PriceTableProps {
  items: WarehouseItem[];
  meta: PaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function PriceTable({
  items,
  meta,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: PriceTableProps) {
  const sortedItems = useMemo(() => sortWarehouseItems(items), [items]);
  const { isAdmin } = useAccessControl();
  const updateWarehouse = useUpdateWarehouse();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    priceHigh: 0,
    priceLow: 0,
    sale: 0,
  });

  const startEdit = (item: WarehouseItem) => {
    setEditingId(item._id);
    setEditValues({
      priceHigh: item.priceHigh,
      priceLow: item.priceLow,
      sale: item.sale,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateWarehouse.mutateAsync({
      id: editingId,
      dto: editValues,
    });
    setEditingId(null);
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
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Id</TableHead>
            <TableHead className="font-semibold">Inch</TableHead>
            <TableHead className="font-semibold">Item</TableHead>
            <TableHead className="font-semibold">Quality</TableHead>
            <TableHead className="font-semibold">Style</TableHead>
            <TableHead className="font-semibold">Color</TableHead>
            <TableHead className="font-semibold text-right">Giá cao ($)</TableHead>
            <TableHead className="font-semibold text-right">Giá thấp ($)</TableHead>
            <TableHead className="font-semibold text-right">Giảm giá ($)</TableHead>
            {isAdmin && <TableHead className="font-semibold text-center">Thao tác</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 10 : 9} className="h-24 text-center text-muted-foreground">
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
                <TableCell className="text-right">
                  {editingId === item._id ? (
                    <Input
                      type="number"
                      value={editValues.priceHigh}
                      onChange={(e) =>
                        setEditValues((v) => ({ ...v, priceHigh: Number(e.target.value) }))
                      }
                      className="h-8 w-24 ml-auto text-right"
                    />
                  ) : (
                    `$${item.priceHigh.toFixed(2)}`
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === item._id ? (
                    <Input
                      type="number"
                      value={editValues.priceLow}
                      onChange={(e) =>
                        setEditValues((v) => ({ ...v, priceLow: Number(e.target.value) }))
                      }
                      className="h-8 w-24 ml-auto text-right"
                    />
                  ) : (
                    `$${item.priceLow.toFixed(2)}`
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {editingId === item._id ? (
                    <Input
                      type="number"
                      value={editValues.sale}
                      onChange={(e) =>
                        setEditValues((v) => ({ ...v, sale: Number(e.target.value) }))
                      }
                      className="h-8 w-24 ml-auto text-right"
                    />
                  ) : (
                    `$${item.sale.toFixed(2)}`
                  )}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-center">
                    {editingId === item._id ? (
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-green-600 hover:text-green-700 cursor-pointer"
                          onClick={saveEdit}
                          disabled={updateWarehouse.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-600 hover:text-red-700 cursor-pointer"
                          onClick={cancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 cursor-pointer"
                        onClick={() => startEdit(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </TableCell>
                )}
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
