"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleGate } from "@/components/access-control";
import { WarehouseTable } from "./components/warehouse-table";
import { WarehouseFormDialog } from "./components/warehouse-form-dialog";
import { useWarehouses } from "./hooks/use-warehouses";

export default function WarehousePage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [createOpen, setCreateOpen] = useState(false);

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

      <WarehouseTable
        items={items}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <WarehouseFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
