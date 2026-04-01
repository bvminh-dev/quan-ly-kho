"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ReportDatePicker } from "./components/report-date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReportPeriod } from "@/types/api";
import { formatNGN, formatNumber, formatUSD } from "@/utils/currency";
import { useMemo, useState } from "react";
import {
  useCustomerReport,
  useOrderReport,
  useStaffReport,
} from "./hooks/use-reports";

type ReportTab = "orders" | "customers" | "staff";

const pad2 = (value: number) => String(value).padStart(2, "0");

const formatDateByPeriod = (date: Date, period: ReportPeriod): string => {
  const year = date.getFullYear();
  if (period === "year") return String(year);
  const month = pad2(date.getMonth() + 1);
  if (period === "month") return `${year}-${month}`;
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};

const getInputLabelByPeriod = (period: ReportPeriod) => {
  if (period === "year") return "Năm";
  if (period === "month") return "Tháng";
  return "Ngày";
};

const getPlaceholderByPeriod = (period: ReportPeriod) => {
  if (period === "year") return "Chọn năm (VD: 2026)";
  if (period === "month") return "Chọn tháng";
  return "Chọn ngày";
};

const isYearInputValid = (value: string) => /^\d{4}$/.test(value);

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("day");
  const [date, setDate] = useState(formatDateByPeriod(new Date(), "day"));
  const [activeTab, setActiveTab] = useState<ReportTab>("orders");
  const isDateReady = period === "year" ? isYearInputValid(date) : !!date;

  const queryParams = useMemo(
    () => ({
      period,
      date,
    }),
    [period, date],
  );

  const orderReportQuery = useOrderReport(
    queryParams,
    isDateReady && activeTab === "orders",
  );
  const customerReportQuery = useCustomerReport(
    queryParams,
    isDateReady && activeTab === "customers",
  );
  const staffReportQuery = useStaffReport(
    queryParams,
    isDateReady && activeTab === "staff",
  );

  const orderReport = orderReportQuery.data?.data;
  const customerRows = customerReportQuery.data?.data ?? [];
  const staffRows = staffReportQuery.data?.data ?? [];

  const isLoadingOrders =
    orderReportQuery.isLoading || orderReportQuery.isFetching;
  const isLoadingCustomers =
    customerReportQuery.isLoading || customerReportQuery.isFetching;
  const isLoadingStaff =
    staffReportQuery.isLoading || staffReportQuery.isFetching;

  const handlePeriodChange = (nextPeriod: ReportPeriod) => {
    setPeriod(nextPeriod);
    setDate(formatDateByPeriod(new Date(), nextPeriod));
  };

  const handleDateChange = (value: string) => setDate(value);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Báo cáo</h1>
        <p className="text-sm text-muted-foreground">
          Báo cáo tổng hợp theo đơn hàng, khách hàng và nhân viên
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc báo cáo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Kỳ báo cáo</Label>
              <div className="inline-flex h-9 rounded-md border bg-muted p-0.5">
                <button
                  type="button"
                  onClick={() => handlePeriodChange("day")}
                  className={`inline-flex items-center rounded-sm px-3 text-sm transition-all cursor-pointer ${period === "day"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                    }`}
                >
                  Ngày
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodChange("month")}
                  className={`inline-flex items-center rounded-sm px-3 text-sm transition-all cursor-pointer ${period === "month"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                    }`}
                >
                  Tháng
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriodChange("year")}
                  className={`inline-flex items-center rounded-sm px-3 text-sm transition-all cursor-pointer ${period === "year"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                    }`}
                >
                  Năm
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{getInputLabelByPeriod(period)}</Label>
              <ReportDatePicker
                period={period}
                value={date}
                onChange={handleDateChange}
                placeholder={getPlaceholderByPeriod(period)}
              />
            </div>

            {/* <div className="rounded-md border bg-muted/20 px-3 py-2">
              <p className="text-xs text-muted-foreground">Đang xem báo cáo</p>
              <p className="text-sm font-medium">
                {period === "day" && "Theo ngày"}
                {period === "month" && "Theo tháng"}
                {period === "year" && "Theo năm"}
                {": "}
                {formatDateDisplayVi(date, period)}
              </p>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {!isDateReady ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {period === "year"
              ? "Vui lòng nhập năm hợp lệ (VD: 2026) để xem dữ liệu báo cáo."
              : "Vui lòng chọn ngày hoặc tháng để xem dữ liệu báo cáo."}
          </CardContent>
        </Card>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ReportTab)}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="orders">Theo đơn hàng</TabsTrigger>
            <TabsTrigger value="customers">Theo khách hàng</TabsTrigger>
            <TabsTrigger value="staff">Theo nhân viên</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tổng số đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {isLoadingOrders ? (
                    <Skeleton className="h-6 w-32" />
                  ) : (
                    <div className="text-lg font-semibold">
                      {formatNumber(orderReport?.totalOrders ?? 0)}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tổng số lượng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {isLoadingOrders ? (
                    <Skeleton className="h-6 w-32" />
                  ) : (
                    <div className="text-lg font-semibold">
                      {formatNumber(orderReport?.totalOrdersKg ?? 0)} Kg {" - "}
                      {formatNumber(orderReport?.totalOrdersPcs ?? 0)} Pcs
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tổng giá trị hàng đã bán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {isLoadingOrders ? (
                    <Skeleton className="h-6 w-32" />
                  ) : (
                    <div className="text-lg font-semibold">
                      {formatUSD(orderReport?.totalValueUSD ?? 0)}
                    </div>
                  )}
                  
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tổng tiền đã thu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {isLoadingOrders ? (
                    <Skeleton className="h-6 w-32" />
                  ) : (
                    <div className="text-lg font-semibold">
                      {formatUSD(orderReport?.totalCollectedUSD ?? 0)}
                    </div>
                  )}
                  {isLoadingOrders ? (
                    <Skeleton className="h-5 w-28" />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {formatNGN(orderReport?.totalCollectedNGN ?? 0)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers">
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Khách hàng</TableHead>
                    <TableHead className="text-right">Tổng đơn hàng</TableHead>
                    <TableHead className="text-right">Kg</TableHead>
                    <TableHead className="text-right">Pcs</TableHead>
                    <TableHead className="text-right">Tổng tiền (USD)</TableHead>
                    <TableHead className="text-right">Đã trả (USD)</TableHead>
                    <TableHead className="text-right">Đã trả (NGN)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCustomers ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <TableRow key={`customer-skeleton-${idx}`}>
                        <TableCell colSpan={8}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : customerRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    customerRows.map((row) => (
                      <TableRow key={row.customerId}>
                        <TableCell className="font-medium">
                          {row.customerName}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(row.totalOrders ?? 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(row.totalOrdersKg ?? 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(row.totalOrdersPcs ?? 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatUSD(row.totalValueUSD ?? 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatUSD(row.totalCollectedUSD ?? 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNGN(row.totalCollectedNGN ?? 0)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Nhân viên</TableHead>
                    <TableHead className="text-right">Tổng số đơn hàng</TableHead>
                    <TableHead className="text-right">Khách hàng</TableHead>
                    <TableHead className="text-right">Kg</TableHead>
                    <TableHead className="text-right">Pcs</TableHead>
                    <TableHead className="text-right">Giá trị (USD)</TableHead>
                    <TableHead className="text-right">Thu về (NGN)</TableHead>
                    <TableHead className="text-right">Thu về (USD)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingStaff ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                      <TableRow key={`staff-skeleton-${idx}`}>
                        <TableCell colSpan={9}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : staffRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    staffRows.map((row) => (
                      <TableRow key={row.staffId}>
                        <TableCell className="font-medium">
                          {row.staffName}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(row.totalOrders ?? 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.totalCustomers ?? 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(row.totalOrdersKg ?? 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(row.totalOrdersPcs ?? 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatUSD(row.totalValueUSD ?? 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNGN(row.totalCollectedNGN ?? 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatUSD(row.totalCollectedUSD ?? 0)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
