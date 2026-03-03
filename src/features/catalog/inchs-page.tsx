"use client";

import {
  useInchs,
  useCreateInch,
  useUpdateInch,
  useDeleteInch,
} from "./hooks/use-catalogs";
import CatalogPage from "./page";

export default function InchsFeaturePage() {
  const { data, isLoading } = useInchs();
  const createMutation = useCreateInch();
  const updateMutation = useUpdateInch();
  const deleteMutation = useDeleteInch();

  const items = data?.data?.items ?? [];

  return (
    <CatalogPage
      title="Quản lý Inch"
      description="Cấu hình danh sách kích thước inch"
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
