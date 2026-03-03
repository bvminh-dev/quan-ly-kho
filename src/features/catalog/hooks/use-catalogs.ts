"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  inchService,
  itemService,
  qualityService,
  styleService,
  colorService,
} from "@/services/catalog.service";
import { QUERY_KEYS } from "@/config";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/api-error";
import type { CreateCatalogDto, UpdateCatalogDto } from "@/types/api";

export function useInchs() {
  return useQuery({
    queryKey: QUERY_KEYS.CATALOG_INCHS,
    queryFn: () => inchService.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useItems() {
  return useQuery({
    queryKey: QUERY_KEYS.CATALOG_ITEMS,
    queryFn: () => itemService.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useQualitys() {
  return useQuery({
    queryKey: QUERY_KEYS.CATALOG_QUALITYS,
    queryFn: () => qualityService.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStyles() {
  return useQuery({
    queryKey: QUERY_KEYS.CATALOG_STYLES,
    queryFn: () => styleService.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useColors() {
  return useQuery({
    queryKey: QUERY_KEYS.CATALOG_COLORS,
    queryFn: () => colorService.getAll(),
    staleTime: 5 * 60 * 1000,
  });
}

function buildMutations(
  service: typeof inchService,
  queryKey: readonly string[],
  label: string
) {
  function useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (dto: CreateCatalogDto) => service.create(dto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
        toast.success(`Tạo ${label} thành công`);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, `Tạo ${label} thất bại`));
      },
    });
  }

  function useUpdate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, dto }: { id: string; dto: UpdateCatalogDto }) =>
        service.update(id, dto),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
        toast.success(`Cập nhật ${label} thành công`);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, `Cập nhật ${label} thất bại`));
      },
    });
  }

  function useDelete() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => service.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
        toast.success(`Xóa ${label} thành công`);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, `Xóa ${label} thất bại`));
      },
    });
  }

  return { useCreate, useUpdate, useDelete };
}

const inchMutations = buildMutations(inchService, QUERY_KEYS.CATALOG_INCHS, "inch");
export const useCreateInch = inchMutations.useCreate;
export const useUpdateInch = inchMutations.useUpdate;
export const useDeleteInch = inchMutations.useDelete;

const itemMutations = buildMutations(itemService, QUERY_KEYS.CATALOG_ITEMS, "loại sản phẩm");
export const useCreateItem = itemMutations.useCreate;
export const useUpdateItem = itemMutations.useUpdate;
export const useDeleteItem = itemMutations.useDelete;

const qualityMutations = buildMutations(qualityService, QUERY_KEYS.CATALOG_QUALITYS, "chất lượng");
export const useCreateQuality = qualityMutations.useCreate;
export const useUpdateQuality = qualityMutations.useUpdate;
export const useDeleteQuality = qualityMutations.useDelete;

const styleMutations = buildMutations(styleService, QUERY_KEYS.CATALOG_STYLES, "kiểu");
export const useCreateStyle = styleMutations.useCreate;
export const useUpdateStyle = styleMutations.useUpdate;
export const useDeleteStyle = styleMutations.useDelete;

const colorMutations = buildMutations(colorService, QUERY_KEYS.CATALOG_COLORS, "màu");
export const useCreateColor = colorMutations.useCreate;
export const useUpdateColor = colorMutations.useUpdate;
export const useDeleteColor = colorMutations.useDelete;
