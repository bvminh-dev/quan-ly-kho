"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CatalogItem } from "@/types/api";
import { CatalogTable } from "./components/catalog-table";
import { CatalogFormDialog } from "./components/catalog-form-dialog";

interface CatalogPageProps {
  title: string;
  description: string;
  items: CatalogItem[];
  isLoading: boolean;
  onCreate: (values: { code: string; name: string }) => void;
  onUpdate: (id: string, values: { name: string }) => void;
  onDelete: (id: string) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export default function CatalogPage({
  title,
  description,
  items,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
  isCreating,
  isUpdating,
  isDeleting,
}: CatalogPageProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<CatalogItem | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shadow-sm cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      <CatalogTable
        items={items}
        isLoading={isLoading}
        onEdit={(item) => setEditItem(item)}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />

      <CatalogFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isPending={isCreating}
        onCreate={onCreate}
        onUpdate={() => {}}
      />

      <CatalogFormDialog
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
        item={editItem ?? undefined}
        isPending={isUpdating}
        onCreate={() => {}}
        onUpdate={(values) => {
          if (editItem) onUpdate(editItem._id, values);
        }}
      />
    </div>
  );
}
