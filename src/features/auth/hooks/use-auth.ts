"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { QUERY_KEYS } from "@/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { SigninDto } from "@/types/api";

export function useSignin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: SigninDto) => authService.signin(dto),
    onSuccess: (res) => {
      const { accessToken, user } = res.data;
      setAuth(user, accessToken);
      toast.success("Đăng nhập thành công");
      router.push("/dashboard");
    },
    onError: () => {
      toast.error("Email hoặc mật khẩu không đúng");
    },
  });
}

export function useAccount() {
  const { isAuthenticated, setUser } = useAuthStore();

  return useQuery({
    queryKey: QUERY_KEYS.ACCOUNT,
    queryFn: async () => {
      const res = await authService.getAccount();
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        permissions: res.data.permissions,
      });
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      router.push("/login");
      toast.success("Đăng xuất thành công");
    },
    onError: () => {
      logout();
      queryClient.clear();
      router.push("/login");
    },
  });
}
