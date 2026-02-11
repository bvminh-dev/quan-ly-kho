"use client";

import { useAuthStore } from "@/stores/auth-store";
import type { ReactNode } from "react";

interface PermissionGateProps {
  children: ReactNode;
  method: string;
  apiPath: string;
  fallback?: ReactNode;
}

export function PermissionGate({
  children,
  method,
  apiPath,
  fallback = null,
}: PermissionGateProps) {
  const hasPermission = useAuthStore((s) => s.hasPermission);

  if (!hasPermission(method, apiPath)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface ModuleGateProps {
  children: ReactNode;
  module: string;
  fallback?: ReactNode;
}

export function ModuleGate({
  children,
  module,
  fallback = null,
}: ModuleGateProps) {
  const hasModuleAccess = useAuthStore((s) => s.hasModuleAccess);

  if (!hasModuleAccess(module)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RoleGateProps {
  children: ReactNode;
  role: string;
  fallback?: ReactNode;
}

export function RoleGate({ children, role, fallback = null }: RoleGateProps) {
  const hasRole = useAuthStore((s) => s.hasRole);

  if (!hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function useAccessControl() {
  const { hasRole, hasPermission, hasModuleAccess, user } = useAuthStore();

  const isAdmin = hasRole("admin");

  const can = (method: string, apiPath: string) =>
    hasPermission(method, apiPath);

  const canAccessModule = (module: string) => hasModuleAccess(module);

  return { isAdmin, can, canAccessModule, user };
}
