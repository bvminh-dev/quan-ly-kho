import { z } from "zod/v4";

export const createUserSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
  role: z.string().min(1, "Vui lòng chọn vai trò"),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  role: z.string().min(1, "Vui lòng chọn vai trò"),
  isActive: z.boolean(),
});

export const resetPasswordSchema = z.object({
  userId: z.string(),
  newPassword: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
