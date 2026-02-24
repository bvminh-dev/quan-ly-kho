import {
  ClipboardList,
  History,
  KeyRound,
  LayoutDashboard,
  LucideIcon,
  Package,
  Shield,
  ShoppingCart,
  Tag,
  UserCheck,
  Users,
} from "lucide-react";

export interface NavigationItem {
  // Common properties
  title: string;
  url: string;
  icon: LucideIcon;
  module: string | null; // Module for access control
  adminOnly: boolean; // Whether this item is admin-only

  // Dashboard card properties (optional - only for items shown on dashboard)
  showInDashboard?: boolean; // Whether to show as card on dashboard
  description?: string; // Card description
  gradient?: string; // Card gradient classes
  iconBg?: string; // Card icon background classes
  iconColor?: string; // Card icon color classes
  hoverBorder?: string; // Card hover border classes
  comingSoon?: boolean; // Whether this feature is coming soon
}

export const navigationConfig: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    module: null,
    adminOnly: false,
    showInDashboard: false, // Don't show dashboard card on dashboard page
  },
  {
    title: "Kho hàng",
    url: "/dashboard/warehouse",
    icon: Package,
    module: "warehouses",
    adminOnly: false,
    showInDashboard: true,
    description: "Quản lý kho hàng",
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-500/10 dark:bg-amber-400/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    hoverBorder: "hover:border-amber-200 dark:hover:border-amber-800",
  },
  {
    title: "Bảng giá",
    url: "/dashboard/price-list",
    icon: Tag,
    module: "warehouses",
    adminOnly: false,
    showInDashboard: true,
    description: "Quản lý bảng giá",
    gradient: "from-cyan-500 to-sky-600",
    iconBg: "bg-cyan-500/10 dark:bg-cyan-400/10",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    hoverBorder: "hover:border-cyan-200 dark:hover:border-cyan-800",
  },
  {
    title: "Bán hàng",
    url: "/dashboard/sales",
    icon: ShoppingCart,
    module: "orders",
    adminOnly: false,
    showInDashboard: true,
    description: "Quản lý bán hàng",
    gradient: "from-rose-500 to-pink-600",
    iconBg: "bg-rose-500/10 dark:bg-rose-400/10",
    iconColor: "text-rose-600 dark:text-rose-400",
    hoverBorder: "hover:border-rose-200 dark:hover:border-rose-800",
  },
  {
    title: "Đơn hàng",
    url: "/dashboard/orders",
    icon: ClipboardList,
    module: "orders",
    adminOnly: false,
    showInDashboard: true,
    description: "Quản lý đơn hàng",
    gradient: "from-lime-500 to-green-600",
    iconBg: "bg-lime-500/10 dark:bg-lime-400/10",
    iconColor: "text-lime-600 dark:text-lime-400",
    hoverBorder: "hover:border-lime-200 dark:hover:border-lime-800",
  },
  {
    title: "Lịch sử",
    url: "/dashboard/history-warehouse",
    icon: History,
    module: null,
    adminOnly: true,
    showInDashboard: true,
    description: "Quản lý lịch sử xuất/nhập kho",
    gradient: "from-slate-500 to-gray-600",
    iconBg: "bg-slate-500/10 dark:bg-slate-400/10",
    iconColor: "text-slate-600 dark:text-slate-400",
    hoverBorder: "hover:border-slate-200 dark:hover:border-slate-800",
  },
  {
    title: "Khách hàng",
    url: "/dashboard/customers",
    icon: UserCheck,
    module: "customers",
    adminOnly: false,
    showInDashboard: true,
    description: "Quản lý khách hàng",
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-500/10 dark:bg-blue-400/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    hoverBorder: "hover:border-blue-200 dark:hover:border-blue-800",
  },
  {
    title: "Người dùng",
    url: "/dashboard/users",
    icon: Users,
    module: "users",
    adminOnly: true,
    showInDashboard: true,
    description: "Quản lý tài khoản người dùng",
    gradient: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-500/10 dark:bg-blue-400/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    hoverBorder: "hover:border-blue-200 dark:hover:border-blue-800",
  },
  {
    title: "Vai trò",
    url: "/dashboard/roles",
    icon: Shield,
    module: "roles",
    adminOnly: true,
    showInDashboard: true,
    description: "Quản lý phân quyền vai trò",
    gradient: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    hoverBorder: "hover:border-emerald-200 dark:hover:border-emerald-800",
  },
  {
    title: "Quyền hạn",
    url: "/dashboard/permissions",
    icon: KeyRound,
    module: "permissions",
    adminOnly: true,
    showInDashboard: true,
    description: "Quản lý quyền truy cập hệ thống",
    gradient: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-500/10 dark:bg-violet-400/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    hoverBorder: "hover:border-violet-200 dark:hover:border-violet-800",
  },
];

/**
 * Get menu items filtered by role
 */
export function getMenuItems(isAdmin: boolean): NavigationItem[] {
  return navigationConfig.filter((item) => !item.adminOnly || isAdmin);
}

/**
 * Get dashboard cards filtered by role and showInDashboard flag
 */
export function getDashboardCards(isAdmin: boolean): NavigationItem[] {
  return navigationConfig.filter(
    (item) => item.showInDashboard === true && (!item.adminOnly || isAdmin),
  );
}
