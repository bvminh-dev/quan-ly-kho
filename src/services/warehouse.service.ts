import axiosInstance from "@/lib/axios";
import { WAREHOUSE_ROUTES } from "@/config";
import type {
  ApiResponse,
  PaginatedData,
  PaginationParams,
  WarehouseItem,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  AddStockBodyDto,
} from "@/types/api";

export const warehouseService = {
  getAll: async (params: PaginationParams) => {
    const { data } = await axiosInstance.get<
      ApiResponse<PaginatedData<WarehouseItem>>
    >(WAREHOUSE_ROUTES.BASE, { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<ApiResponse<WarehouseItem>>(
      WAREHOUSE_ROUTES.BY_ID(id)
    );
    return data;
  },

  create: async (dto: CreateWarehouseDto) => {
    const { data } = await axiosInstance.post<ApiResponse<WarehouseItem>>(
      WAREHOUSE_ROUTES.BASE,
      dto
    );
    return data;
  },

  update: async (id: string, dto: UpdateWarehouseDto) => {
    const { data } = await axiosInstance.patch<ApiResponse<WarehouseItem>>(
      WAREHOUSE_ROUTES.BY_ID(id),
      dto
    );
    return data;
  },

  delete: async (id: string) => {
    const { data } = await axiosInstance.delete<ApiResponse<null>>(
      WAREHOUSE_ROUTES.BY_ID(id)
    );
    return data;
  },

  addStock: async (dto: AddStockBodyDto) => {
    const { data } = await axiosInstance.post<ApiResponse<WarehouseItem>>(
      WAREHOUSE_ROUTES.ADD_STOCK,
      dto
    );
    return data;
  },
};
