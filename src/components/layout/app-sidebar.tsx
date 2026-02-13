"use client";

import { useState } from "react";
import {
  Users,
  Shield,
  KeyRound,
  LayoutDashboard,
  Package,
  LogOut,
  Settings,
  Warehouse,
  DollarSign,
  ShoppingCart,
  ClipboardList,
  UserCheck,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth.service";
import { ModuleGate } from "@/components/access-control";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { UserProfileDialog } from "./user-profile-dialog";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    module: null,
    adminOnly: false,
  },
  {
    title: "Kho hàng",
    url: "/dashboard/warehouse",
    icon: Warehouse,
    module: "warehouses",
    adminOnly: false,
  },
  {
    title: "Bảng giá",
    url: "/dashboard/price-list",
    icon: DollarSign,
    module: "warehouses",
    adminOnly: false,
  },
  {
    title: "Bán hàng",
    url: "/dashboard/sales",
    icon: ShoppingCart,
    module: "orders",
    adminOnly: false,
  },
  {
    title: "Đơn hàng",
    url: "/dashboard/orders",
    icon: ClipboardList,
    module: "orders",
    adminOnly: false,
  },
  {
    title: "Khách hàng",
    url: "/dashboard/customers",
    icon: UserCheck,
    module: "customers",
    adminOnly: false,
  },
  {
    title: "Người dùng",
    url: "/dashboard/users",
    icon: Users,
    module: "users",
    adminOnly: true,
  },
  {
    title: "Vai trò",
    url: "/dashboard/roles",
    icon: Shield,
    module: "roles",
    adminOnly: true,
  },
  {
    title: "Quyền hạn",
    url: "/dashboard/permissions",
    icon: KeyRound,
    module: "permissions",
    adminOnly: true,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hasRole } = useAuthStore();
  const isAdmin = hasRole("admin");
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      router.push("/login");
      toast.success("Đăng xuất thành công");
    } catch {
      logout();
      router.push("/login");
    }
  };

  const renderMenuItem = (item: (typeof menuItems)[0]) => {
    if (item.adminOnly && !isAdmin) return null;

    const isActive = pathname === item.url;
    const menuButton = (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          isActive={isActive}
          onClick={() => router.push(item.url)}
          className="cursor-pointer"
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );

    if (!item.module) return menuButton;

    if (isAdmin) return menuButton;

    return (
      <ModuleGate key={item.title} module={item.module}>
        {menuButton}
      </ModuleGate>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md glow-primary">
            <Package className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">Quản Lý Kho</span>
            <span className="text-[11px] text-muted-foreground font-medium">
              Warehouse Management
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {menuItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 ring-2 ring-primary/20 shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-semibold">{user?.name}</span>
            <span className="truncate text-[11px] text-muted-foreground font-medium">
              {user?.role?.name}
            </span>
          </div>
          <button
            onClick={() => setProfileOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-primary transition-all duration-200 cursor-pointer shrink-0"
            title="Cài đặt tài khoản"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 cursor-pointer shrink-0"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>

      <UserProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </Sidebar>
  );
}
