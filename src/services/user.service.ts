import axiosInstance from "@/lib/axios";
import { USER_ROUTES } from "@/config";
import type {
  ApiResponse,
  PaginatedData,
  PaginationParams,
  UserItem,
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
  ResetPasswordDto,
} from "@/types/api";

export const userService = {
  getAll: async (params: PaginationParams) => {
    const { data } = await axiosInstance.get<
      ApiResponse<PaginatedData<UserItem>>
    >(USER_ROUTES.BASE, { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<ApiResponse<UserItem>>(
      USER_ROUTES.BY_ID(id)
    );
    return data;
  },

  create: async (dto: CreateUserDto) => {
    const { data } = await axiosInstance.post<ApiResponse<UserItem>>(
      USER_ROUTES.BASE,
      dto
    );
    return data;
  },

  update: async (id: string, dto: UpdateUserDto) => {
    const { data } = await axiosInstance.patch<ApiResponse<UserItem>>(
      USER_ROUTES.BY_ID(id),
      dto
    );
    return data;
  },

  delete: async (id: string) => {
    const { data } = await axiosInstance.delete<ApiResponse<UserItem>>(
      USER_ROUTES.BY_ID(id)
    );
    return data;
  },

  updatePassword: async (dto: UpdatePasswordDto) => {
    const { data } = await axiosInstance.patch<ApiResponse<boolean>>(
      USER_ROUTES.UPDATE_PASSWORD,
      dto
    );
    return data;
  },

  resetPassword: async (dto: ResetPasswordDto) => {
    const { data } = await axiosInstance.patch<ApiResponse<boolean>>(
      USER_ROUTES.RESET_PASSWORD,
      dto
    );
    return data;
  },
};
