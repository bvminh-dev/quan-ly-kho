"use client";

import { useState } from "react";
import { PriceTable } from "./components/price-table";
import { useWarehouses } from "@/features/warehouse/hooks/use-warehouses";

export default function PriceListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const { data, isLoading } = useWarehouses({ current: page, pageSize });

  const items = data?.data?.items ?? [];
  const meta = data?.data?.meta ?? {
    current: 1,
    pageSize: 100,
    pages: 1,
    total: 0,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Bảng giá</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý bảng giá sản phẩm
        </p>
      </div>

      <PriceTable
        items={items}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
