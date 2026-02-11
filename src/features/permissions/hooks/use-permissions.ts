"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { permissionService } from "@/services/permission.service";
import { QUERY_KEYS } from "@/config";
import { toast } from "sonner";
import type {
  CreatePermissionDto,
  UpdatePermissionDto,
  PaginationParams,
} from "@/types/api";

export function usePermissions(params: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PERMISSIONS, params],
    queryFn: () => permissionService.getAll(params),
    placeholderData: (prev) => prev,
  });
}

export function usePermissionsAll(params: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PERMISSIONS, "all", params],
    queryFn: () => permissionService.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePermission(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PERMISSION(id),
    queryFn: () => permissionService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePermissionDto) => permissionService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERMISSIONS });
      toast.success("Tạo quyền hạn thành công");
    },
    onError: () => {
      toast.error("Tạo quyền hạn thất bại");
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdatePermissionDto;
    }) => permissionService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERMISSIONS });
      toast.success("Cập nhật quyền hạn thành công");
    },
    onError: () => {
      toast.error("Cập nhật quyền hạn thất bại");
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permissionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERMISSIONS });
      toast.success("Xóa quyền hạn thành công");
    },
    onError: () => {
      toast.error("Xóa quyền hạn thất bại");
    },
  });
}
