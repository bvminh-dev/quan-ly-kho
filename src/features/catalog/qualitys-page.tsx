"use client";

import {
  useQualitys,
  useCreateQuality,
  useUpdateQuality,
  useDeleteQuality,
} from "./hooks/use-catalogs";
import CatalogPage from "./page";

export default function QualitysFeaturePage() {
  const { data, isLoading } = useQualitys();
  const createMutation = useCreateQuality();
  const updateMutation = useUpdateQuality();
  const deleteMutation = useDeleteQuality();

  const items = data?.data?.items ?? [];

  return (
    <CatalogPage
      title="Quản lý Chất lượng"
      description="Cấu hình danh sách chất lượng sản phẩm (Quality)"
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
