"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import {
  useCreatePermission,
  useUpdatePermission,
} from "../hooks/use-permissions";
import { HTTP_METHODS, MODULES } from "../types";
import type { PermissionItem } from "@/types/api";

const permissionFormSchema = z.object({
  name: z.string().min(1, "Tên quyền không được để trống"),
  apiPath: z.string().min(1, "API Path không được để trống"),
  method: z.string().min(1, "Method không được để trống"),
  module: z.string().min(1, "Module không được để trống"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type PermissionFormValues = z.infer<typeof permissionFormSchema>;

interface PermissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission?: PermissionItem | null;
}

export function PermissionFormDialog({
  open,
  onOpenChange,
  permission,
}: PermissionFormDialogProps) {
  const isEdit = !!permission;
  const createPermission = useCreatePermission();
  const updatePermission = useUpdatePermission();

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: "",
      apiPath: "",
      method: "",
      module: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (isEdit && permission) {
        form.reset({
          name: permission.name,
          apiPath: permission.apiPath,
          method: permission.method,
          module: permission.module,
          description: permission.description || "",
          isActive: permission.isActive,
        });
      } else {
        form.reset({
          name: "",
          apiPath: "",
          method: "",
          module: "",
          description: "",
          isActive: true,
        });
      }
    }
  }, [open, isEdit, permission, form]);

  const onSubmit = (values: PermissionFormValues) => {
    if (isEdit) {
      updatePermission.mutate(
        { id: permission!._id, dto: values },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createPermission.mutate(values, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isPending = createPermission.isPending || updatePermission.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật quyền hạn" : "Tạo quyền hạn mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên quyền</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Create User" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiPath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Path</FormLabel>
                  <FormControl>
                    <Input placeholder="/api/v1/users" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HTTP_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="module"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn module" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MODULES.map((mod) => (
                          <SelectItem key={mod} value={mod}>
                            {mod}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Input placeholder="Mô tả quyền hạn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Trạng thái hoạt động</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
