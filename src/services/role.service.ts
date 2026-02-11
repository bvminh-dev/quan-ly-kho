import axiosInstance from "@/lib/axios";
import { ROLE_ROUTES } from "@/config";
import type {
  ApiResponse,
  PaginatedData,
  PaginationParams,
  RoleItem,
  CreateRoleDto,
  UpdateRoleDto,
} from "@/types/api";

export const roleService = {
  getAll: async (params: PaginationParams) => {
    const { data } = await axiosInstance.get<
      ApiResponse<PaginatedData<RoleItem>>
    >(ROLE_ROUTES.BASE, { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<ApiResponse<RoleItem>>(
      ROLE_ROUTES.BY_ID(id)
    );
    return data;
  },

  create: async (dto: CreateRoleDto) => {
    const { data } = await axiosInstance.post<ApiResponse<RoleItem>>(
      ROLE_ROUTES.BASE,
      dto
    );
    return data;
  },

  update: async (id: string, dto: UpdateRoleDto) => {
    const { data } = await axiosInstance.patch<ApiResponse<RoleItem>>(
      ROLE_ROUTES.BY_ID(id),
      dto
    );
    return data;
  },

  delete: async (id: string) => {
    const { data } = await axiosInstance.delete<ApiResponse<RoleItem>>(
      ROLE_ROUTES.BY_ID(id)
    );
    return data;
  },
};
