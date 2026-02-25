"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { QUERY_KEYS } from "@/config";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/api-error";
import type {
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
  PaginationParams,
  ResetPasswordDto,
} from "@/types/api";

export function useUsers(params: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS, params],
    queryFn: () => userService.getAll(params),
    placeholderData: (prev) => prev,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.USER(id),
    queryFn: () => userService.getById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateUserDto) => userService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      toast.success("Tạo người dùng thành công");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Tạo người dùng thất bại"));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) =>
      userService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      toast.success("Cập nhật người dùng thành công");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Cập nhật người dùng thất bại"));
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
      toast.success("Xóa người dùng thành công");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Xóa người dùng thất bại"));
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (dto: UpdatePasswordDto) => userService.updatePassword(dto),
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại",
        ),
      );
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (dto: ResetPasswordDto) => userService.resetPassword(dto),
    onSuccess: () => {
      toast.success("Reset mật khẩu thành công");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Reset mật khẩu thất bại"));
    },
  });
}
