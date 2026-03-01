"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import { QUERY_KEYS } from "@/config";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/api-error";
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HISTORY_EXPORT });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Tạo đơn hàng thất bại"));
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HISTORY_EXPORT });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      toast.success("Cập nhật đơn hàng thành công");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Cập nhật đơn hàng thất bại"));
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HISTORY_EXPORT });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      toast.success("Xóa đơn hàng thành công");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Xóa đơn hàng thất bại"));
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HISTORY_EXPORT });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Chốt đơn hàng thất bại"));
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HISTORY_EXPORT });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      toast.success("Hoàn tác đơn hàng thành công");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Hoàn tác đơn hàng thất bại"));
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WAREHOUSES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HISTORY_EXPORT });
      toast.success("Ghi nhận thanh toán thành công");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Ghi nhận thanh toán thất bại"));
    },
  });
}

export function useDeliverOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      orderService.deliver(id, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WAREHOUSES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HISTORY_EXPORT });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      toast.success("Cập nhật trạng thái Đã giao thành công");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Cập nhật trạng thái Đã giao thất bại"));
    },
  });
}