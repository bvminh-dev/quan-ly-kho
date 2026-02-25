"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roleService } from "@/services/role.service";
import { QUERY_KEYS } from "@/config";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/api-error";
import type {
  CreateRoleDto,
  UpdateRoleDto,
  PaginationParams,
} from "@/types/api";

export function useRoles(params: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ROLES, params],
    queryFn: () => roleService.getAll(params),
    placeholderData: (prev) => prev,
  });
}

export function useRolesAll(params: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ROLES, "all", params],
    queryFn: () => roleService.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ROLE(id),
    queryFn: () => roleService.getById(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateRoleDto) => roleService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES });
      toast.success("Tạo vai trò thành công");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Tạo vai trò thất bại"));
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoleDto }) =>
      roleService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES });
      toast.success("Cập nhật vai trò thành công");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Cập nhật vai trò thất bại"));
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES });
      toast.success("Xóa vai trò thành công");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Xóa vai trò thất bại"));
    },
  });
}
