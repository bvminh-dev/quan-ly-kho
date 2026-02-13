"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/customer.service";
import { QUERY_KEYS } from "@/config";
import { toast } from "sonner";
import type {
  PaginationParams,
  CreateCustomerDto,
  UpdateCustomerDto,
} from "@/types/api";

export function useCustomers(params: PaginationParams) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CUSTOMERS, params],
    queryFn: () => customerService.getAll(params),
    placeholderData: (prev) => prev,
  });
}

export function useAllCustomers() {
  return useQuery({
    queryKey: [...QUERY_KEYS.CUSTOMERS, "all"],
    queryFn: () => customerService.getAll({ current: 1, pageSize: 9999 }),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CUSTOMER(id),
    queryFn: () => customerService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCustomerDto) => customerService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      toast.success("Tạo khách hàng thành công");
    },
    onError: () => {
      toast.error("Tạo khách hàng thất bại");
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCustomerDto }) =>
      customerService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      toast.success("Cập nhật khách hàng thành công");
    },
    onError: () => {
      toast.error("Cập nhật khách hàng thất bại");
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CUSTOMERS });
      toast.success("Xóa khách hàng thành công");
    },
    onError: () => {
      toast.error("Xóa khách hàng thất bại");
    },
  });
}
