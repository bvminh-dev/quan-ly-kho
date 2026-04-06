import {
  BarChart3,
  ClipboardList,
  History,
  KeyRound,
  LayoutDashboard,
  LucideIcon,
  Package,
  Palette,
  Ruler,
  Settings,
  Shield,
  ShoppingCart,
  Sparkles,
  Tag,
  UserCheck,
  Users,
  Wand2,
  Layers,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  module: string | null;
  adminOnly: boolean;
  showInDashboard?: boolean;
  description?: string;
  gradient?: string;
  iconBg?: string;
  iconColor?: string;
  hoverBorder?: string;
  comingSoon?: boolean;
  children?: NavigationItem[];
}

export const navigationConfig: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    module: null,
    adminOnly: false,
    showInDashboard: false,
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
    title: "Báo cáo",
    url: "/dashboard/reports",
    icon: BarChart3,
    module: "dashboard",
    adminOnly: false,
    showInDashboard: true,
    description: "Báo cáo tổng hợp kinh doanh",
    gradient: "from-fuchsia-500 to-purple-600",
    iconBg: "bg-fuchsia-500/10 dark:bg-fuchsia-400/10",
    iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
    hoverBorder: "hover:border-fuchsia-200 dark:hover:border-fuchsia-800",
  },
  {
    title: "Lịch sử",
    url: "/dashboard/history-warehouse",
    icon: History,
    module: "history-warehouse",
    adminOnly: false,
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
    title: "Cài đặt",
    url: "/dashboard/settings",
    icon: Settings,
    module: null,
    adminOnly: false,
    showInDashboard: false,
    children: [
      {
        title: "Inch",
        url: "/dashboard/settings/inchs",
        icon: Ruler,
        module: "catalog-inchs",
        adminOnly: false,
      },
      {
        title: "Loại sản phẩm",
        url: "/dashboard/settings/items",
        icon: Layers,
        module: "catalog-items",
        adminOnly: false,
      },
      {
        title: "Chất lượng",
        url: "/dashboard/settings/qualitys",
        icon: Sparkles,
        module: "catalog-qualitys",
        adminOnly: false,
      },
      {
        title: "Kiểu",
        url: "/dashboard/settings/styles",
        icon: Wand2,
        module: "catalog-styles",
        adminOnly: false,
      },
      {
        title: "Màu",
        url: "/dashboard/settings/colors",
        icon: Palette,
        module: "catalog-colors",
        adminOnly: false,
      },
      {
        title: "Người dùng",
        url: "/dashboard/users",
        icon: Users,
        module: "users",
        adminOnly: false,
      },
      {
        title: "Vai trò",
        url: "/dashboard/roles",
        icon: Shield,
        module: "roles",
        adminOnly: false,
      },
      {
        title: "Quyền hạn",
        url: "/dashboard/permissions",
        icon: KeyRound,
        module: "permissions",
        adminOnly: false,
      },
    ],
  },
];

export function getMenuItems(isAdmin: boolean): NavigationItem[] {
  return navigationConfig.filter((item) => !item.adminOnly || isAdmin);
}

export function getDashboardCards(
  isAdmin: boolean,
  canAccessModule?: (module: string) => boolean,
): NavigationItem[] {
  return navigationConfig.filter(
    (item) =>
      item.showInDashboard === true &&
      (!item.adminOnly || isAdmin) &&
      (!item.module || isAdmin || (canAccessModule && canAccessModule(item.module))),
  );
}
