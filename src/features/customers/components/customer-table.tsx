"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/layout/data-table-pagination";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { useAccessControl } from "@/components/access-control";
import { useDeleteCustomer } from "../hooks/use-customers";
import { CustomerFormDialog } from "./customer-form-dialog";
import type { CustomerItem, PaginationMeta } from "@/types/api";
import { quickSearchFilter } from "@/utils/search";

interface CustomerTableProps {
  customers: CustomerItem[];
  meta: PaginationMeta;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function CustomerTable({
  customers,
  meta,
  isLoading,
  onPageChange,
  onPageSizeChange,
}: CustomerTableProps) {
  const router = useRouter();
  const { isAdmin } = useAccessControl();
  const deleteCustomer = useDeleteCustomer();
  const [editCustomer, setEditCustomer] = useState<CustomerItem | null>(null);
  const [deleteCustomerItem, setDeleteCustomerItem] = useState<CustomerItem | null>(null);
  const [search, setSearch] = useState("");

  const handleDelete = () => {
    if (deleteCustomerItem) {
      deleteCustomer.mutate(deleteCustomerItem._id, {
        onSuccess: () => setDeleteCustomerItem(null),
      });
    }
  };

  const filteredCustomers = useMemo(
    () =>
      quickSearchFilter(customers, search, (customer) => [
        customer._id,
        customer.name,
        customer.payment,
        customer.note,
        customer.createdAt,
      ]),
    [customers, search],
  );

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
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
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
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Id</TableHead>
              <TableHead className="font-semibold">Tên</TableHead>
              <TableHead className="font-semibold text-right">Số dư ($)</TableHead>
              <TableHead className="font-semibold">Ghi chú</TableHead>
              <TableHead className="font-semibold">Ngày tạo</TableHead>
              <TableHead className="font-semibold text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow
                  key={customer._id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => router.push(`/dashboard/customers/${customer._id}`)}
                >
                  <TableCell className="font-mono font-medium">{customer._id.slice(-5).toUpperCase()}</TableCell>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      customer.payment < 0
                        ? "text-red-600"
                        : customer.payment > 0
                        ? "text-green-600"
                        : ""
                    }`}
                  >
                    ${customer.payment.toFixed(2)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {customer.note || "-"}
                  </TableCell>
                  <TableCell>
                    {new Date(customer.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/customers/${customer._id}`)
                          }
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditCustomer(customer)}
                          className="cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Sửa
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem
                            onClick={() => setDeleteCustomerItem(customer)}
                            className="cursor-pointer text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
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

      <Dialog
        open={!!deleteCustomerItem}
        onOpenChange={(open) => !open && setDeleteCustomerItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa khách hàng{" "}
              <strong>{deleteCustomerItem?.name}</strong>? Hành động này không thể hoàn
              tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCustomerItem(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCustomer.isPending}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

      <CustomerFormDialog
        open={!!editCustomer}
        onOpenChange={(open) => !open && setEditCustomer(null)}
        customer={editCustomer}
      />
    </>
  );
}
