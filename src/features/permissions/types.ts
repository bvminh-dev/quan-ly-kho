import { z } from "zod/v4";

export const createPermissionSchema = z.object({
  name: z.string().min(1, "Tên quyền không được để trống"),
  apiPath: z.string().min(1, "API Path không được để trống"),
  method: z.string().min(1, "Method không được để trống"),
  module: z.string().min(1, "Module không được để trống"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updatePermissionSchema = z.object({
  name: z.string().min(1, "Tên quyền không được để trống"),
  apiPath: z.string().min(1, "API Path không được để trống"),
  method: z.string().min(1, "Method không được để trống"),
  module: z.string().min(1, "Module không được để trống"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

export type CreatePermissionFormValues = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionFormValues = z.infer<typeof updatePermissionSchema>;

export const HTTP_METHODS = ["GET", "POST", "PATCH", "PUT", "DELETE"] as const;

export const MODULES = [
  "users",
  "roles",
  "permissions",
  "auth",
  "products",
  "warehouses",
  "orders",
] as const;
