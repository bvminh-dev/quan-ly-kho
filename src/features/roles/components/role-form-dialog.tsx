"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Switch } from "@/components/ui/switch";
import { usePermissionsAll } from "@/features/permissions/hooks/use-permissions";
import type { RoleItem } from "@/types/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useCreateRole, useUpdateRole } from "../hooks/use-roles";

const roleFormSchema = z.object({
  name: z.string().min(1, "Tên vai trò không được để trống"),
  description: z.string().optional(),
  permissions: z.array(z.string()),
  isActive: z.boolean(),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: RoleItem | null;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
}: RoleFormDialogProps) {
  const isEdit = !!role;
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const { data: permissionsData } = usePermissionsAll({
    current: 1,
    pageSize: 100,
  });

  const permissions = permissionsData?.data?.items ?? [];

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, typeof permissions> = {};
    permissions.forEach((p) => {
      if (!groups[p.module]) groups[p.module] = [];
      groups[p.module].push(p);
    });
    return groups;
  }, [permissions]);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (isEdit && role) {
        form.reset({
          name: role.name,
          description: role.description || "",
          permissions: role.permissions || [],
          isActive: role.isActive,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          permissions: [],
          isActive: true,
        });
      }
    }
  }, [open, isEdit, role, form]);

  const onSubmit = (values: RoleFormValues) => {
    if (isEdit) {
      updateRole.mutate(
        { id: role!._id, dto: values },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createRole.mutate(values, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isPending = createRole.isPending || updateRole.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật vai trò" : "Tạo vai trò mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên vai trò</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên vai trò" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Input placeholder="Mô tả vai trò" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <FormLabel>Quyền hạn</FormLabel>
                  <div className="space-y-4 rounded-lg border p-4 max-h-[300px] overflow-y-auto">
                    {Object.entries(groupedPermissions).map(
                      ([module, perms]) => (
                        <div key={module} className="space-y-2">
                          <h4 className="text-sm font-semibold capitalize text-muted-foreground">
                            {module}
                          </h4>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {perms.map((perm) => (
                              <FormField
                                key={perm._id}
                                control={form.control}
                                name="permissions"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          perm._id
                                        )}
                                        onCheckedChange={(checked) => {
                                          const current = field.value || [];
                                          if (checked) {
                                            field.onChange([
                                              ...current,
                                              perm._id,
                                            ]);
                                          } else {
                                            field.onChange(
                                              current.filter(
                                                (id: string) =>
                                                  id !== perm._id
                                              )
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      {perm.name}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    )}
                    {permissions.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Chưa có quyền hạn nào
                      </p>
                    )}
                  </div>
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
