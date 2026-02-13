"use client";

import { useState, useMemo } from "react";
import { OrderTable } from "./components/order-table";
import { useOrders } from "./hooks/use-orders";
import { useAllWarehouses } from "@/features/warehouse/hooks/use-warehouses";
import type { WarehouseItem } from "@/types/api";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading } = useOrders({ 
    current: page, 
    pageSize,
    sort: "-createdAt"
  });
  const { data: whData } = useAllWarehouses();

  const orders = data?.data?.items ?? [];
  const meta = data?.data?.meta ?? {
    current: 1,
    pageSize: 20,
    pages: 1,
    total: 0,
  };

  const warehouseMap = useMemo(() => {
    const map: Record<string, WarehouseItem> = {};
    for (const wh of whData?.data?.items ?? []) {
      map[wh._id] = wh;
    }
    return map;
  }, [whData]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Đơn hàng</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý đơn hàng bán ra
        </p>
      </div>

      <OrderTable
        orders={orders}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        warehouseMap={warehouseMap}
      />
    </div>
  );
}
