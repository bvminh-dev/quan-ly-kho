"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/access-control";
import { UserTable } from "./components/user-table";
import { UserFormDialog } from "./components/user-form-dialog";
import { useUsers } from "./hooks/use-users";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useUsers({ current: page, pageSize });

  const users = data?.data?.items ?? [];
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
            Quản lý người dùng
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>
        <PermissionGate method="POST" apiPath="/api/v1/users">
          <Button onClick={() => setCreateOpen(true)} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
        </PermissionGate>
      </div>

      <UserTable
        users={users}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <UserFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
