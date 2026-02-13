"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PermissionGate } from "@/components/access-control";
import { DataTablePagination } from "@/components/layout/data-table-pagination";
import { useDeleteRole } from "../hooks/use-roles";
import { RoleFormDialog } from "./role-form-dialog";
import type { RoleItem, PaginationMeta } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RoleTableProps {
  roles: RoleItem[];
  meta: PaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function RoleTable({
  roles,
  meta,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: RoleTableProps) {
  const [editRole, setEditRole] = useState<RoleItem | null>(null);
  const [deleteRole, setDeleteRole] = useState<RoleItem | null>(null);
  const deleteRoleMutation = useDeleteRole();

  const handleDelete = () => {
    if (deleteRole) {
      deleteRoleMutation.mutate(deleteRole._id, {
        onSuccess: () => setDeleteRole(null),
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
    <>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Id</TableHead>
              <TableHead className="font-semibold">Tên vai trò</TableHead>
              <TableHead className="font-semibold">Mô tả</TableHead>
              <TableHead className="font-semibold">Số quyền</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="font-semibold">Ngày tạo</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role, index) => (
                <TableRow key={role._id}>
                  <TableCell className="font-mono font-medium">
                    {role._id.slice(-5).toUpperCase()}
                  </TableCell>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {role.description || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium bg-primary/5 text-primary border-primary/20">
                      {role.permissions?.length || 0} quyền
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        role.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20"
                      }
                      variant="outline"
                    >
                      {role.isActive ? "Hoạt động" : "Vô hiệu"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(role.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <PermissionGate
                          method="PATCH"
                          apiPath="/api/v1/roles/:id"
                        >
                          <DropdownMenuItem
                            onClick={() => setEditRole(role)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        </PermissionGate>
                        <PermissionGate
                          method="DELETE"
                          apiPath="/api/v1/roles/:id"
                        >
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteRole(role)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </PermissionGate>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        current={meta.current}
        pageSize={meta.pageSize}
        total={meta.total}
        pages={meta.pages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      <RoleFormDialog
        open={!!editRole}
        onOpenChange={(open) => !open && setEditRole(null)}
        role={editRole}
      />

      <Dialog
        open={!!deleteRole}
        onOpenChange={(open) => !open && setDeleteRole(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa vai trò{" "}
              <strong>{deleteRole?.name}</strong>? Hành động này không thể hoàn
              tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRole(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRoleMutation.isPending}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
