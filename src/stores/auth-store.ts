import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SigninUserInfo, UserPermission } from "@/types/api";

interface AuthState {
  user: SigninUserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: SigninUserInfo, accessToken: string) => void;
  setUser: (user: SigninUserInfo) => void;
  logout: () => void;

  hasRole: (roleName: string) => boolean;
  hasPermission: (method: string, apiPath: string) => boolean;
  hasModuleAccess: (module: string) => boolean;
  getPermissions: () => UserPermission[];
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) => {
        localStorage.setItem("accessToken", accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },

      setUser: (user) => {
        set({ user });
      },

      logout: () => {
        localStorage.removeItem("accessToken");
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      hasRole: (roleName: string) => {
        const { user } = get();
        if (!user) return false;
        return user.role?.name === roleName;
      },

      hasPermission: (method: string, apiPath: string) => {
        const { user } = get();
        if (!user) return false;
        if (user.role?.name === "admin") return true;
        return user.permissions?.some(
          (p) => p.method === method && p.apiPath === apiPath
        ) ?? false;
      },

      hasModuleAccess: (module: string) => {
        const { user } = get();
        if (!user) return false;
        if (user.role?.name === "admin") return true;
        return user.permissions?.some((p) => p.module === module) ?? false;
      },

      getPermissions: () => {
        const { user } = get();
        return user?.permissions ?? [];
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
