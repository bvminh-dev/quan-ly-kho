"use client";

import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
} from "./hooks/use-catalogs";
import CatalogPage from "./page";

export default function ItemsFeaturePage() {
  const { data, isLoading } = useItems();
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  const deleteMutation = useDeleteItem();

  const items = data?.data?.items ?? [];

  return (
    <CatalogPage
      title="Quản lý Loại sản phẩm"
      description="Cấu hình danh sách loại sản phẩm (Item)"
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
