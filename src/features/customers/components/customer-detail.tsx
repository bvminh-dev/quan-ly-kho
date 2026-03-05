"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrders } from "@/features/orders/hooks/use-orders";
import { ArrowLeft, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCustomer } from "../hooks/use-customers";
import { CustomerFormDialog } from "./customer-form-dialog";
import { ORDER_STATE_CONFIG } from "@/features/orders/constants/order-state-config";
import { formatNGN, formatNumber, formatUSD } from "@/utils/currency";

interface CustomerDetailProps {
  customerId: string;
}

const ALL_STATES = [
  "báo giá",
  "đã chốt",
  "chỉnh sửa",
  "hoàn tác",
  "đã hoàn",
  "đã xong",
  "đã giao",
  "hoàn đơn",
] as const;

export function CustomerDetail({ customerId }: CustomerDetailProps) {
  const router = useRouter();
  const { data: custData, isLoading: custLoading } = useCustomer(customerId);
  const { data: ordersData } = useOrders({
    current: 1,
    pageSize: 100,
    sort: "-createdAt",
  });
  const [editOpen, setEditOpen] = useState(false);
  const [selectedStates, setSelectedStates] = useState<Set<string>>(
    () =>
      new Set(
        ALL_STATES.filter(
          (s) => s !== "báo giá" && s !== "hoàn đơn" && s !== "hoàn tác",
        ),
      ),
  );

  const customer = custData?.data;

  const customerOrders = useMemo(() => {
    const allOrders = ordersData?.data?.items ?? [];
    return allOrders.filter((o) => o.customer?._id === customerId);
  }, [ordersData, customerId]);

  const availableStates = useMemo(() => {
    const states = new Set(customerOrders.map((o) => o.state?.toLowerCase()));
    return ALL_STATES.filter((s) => states.has(s));
  }, [customerOrders]);

  const filteredOrders = useMemo(
    () =>
      customerOrders.filter((o) => selectedStates.has(o.state?.toLowerCase())),
    [customerOrders, selectedStates],
  );

  const toggleState = (state: string) => {
    setSelectedStates((prev) => {
      const next = new Set(prev);
      if (next.has(state)) next.delete(state);
      else next.add(state);
      return next;
    });
  };

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
        <Button
          variant="outline"
          onClick={() => setEditOpen(true)}
          className="cursor-pointer"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Sửa thông tin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Số dư
            </CardTitle>
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
              {formatUSD(customer.payment)}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {customer.payment < 0
                ? "Nợ"
                : customer.payment > 0
                  ? "Trả thừa"
                  : "Không nợ"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Tổng đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{customerOrders.length}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Ghi chú
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm">
              {customer.note || "Không có ghi chú"}
            </span>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h2 className="text-lg font-semibold">Đơn hàng của khách</h2>
          <span className="text-sm text-muted-foreground">
            ({filteredOrders.length}/{customerOrders.length})
          </span>
        </div>
        {availableStates.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {availableStates.map((state) => {
              const cfg =
                ORDER_STATE_CONFIG[state as keyof typeof ORDER_STATE_CONFIG];
              const active = selectedStates.has(state);
              return (
                <button
                  key={state}
                  type="button"
                  onClick={() => toggleState(state)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-opacity cursor-pointer ${
                    cfg?.className ||
                    "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
                  } ${active ? "opacity-100" : "opacity-35"}`}
                >
                  <span
                    className={`size-1.5 rounded-full shrink-0 ${cfg?.dot || "bg-gray-500"}`}
                  />
                  {state.charAt(0).toUpperCase() + state.slice(1)}
                </button>
              );
            })}
          </div>
        )}
        <div className="rounded-lg border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Trạng thái</TableHead>
                <TableHead className="font-semibold text-right">
                  Tổng tiền (USD / NGN)
                </TableHead>
                <TableHead className="font-semibold text-right">
                  Đã trả (USD / NGN)
                </TableHead>
                <TableHead className="font-semibold text-right">
                  Còn lại (USD / NGN)
                </TableHead>
                <TableHead className="font-semibold text-right">
                  Tỷ giá
                </TableHead>
                <TableHead className="font-semibold">Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {customerOrders.length === 0
                      ? "Chưa có đơn hàng"
                      : "Không có đơn hàng phù hợp với bộ lọc"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const totalUSD = order.totalUsd ?? 0;
                  const { paidUSD, paidNGN } = (order.history ?? []).reduce(
                    (acc, h) => {
                      const sign =
                        h.type?.toLowerCase() === "hoàn tiền" ? -1 : 1;
                      return {
                        paidUSD: acc.paidUSD + sign * (h.moneyPaidDolar ?? 0),
                        paidNGN: acc.paidNGN + sign * (h.moneyPaidNGN ?? 0),
                      };
                    },
                    { paidUSD: 0, paidNGN: 0 },
                  );

                  const rawRemainingUSD = totalUSD - paidUSD;
                  const rawRemainingNGN = rawRemainingUSD * order.exchangeRate;

                  const remainingUSDSign =
                    rawRemainingUSD === 0
                      ? ""
                      : rawRemainingUSD > 0
                        ? "-"
                        : "+";
                  const remainingNGNSign =
                    rawRemainingNGN === 0
                      ? ""
                      : rawRemainingNGN > 0
                        ? "-"
                        : "+";

                  const remainingUSDClass =
                    rawRemainingUSD === 0
                      ? "text-muted-foreground"
                      : rawRemainingUSD > 0
                        ? "text-red-600"
                        : "text-green-600";
                  const remainingNGNClass =
                    rawRemainingNGN === 0
                      ? "text-muted-foreground"
                      : rawRemainingNGN > 0
                        ? "text-red-600"
                        : "text-green-600";

                  const remainingUSD = Math.abs(rawRemainingUSD);
                  const remainingNGN = Math.abs(rawRemainingNGN);
                  const lowerState = order.state?.toLowerCase() as
                    | keyof typeof ORDER_STATE_CONFIG
                    | undefined;
                  const stateCfg = lowerState
                    ? ORDER_STATE_CONFIG[lowerState]
                    : undefined;
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
                        <Badge
                          variant="outline"
                          className={
                            stateCfg?.className ||
                            "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
                          }
                        >
                          <span
                            className={`size-2 rounded-full shrink-0 ${stateCfg?.dot || "bg-gray-500"}`}
                          />
                          {order.state}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-medium">
                            {formatUSD(totalUSD)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatNGN(totalUSD * order.exchangeRate)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-medium text-green-600">
                            {formatUSD(paidUSD)}
                          </span>
                          <span className="text-xs text-green-600">
                            {formatNGN(paidNGN)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-medium ${remainingUSDClass}`}>
                            {remainingUSDSign}
                            {formatUSD(remainingUSD)}
                          </span>
                          <span className={`text-xs ${remainingNGNClass}`}>
                            {remainingNGNSign}
                            {formatNGN(remainingNGN)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">
                          1 USD = {formatNumber(order.exchangeRate)} NGN
                        </span>
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
