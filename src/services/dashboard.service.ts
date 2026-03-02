import { DASHBOARD_ROUTES } from "@/config";
import axiosInstance from "@/lib/axios";
import type {
  ApiResponse,
  DashboardCustomerReportItem,
  DashboardOrderReport,
  DashboardReportParams,
  DashboardStaffReportItem,
} from "@/types/api";

export const dashboardService = {
  getOrderReport: async (params: DashboardReportParams) => {
    const { data } = await axiosInstance.get<ApiResponse<DashboardOrderReport>>(
      DASHBOARD_ROUTES.ORDER_REPORT,
      { params },
    );
    return data;
  },

  getCustomerReport: async (params: DashboardReportParams) => {
    const { data } = await axiosInstance.get<
      ApiResponse<DashboardCustomerReportItem[]>
    >(DASHBOARD_ROUTES.CUSTOMER_REPORT, { params });
    return data;
  },

  getStaffReport: async (params: DashboardReportParams) => {
    const { data } = await axiosInstance.get<ApiResponse<DashboardStaffReportItem[]>>(
      DASHBOARD_ROUTES.STAFF_REPORT,
      { params },
    );
    return data;
  },
};
