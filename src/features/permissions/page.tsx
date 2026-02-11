"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/access-control";
import { PermissionTable } from "./components/permission-table";
import { PermissionFormDialog } from "./components/permission-form-dialog";
import { usePermissions } from "./hooks/use-permissions";

export default function PermissionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = usePermissions({ current: page, pageSize });

  const permissions = data?.data?.items ?? [];
  const meta = data?.data?.meta ?? {
    current: 1,
    pageSize: 10,
    pages: 1,
    total: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý quyền hạn
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các quyền truy cập API trong hệ thống
          </p>
        </div>
        <PermissionGate method="POST" apiPath="/api/v1/permissions">
          <Button onClick={() => setCreateOpen(true)} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm quyền hạn
          </Button>
        </PermissionGate>
      </div>

      <PermissionTable
        permissions={permissions}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <PermissionFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
