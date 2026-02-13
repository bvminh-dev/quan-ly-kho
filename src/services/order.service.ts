import axiosInstance from "@/lib/axios";
import { ORDER_ROUTES } from "@/config";
import type {
  ApiResponse,
  PaginatedData,
  PaginationParams,
  OrderDetail,
  CreateOrderDto,
  UpdateOrderDto,
  AddHistoryDto,
  RevertOrderDto,
} from "@/types/api";

export const orderService = {
  getAll: async (params: PaginationParams) => {
    const { data } = await axiosInstance.get<
      ApiResponse<PaginatedData<OrderDetail>>
    >(ORDER_ROUTES.BASE, { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<ApiResponse<OrderDetail>>(
      ORDER_ROUTES.BY_ID(id)
    );
    return data;
  },

  create: async (dto: CreateOrderDto) => {
    const { data } = await axiosInstance.post<ApiResponse<OrderDetail>>(
      ORDER_ROUTES.BASE,
      dto
    );
    return data;
  },

  update: async (id: string, dto: UpdateOrderDto) => {
    const { data } = await axiosInstance.patch<ApiResponse<OrderDetail>>(
      ORDER_ROUTES.BY_ID(id),
      dto
    );
    return data;
  },

  delete: async (id: string) => {
    const { data } = await axiosInstance.delete<ApiResponse<null>>(
      ORDER_ROUTES.BY_ID(id)
    );
    return data;
  },

  addHistory: async (id: string, dto: AddHistoryDto) => {
    const { data } = await axiosInstance.post<ApiResponse<OrderDetail>>(
      ORDER_ROUTES.HISTORY(id),
      dto
    );
    return data;
  },

  confirm: async (id: string) => {
    const { data } = await axiosInstance.patch<ApiResponse<OrderDetail>>(
      ORDER_ROUTES.CONFIRM(id)
    );
    return data;
  },

  revert: async (id: string, dto: RevertOrderDto) => {
    const { data } = await axiosInstance.patch<ApiResponse<OrderDetail>>(
      ORDER_ROUTES.REVERT(id),
      dto
    );
    return data;
  },
};
