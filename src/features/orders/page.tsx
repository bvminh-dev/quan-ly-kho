"use client";

import { useMemo, useState } from "react";
import { OrderTable } from "./components/order-table";
import { useOrders } from "./hooks/use-orders";
import { useAllWarehouses } from "@/features/warehouse/hooks/use-warehouses";
import type { WarehouseItem } from "@/types/api";
import { ReportDatePicker } from "@/features/reports/components/report-date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function toStartOfDayUtc(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  return date.toISOString();
}

function toEndOfDayUtc(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 0));
  return date.toISOString();
}

const ORDER_STATE_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "Tất cả trạng thái", value: "ALL" },
  { label: "Báo giá", value: "báo giá" },
  { label: "Đã chốt", value: "đã chốt" },
  { label: "Chỉnh sửa", value: "chỉnh sửa" },
  { label: "Hoàn tác", value: "hoàn tác" },
  { label: "Đã hoàn", value: "đã hoàn" },
  { label: "Đã xong", value: "đã xong" },
  { label: "Đã giao", value: "đã giao" },
  { label: "Khách trả", value: "khách trả" },
  { label: "Hoàn đơn", value: "hoàn đơn" },
];

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [stateFilter, setStateFilter] = useState<string | undefined>();
  const [createdFromDate, setCreatedFromDate] = useState<string>("");
  const [createdToDate, setCreatedToDate] = useState<string>("");

  const createdFrom = useMemo(
    () => toStartOfDayUtc(createdFromDate || undefined),
    [createdFromDate],
  );

  const createdTo = useMemo(
    () => toEndOfDayUtc(createdToDate || undefined),
    [createdToDate],
  );

  const { data, isLoading } = useOrders({
    current: page,
    pageSize,
    sort: "-createdAt",
    state: stateFilter,
    createdFrom,
    createdTo,
  });
  const { data: whData } = useAllWarehouses();

  const orders = data?.data?.items ?? [];
  const meta = data?.data?.meta ?? {
    current: 1,
    pageSize: 20,
    pages: 1,
    total: 0,
  };

  const warehouseMap = useMemo(() => {
    const map: Record<string, WarehouseItem> = {};
    for (const wh of whData?.data?.items ?? []) {
      map[wh._id] = wh;
    }
    return map;
  }, [whData]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Đơn hàng</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý đơn hàng bán ra
        </p>
      </div>

      {/* <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Trạng thái:</span>
          <Select
            value={stateFilter ?? "ALL"}
            onValueChange={(value) => {
              if (value === "ALL") {
                setStateFilter(undefined);
              } else {
                setStateFilter(value);
              }
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATE_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Thời gian tạo:
          </span>
          <div className="flex items-center gap-2">
            <ReportDatePicker
              period="day"
              value={createdFromDate}
              onChange={(v) => {
                setCreatedFromDate(v);
                setPage(1);
              }}
              placeholder="Từ ngày"
            />
            <span className="text-xs text-muted-foreground">đến</span>
            <ReportDatePicker
              period="day"
              value={createdToDate}
              onChange={(v) => {
                setCreatedToDate(v);
                setPage(1);
              }}
              placeholder="Đến ngày"
            />
          </div>
        </div>
      </div> */}

      <OrderTable
        orders={orders}
        meta={meta}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        warehouseMap={warehouseMap}
      />
    </div>
  );
}
