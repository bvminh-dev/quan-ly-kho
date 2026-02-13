import axiosInstance from "@/lib/axios";
import { CUSTOMER_ROUTES } from "@/config";
import type {
  ApiResponse,
  PaginatedData,
  PaginationParams,
  CustomerItem,
  CreateCustomerDto,
  UpdateCustomerDto,
} from "@/types/api";

export const customerService = {
  getAll: async (params: PaginationParams) => {
    const { data } = await axiosInstance.get<
      ApiResponse<PaginatedData<CustomerItem>>
    >(CUSTOMER_ROUTES.BASE, { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<ApiResponse<CustomerItem>>(
      CUSTOMER_ROUTES.BY_ID(id)
    );
    return data;
  },

  create: async (dto: CreateCustomerDto) => {
    const { data } = await axiosInstance.post<ApiResponse<CustomerItem>>(
      CUSTOMER_ROUTES.BASE,
      dto
    );
    return data;
  },

  update: async (id: string, dto: UpdateCustomerDto) => {
    const { data } = await axiosInstance.patch<ApiResponse<CustomerItem>>(
      CUSTOMER_ROUTES.BY_ID(id),
      dto
    );
    return data;
  },

  delete: async (id: string) => {
    const { data } = await axiosInstance.delete<ApiResponse<null>>(
      CUSTOMER_ROUTES.BY_ID(id)
    );
    return data;
  },
};
