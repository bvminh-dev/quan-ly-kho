import { z } from "zod/v4";

export const createRoleSchema = z.object({
  name: z.string().min(1, "Tên vai trò không được để trống"),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, "Tên vai trò không được để trống"),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  isActive: z.boolean(),
});

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>;
export type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>;
