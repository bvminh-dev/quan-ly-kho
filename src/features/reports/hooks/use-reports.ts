"use client";

import { QUERY_KEYS } from "@/config";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardReportParams } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

export function useOrderReport(params: DashboardReportParams, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.DASHBOARD_ORDER_REPORT, params],
    queryFn: () => dashboardService.getOrderReport(params),
    placeholderData: (prev) => prev,
    enabled,
    // refetchOnMount: "always",
    staleTime: 30000,
  });
}

export function useCustomerReport(
  params: DashboardReportParams,
  enabled = true,
) {
  return useQuery({
    queryKey: [...QUERY_KEYS.DASHBOARD_CUSTOMER_REPORT, params],
    queryFn: () => dashboardService.getCustomerReport(params),
    placeholderData: (prev) => prev,
    enabled,
    // refetchOnMount: "always",
    staleTime: 30000,
  });
}

export function useStaffReport(params: DashboardReportParams, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.DASHBOARD_STAFF_REPORT, params],
    queryFn: () => dashboardService.getStaffReport(params),
    placeholderData: (prev) => prev,
    enabled,
    // refetchOnMount: "always",
    staleTime: 30000,
  });
}
