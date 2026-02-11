import axiosInstance from "@/lib/axios";
import { AUTH_ROUTES } from "@/config";
import type {
  ApiResponse,
  SigninDto,
  SigninData,
  AccountData,
} from "@/types/api";

export const authService = {
  signin: async (dto: SigninDto) => {
    const { data } = await axiosInstance.post<ApiResponse<SigninData>>(
      AUTH_ROUTES.SIGNIN,
      dto
    );
    return data;
  },

  refreshToken: async () => {
    const { data } = await axiosInstance.get<ApiResponse<SigninData>>(
      AUTH_ROUTES.REFRESH
    );
    return data;
  },

  logout: async () => {
    const { data } = await axiosInstance.post<ApiResponse<string>>(
      AUTH_ROUTES.LOGOUT
    );
    return data;
  },

  getAccount: async () => {
    const { data } = await axiosInstance.get<ApiResponse<AccountData>>(
      AUTH_ROUTES.ACCOUNT
    );
    return data;
  },
};
