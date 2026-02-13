"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { warehouseService } from "@/services/warehouse.service";
import { QUERY_KEYS } from "@/config";
import { toast } from "sonner";
import type {
  PaginationParams,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from "@/types/api";

export function useWarehouses(params: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.WAREHOUSES, params],
    queryFn: () => warehouseService.getAll(params),
    placeholderData: (prev) => prev,
  });
}

export function useAllWarehouses() {
  return useQuery({
    queryKey: [...QUERY_KEYS.WAREHOUSES, "all"],
    queryFn: () => warehouseService.getAll({ current: 1, pageSize: 9999 }),
  });
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.WAREHOUSE(id),
    queryFn: () => warehouseService.getById(id),
    enabled: !!id,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateWarehouseDto) => warehouseService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WAREHOUSES });
      toast.success("Tạo sản phẩm kho thành công");
    },
    onError: () => {
      toast.error("Tạo sản phẩm kho thất bại");
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateWarehouseDto }) =>
      warehouseService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WAREHOUSES });
      toast.success("Cập nhật kho thành công");
    },
    onError: () => {
      toast.error("Cập nhật kho thất bại");
    },
  });
}
