"use client";

import {
  useColors,
  useCreateColor,
  useUpdateColor,
  useDeleteColor,
} from "./hooks/use-catalogs";
import CatalogPage from "./page";

export default function ColorsFeaturePage() {
  const { data, isLoading } = useColors();
  const createMutation = useCreateColor();
  const updateMutation = useUpdateColor();
  const deleteMutation = useDeleteColor();

  const items = data?.data?.items ?? [];

  return (
    <CatalogPage
      title="Quản lý Màu"
      description="Cấu hình danh sách màu sản phẩm (Color)"
      items={items}
      isLoading={isLoading}
      onCreate={(values) => createMutation.mutate(values)}
      onUpdate={(id, values) => updateMutation.mutate({ id, dto: values })}
      onDelete={(id) => deleteMutation.mutate(id)}
      isCreating={createMutation.isPending}
      isUpdating={updateMutation.isPending}
      isDeleting={deleteMutation.isPending}
    />
  );
}
