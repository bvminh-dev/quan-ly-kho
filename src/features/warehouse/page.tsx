"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleGate } from "@/components/access-control";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarehouseTable } from "./components/warehouse-table";
import { WarehouseFormDialog } from "./components/warehouse-form-dialog";
import { useAllWarehouses } from "./hooks/use-warehouses";

const TAB_IN_STOCK = "in-stock";
const TAB_OUT_OF_STOCK = "out-of-stock";

function totalQuantity(item: { amountAvailable?: number; amountOccupied?: number }) {
  return (item.amountAvailable ?? 0) + (item.amountOccupied ?? 0);
}

export default function WarehousePage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(TAB_IN_STOCK);
  const [pageSize, setPageSize] = useState(100);
  const [pageInStock, setPageInStock] = useState(1);
  const [pageOutOfStock, setPageOutOfStock] = useState(1);

  const { data, isLoading } = useAllWarehouses();
  const allItems = data?.data?.items ?? [];

  const itemsInStock = useMemo(
    () => allItems.filter((i) => totalQuantity(i) > 0),
    [allItems],
  );
  const itemsOutOfStock = useMemo(
    () => allItems.filter((i) => totalQuantity(i) === 0),
    [allItems],
  );

  const pagesInStock = Math.max(1, Math.ceil(itemsInStock.length / pageSize));
  const pagesOutOfStock = Math.max(1, Math.ceil(itemsOutOfStock.length / pageSize));

  const metaInStock = useMemo(
    () => ({
      current: Math.min(pageInStock, pagesInStock),
      pageSize,
      total: itemsInStock.length,
      pages: pagesInStock,
    }),
    [itemsInStock.length, pageInStock, pageSize, pagesInStock],
  );
  const metaOutOfStock = useMemo(
    () => ({
      current: Math.min(pageOutOfStock, pagesOutOfStock),
      pageSize,
      total: itemsOutOfStock.length,
      pages: pagesOutOfStock,
    }),
    [itemsOutOfStock.length, pageOutOfStock, pageSize, pagesOutOfStock],
  );

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageInStock(1);
    setPageOutOfStock(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Kho hàng</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý tồn kho sản phẩm
          </p>
        </div>
        <RoleGate role="admin">
          <Button onClick={() => setCreateOpen(true)} className="shadow-sm cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </RoleGate>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value={TAB_IN_STOCK} className="cursor-pointer">
            Sản phẩm còn ({itemsInStock.length})
          </TabsTrigger>
          <TabsTrigger value={TAB_OUT_OF_STOCK} className="cursor-pointer">
            Sản phẩm hết ({itemsOutOfStock.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value={TAB_IN_STOCK} className="space-y-4 w-full min-w-0 mt-4">
          <WarehouseTable
            items={itemsInStock}
            meta={metaInStock}
            isLoading={isLoading}
            onPageChange={setPageInStock}
            onPageSizeChange={handlePageSizeChange}
            clientSidePagination
          />
        </TabsContent>
        <TabsContent value={TAB_OUT_OF_STOCK} className="space-y-4 w-full min-w-0 mt-4">
          <WarehouseTable
            items={itemsOutOfStock}
            meta={metaOutOfStock}
            isLoading={isLoading}
            onPageChange={setPageOutOfStock}
            onPageSizeChange={handlePageSizeChange}
            clientSidePagination
          />
        </TabsContent>
      </Tabs>

      <WarehouseFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
