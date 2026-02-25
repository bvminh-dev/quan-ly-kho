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
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PermissionGate } from "@/components/access-control";
import { DataTablePagination } from "@/components/layout/data-table-pagination";
import { useDeletePermission } from "../hooks/use-permissions";
import { PermissionFormDialog } from "./permission-form-dialog";
import type { PermissionItem, PaginationMeta } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { quickSearchFilter } from "@/utils/search";

const methodColors: Record<string, string> = {
  GET: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  POST: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  PATCH: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  PUT: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
  DELETE: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
};

interface PermissionTableProps {
  permissions: PermissionItem[];
  meta: PaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function PermissionTable({
  permissions,
  meta,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: PermissionTableProps) {
  const [editPermission, setEditPermission] = useState<PermissionItem | null>(
    null
  );
  const [deletePermission, setDeletePermission] =
    useState<PermissionItem | null>(null);
  const deletePermissionMutation = useDeletePermission();
  const [search, setSearch] = useState("");

  const filteredPermissions = useMemo(
    () =>
      quickSearchFilter(permissions, search, (perm) => [
        perm._id,
        perm.name,
        perm.apiPath,
        perm.method,
        perm.module,
        perm.isActive ? "active" : "inactive",
      ]),
    [permissions, search],
  );

  const handleDelete = () => {
    if (deletePermission) {
      deletePermissionMutation.mutate(deletePermission._id, {
        onSuccess: () => setDeletePermission(null),
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
        <div className="p-3 border-b bg-muted/40">
          <Input
            placeholder="Tìm nhanh theo mọi cột..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Id</TableHead>
              <TableHead className="font-semibold">Tên quyền</TableHead>
              <TableHead className="font-semibold">API Path</TableHead>
              <TableHead className="font-semibold">Method</TableHead>
              <TableHead className="font-semibold">Module</TableHead>
              <TableHead className="font-semibold">Trạng thái</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPermissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredPermissions.map((perm, index) => (
                <TableRow key={perm._id}>
                  <TableCell className="font-mono font-medium">
                    {perm._id.slice(-5).toUpperCase()}
                  </TableCell>
                  <TableCell className="font-medium">{perm.name}</TableCell>
                  <TableCell>
                    <code className="rounded-md bg-muted px-2 py-1 text-xs font-mono">
                      {perm.apiPath}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        methodColors[perm.method] || ""
                      }`}
                    >
                      {perm.method}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize font-medium bg-violet-500/5 text-violet-600 dark:text-violet-400 border-violet-500/20">
                      {perm.module}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        perm.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20"
                      }
                      variant="outline"
                    >
                      {perm.isActive ? "Hoạt động" : "Vô hiệu"}
                    </Badge>
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
                          apiPath="/api/v1/permissions/:id"
                        >
                          <DropdownMenuItem
                            onClick={() => setEditPermission(perm)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        </PermissionGate>
                        <PermissionGate
                          method="DELETE"
                          apiPath="/api/v1/permissions/:id"
                        >
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeletePermission(perm)}
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

      <PermissionFormDialog
        open={!!editPermission}
        onOpenChange={(open) => !open && setEditPermission(null)}
        permission={editPermission}
      />

      <Dialog
        open={!!deletePermission}
        onOpenChange={(open) => !open && setDeletePermission(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa quyền hạn{" "}
              <strong>{deletePermission?.name}</strong>? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletePermission(null)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePermissionMutation.isPending}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
