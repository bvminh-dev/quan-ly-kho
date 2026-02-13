"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomer } from "../hooks/use-customers";
import { useOrders } from "@/features/orders/hooks/use-orders";
import { CustomerFormDialog } from "./customer-form-dialog";

interface CustomerDetailProps {
  customerId: string;
}

const stateColors: Record<string, string> = {
  "Báo giá": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "Đã chốt": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "Chỉnh sửa": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Đã hoàn": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const router = useRouter();
  const { data: custData, isLoading: custLoading } = useCustomer(customerId);
  const { data: ordersData } = useOrders({ current: 1, pageSize: 100 });
  const [editOpen, setEditOpen] = useState(false);

  const customer = custData?.data;

  const customerOrders = useMemo(() => {
    const allOrders = ordersData?.data?.items ?? [];
    return allOrders.filter((o) => o.customer?._id === customerId);
  }, [ordersData, customerId]);

  if (custLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Không tìm thấy khách hàng
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/customers")}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">Chi tiết khách hàng</p>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)} className="cursor-pointer">
          <Pencil className="h-4 w-4 mr-2" />
          Sửa thông tin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Số dư</CardTitle>
          </CardHeader>
          <CardContent>
            <span
              className={`text-2xl font-bold ${
                customer.payment < 0
                  ? "text-red-600"
                  : customer.payment > 0
                  ? "text-green-600"
                  : ""
              }`}
            >
              ${customer.payment.toFixed(2)}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {customer.payment < 0 ? "Nợ" : customer.payment > 0 ? "Trả thừa" : "Không nợ"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tổng đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{customerOrders.length}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Ghi chú</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm">{customer.note || "Không có ghi chú"}</span>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold mb-4">Đơn hàng của khách</h2>
        <div className="rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Trạng thái</TableHead>
                <TableHead className="font-semibold text-right">Tổng tiền</TableHead>
                <TableHead className="font-semibold text-right">Đã trả</TableHead>
                <TableHead className="font-semibold text-right">Còn lại</TableHead>
                <TableHead className="font-semibold">Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Chưa có đơn hàng
                  </TableCell>
                </TableRow>
              ) : (
                customerOrders.map((order) => {
                  const remaining = Math.max(0, -order.payment);
                  const paid = order.totalPrice - remaining;
                  return (
                    <TableRow
                      key={order._id}
                      className="hover:bg-muted/30 cursor-pointer"
                      onClick={() => router.push(`/dashboard/orders`)}
                    >
                      <TableCell className="font-mono font-medium">
                        {order._id.slice(-5).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <Badge className={stateColors[order.state] || ""}>
                          {order.state}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${order.totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        ${paid.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        ${remaining.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CustomerFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        customer={customer}
      />
    </div>
  );
}
