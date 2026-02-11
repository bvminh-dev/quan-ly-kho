import axiosInstance from "@/lib/axios";
import { PERMISSION_ROUTES } from "@/config";
import type {
  ApiResponse,
  PaginatedData,
  PaginationParams,
  PermissionItem,
  CreatePermissionDto,
  UpdatePermissionDto,
} from "@/types/api";

export const permissionService = {
  getAll: async (params: PaginationParams) => {
    const { data } = await axiosInstance.get<
      ApiResponse<PaginatedData<PermissionItem>>
    >(PERMISSION_ROUTES.BASE, { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<ApiResponse<PermissionItem>>(
      PERMISSION_ROUTES.BY_ID(id)
    );
    return data;
  },

  create: async (dto: CreatePermissionDto) => {
    const { data } = await axiosInstance.post<ApiResponse<PermissionItem>>(
      PERMISSION_ROUTES.BASE,
      dto
    );
    return data;
  },

  update: async (id: string, dto: UpdatePermissionDto) => {
    const { data } = await axiosInstance.patch<ApiResponse<PermissionItem>>(
      PERMISSION_ROUTES.BY_ID(id),
      dto
    );
    return data;
  },

  delete: async (id: string) => {
    const { data } = await axiosInstance.delete<ApiResponse<PermissionItem>>(
      PERMISSION_ROUTES.BY_ID(id)
    );
    return data;
  },
};
