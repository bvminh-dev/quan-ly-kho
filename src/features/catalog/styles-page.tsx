"use client";

import {
  useStyles,
  useCreateStyle,
  useUpdateStyle,
  useDeleteStyle,
} from "./hooks/use-catalogs";
import CatalogPage from "./page";

export default function StylesFeaturePage() {
  const { data, isLoading } = useStyles();
  const createMutation = useCreateStyle();
  const updateMutation = useUpdateStyle();
  const deleteMutation = useDeleteStyle();

  const items = data?.data?.items ?? [];

  return (
    <CatalogPage
      title="Quản lý Kiểu"
      description="Cấu hình danh sách kiểu sản phẩm (Style)"
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
