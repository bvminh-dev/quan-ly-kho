"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import { QUERY_KEYS } from "@/config";
import { toast } from "sonner";
import type {
  PaginationParams,
  CreateOrderDto,
  UpdateOrderDto,
  AddHistoryDto,
  RevertOrderDto,
} from "@/types/api";

export function useOrders(params: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ORDERS, params],
    queryFn: () => orderService.getAll(params),
    placeholderData: (prev) => prev,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER(id),
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateOrderDto) => orderService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WAREHOUSES });
    },
    onError: () => {
      toast.error("Tạo đơn hàng thất bại");
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOrderDto }) =>
      orderService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WAREHOUSES });
      toast.success("Cập nhật đơn hàng thành công");
    },
    onError: () => {
      toast.error("Cập nhật đơn hàng thất bại");
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WAREHOUSES });
      toast.success("Xóa đơn hàng thành công");
    },
    onError: () => {
      toast.error("Xóa đơn hàng thất bại");
    },
  });
}

export function useConfirmOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WAREHOUSES });
    },
    onError: () => {
      toast.error("Chốt đơn hàng thất bại");
    },
  });
}

export function useRevertOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RevertOrderDto }) =>
      orderService.revert(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WAREHOUSES });
      toast.success("Hoàn tác đơn hàng thành công");
    },
    onError: () => {
      toast.error("Hoàn tác đơn hàng thất bại");
    },
  });
}

export function useAddHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AddHistoryDto }) =>
      orderService.addHistory(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      toast.success("Ghi nhận thanh toán thành công");
    },
    onError: () => {
      toast.error("Ghi nhận thanh toán thất bại");
    },
  });
}
