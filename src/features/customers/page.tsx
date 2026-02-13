"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerTable } from "./components/customer-table";
import { CustomerFormDialog } from "./components/customer-form-dialog";
import { useCustomers } from "./hooks/use-customers";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useCustomers({ current: page, pageSize });

  const customers = data?.data?.items ?? [];
  const meta = data?.data?.meta ?? {
    current: 1,
    pageSize: 20,
    pages: 1,
    total: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Khách hàng</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý thông tin khách hàng
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shadow-sm cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Thêm khách hàng
        </Button>
      </div>

      <CustomerTable
        customers={customers}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <CustomerFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
