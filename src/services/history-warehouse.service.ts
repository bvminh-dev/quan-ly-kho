import axiosInstance from "@/lib/axios";
import { HISTORY_WAREHOUSE_ROUTES } from "@/config";
import type {
  ApiResponse,
  PaginatedData,
  PaginationParams,
  HistoryEnterItem,
  HistoryExportItem,
  CreateHistoryEnterDto,
  UpdateHistoryEnterDto,
  CreateHistoryExportDto,
  UpdateHistoryExportDto,
} from "@/types/api";

export const historyWarehouseService = {
  enter: {
    getAll: async (params: PaginationParams) => {
      const { data } = await axiosInstance.get<
        ApiResponse<PaginatedData<HistoryEnterItem>>
      >(HISTORY_WAREHOUSE_ROUTES.ENTER_BASE, { params });
      return data;
    },

    getById: async (id: string) => {
      const { data } = await axiosInstance.get<ApiResponse<HistoryEnterItem>>(
        HISTORY_WAREHOUSE_ROUTES.ENTER_BY_ID(id)
      );
      return data;
    },

    create: async (dto: CreateHistoryEnterDto) => {
      const { data } = await axiosInstance.post<ApiResponse<HistoryEnterItem>>(
        HISTORY_WAREHOUSE_ROUTES.ENTER_BASE,
        dto
      );
      return data;
    },

    update: async (id: string, dto: UpdateHistoryEnterDto) => {
      const { data } = await axiosInstance.patch<ApiResponse<HistoryEnterItem>>(
        HISTORY_WAREHOUSE_ROUTES.ENTER_BY_ID(id),
        dto
      );
      return data;
    },

    delete: async (id: string) => {
      const { data } = await axiosInstance.delete<ApiResponse<null>>(
        HISTORY_WAREHOUSE_ROUTES.ENTER_BY_ID(id)
      );
      return data;
    },
  },

  export: {
    getAll: async (params: PaginationParams) => {
      const { data } = await axiosInstance.get<
        ApiResponse<PaginatedData<HistoryExportItem>>
      >(HISTORY_WAREHOUSE_ROUTES.EXPORT_BASE, { params });
      return data;
    },

    getById: async (id: string) => {
      const { data } = await axiosInstance.get<ApiResponse<HistoryExportItem>>(
        HISTORY_WAREHOUSE_ROUTES.EXPORT_BY_ID(id)
      );
      return data;
    },

    create: async (dto: CreateHistoryExportDto) => {
      const { data } = await axiosInstance.post<ApiResponse<HistoryExportItem>>(
        HISTORY_WAREHOUSE_ROUTES.EXPORT_BASE,
        dto
      );
      return data;
    },

    update: async (id: string, dto: UpdateHistoryExportDto) => {
      const { data } = await axiosInstance.patch<ApiResponse<HistoryExportItem>>(
        HISTORY_WAREHOUSE_ROUTES.EXPORT_BY_ID(id),
        dto
      );
      return data;
    },

    delete: async (id: string) => {
      const { data } = await axiosInstance.delete<ApiResponse<null>>(
        HISTORY_WAREHOUSE_ROUTES.EXPORT_BY_ID(id)
      );
      return data;
    },
  },
};
