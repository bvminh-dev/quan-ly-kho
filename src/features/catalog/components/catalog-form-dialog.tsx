"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod/v4";
import type { CatalogItem } from "@/types/api";

function toCode(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const schema = z.object({
  name: z.string().min(1, "Nhập tên"),
});

type FormValues = z.infer<typeof schema>;

interface CatalogFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: CatalogItem;
  isPending: boolean;
  onCreate: (values: { code: string; name: string }) => void;
  onUpdate: (values: { name: string }) => void;
}

export function CatalogFormDialog({
  open,
  onOpenChange,
  item,
  isPending,
  onCreate,
  onUpdate,
}: CatalogFormDialogProps) {
  const isEdit = !!item;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: isEdit ? { name: item.name } : { name: "" },
  });

  const nameValue = useWatch({ control: form.control, name: "name" });

  const handleSubmit = (values: FormValues) => {
    if (isEdit) {
      onUpdate({ name: values.name });
    } else {
      onCreate({ code: toCode(values.name), name: values.name });
      form.reset();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa" : "Thêm mới"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên hiển thị</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập tên..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* {!isEdit && nameValue && (
              <p className="text-xs text-muted-foreground">
                Code tự động:{" "}
                <span className="font-mono font-medium text-foreground">
                  {toCode(nameValue)}
                </span>
              </p>
            )} */}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isEdit ? "Lưu" : "Thêm"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
