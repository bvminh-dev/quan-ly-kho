export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const API_PREFIX = "/api/v1";

export const AUTH_ROUTES = {
  SIGNIN: `${API_PREFIX}/auth/signin`,
  REFRESH: `${API_PREFIX}/auth/refresh`,
  LOGOUT: `${API_PREFIX}/auth/logout`,
  ACCOUNT: `${API_PREFIX}/auth/account`,
} as const;

export const USER_ROUTES = {
  BASE: `${API_PREFIX}/users`,
  BY_ID: (id: string) => `${API_PREFIX}/users/${id}`,
  UPDATE_PASSWORD: `${API_PREFIX}/users/password/update`,
  RESET_PASSWORD: `${API_PREFIX}/users/password/reset`,
} as const;

export const ROLE_ROUTES = {
  BASE: `${API_PREFIX}/roles`,
  BY_ID: (id: string) => `${API_PREFIX}/roles/${id}`,
} as const;

export const PERMISSION_ROUTES = {
  BASE: `${API_PREFIX}/permissions`,
  BY_ID: (id: string) => `${API_PREFIX}/permissions/${id}`,
} as const;

export const QUERY_KEYS = {
  ACCOUNT: ["account"] as const,
  USERS: ["users"] as const,
  USER: (id: string) => ["users", id] as const,
  ROLES: ["roles"] as const,
  ROLE: (id: string) => ["roles", id] as const,
  PERMISSIONS: ["permissions"] as const,
  PERMISSION: (id: string) => ["permissions", id] as const,
} as const;
