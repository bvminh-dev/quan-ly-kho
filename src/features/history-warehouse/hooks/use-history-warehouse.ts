"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { historyWarehouseService } from "@/services/history-warehouse.service";
import { QUERY_KEYS } from "@/config";
import { toast } from "sonner";
import type {
  PaginationParams,
  CreateHistoryEnterDto,
  UpdateHistoryEnterDto,
  CreateHistoryExportDto,
  UpdateHistoryExportDto,
} from "@/types/api";

export function useHistoryEnter(params: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.HISTORY_ENTER, params],
    queryFn: () => historyWarehouseService.enter.getAll(params),
    placeholderData: (prev) => prev,
  });
}

export function useHistoryEnterItem(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.HISTORY_ENTER_ITEM(id),
    queryFn: () => historyWarehouseService.enter.getById(id),
    enabled: !!id,
  });
}

export function useCreateHistoryEnter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateHistoryEnterDto) =>
      historyWarehouseService.enter.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HISTORY_ENTER });
      toast.success("Tạo lịch sử nhập kho thành công");
    },
    onError: () => {
      toast.error("Tạo lịch sử nhập kho thất bại");
    },
  });
}

export function useUpdateHistoryEnter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateHistoryEnterDto;
    }) => historyWarehouseService.enter.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HISTORY_ENTER });
      toast.success("Cập nhật lịch sử nhập kho thành công");
    },
    onError: () => {
      toast.error("Cập nhật lịch sử nhập kho thất bại");
    },
  });
}

export function useDeleteHistoryEnter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => historyWarehouseService.enter.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HISTORY_ENTER });
      toast.success("Xóa lịch sử nhập kho thành công");
    },
    onError: () => {
      toast.error("Xóa lịch sử nhập kho thất bại");
    },
  });
}

export function useHistoryExport(params: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.HISTORY_EXPORT, params],
    queryFn: () => historyWarehouseService.export.getAll(params),
    placeholderData: (prev) => prev,
  });
}

export function useHistoryExportItem(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.HISTORY_EXPORT_ITEM(id),
    queryFn: () => historyWarehouseService.export.getById(id),
    enabled: !!id,
  });
}

export function useCreateHistoryExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateHistoryExportDto) =>
      historyWarehouseService.export.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HISTORY_EXPORT });
      toast.success("Tạo lịch sử xuất kho thành công");
    },
    onError: () => {
      toast.error("Tạo lịch sử xuất kho thất bại");
    },
  });
}

export function useUpdateHistoryExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateHistoryExportDto;
    }) => historyWarehouseService.export.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HISTORY_EXPORT });
      toast.success("Cập nhật lịch sử xuất kho thành công");
    },
    onError: () => {
      toast.error("Cập nhật lịch sử xuất kho thất bại");
    },
  });
}

export function useDeleteHistoryExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => historyWarehouseService.export.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HISTORY_EXPORT });
      toast.success("Xóa lịch sử xuất kho thành công");
    },
    onError: () => {
      toast.error("Xóa lịch sử xuất kho thất bại");
    },
  });
}
