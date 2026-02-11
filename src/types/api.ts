export interface PaginationMeta {
  current: number;
  pageSize: number;
  pages: number;
  total: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  current: number;
  pageSize: number;
}

export interface PermissionItem {
  _id: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
  description: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleRef {
  _id: string;
  name: string;
}

export interface UserPermission {
  _id: string;
  name: string;
  apiPath: string;
  method: string;
  module: string;
}

export interface SigninDto {
  email: string;
  password: string;
}

export interface SigninUserInfo {
  _id: string;
  name: string;
  email: string;
  role: RoleRef;
  permissions: UserPermission[];
}

export interface SigninData {
  accessToken: string;
  user: SigninUserInfo;
}

export interface AccountData {
  _id: string;
  name: string;
  email: string;
  role: RoleRef;
  permissions: UserPermission[];
}

export interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string | RoleRef;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  role?: string;
  isActive?: boolean;
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordDto {
  userId: string;
  newPassword: string;
}

export interface RoleItem {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface CreatePermissionDto {
  name: string;
  apiPath: string;
  method: string;
  module: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePermissionDto {
  name?: string;
  apiPath?: string;
  method?: string;
  module?: string;
  description?: string;
  isActive?: boolean;
}
