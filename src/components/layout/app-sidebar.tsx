"use client";

import { ModuleGate } from "@/components/access-control";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { getMenuItems } from "@/config/navigation.config";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { LogOut, Package, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { UserProfileDialog } from "./user-profile-dialog";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, hasRole } = useAuthStore();
  const { isMobile, setOpenMobile } = useSidebar();
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

  const ActiveIcon = ({ 
    Icon, 
    isActive 
  }: { 
    Icon: React.ComponentType<{ className?: string }>; 
    isActive: boolean;
  }) => {
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const prevActiveRef = useRef(false);
    const isMountedRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // Khi component mount lần đầu và đã active (refresh trang)
      if (!isMountedRef.current && isActive) {
        isMountedRef.current = true;
        // Delay nhỏ để đảm bảo DOM đã render
        const timer = setTimeout(() => {
          setShouldAnimate(true);
          animatePaths();
          setTimeout(() => setShouldAnimate(false), 1000);
        }, 50);
        return () => clearTimeout(timer);
      }
      
      isMountedRef.current = true;
      
      // Khi click và chuyển sang active
      if (isActive && !prevActiveRef.current) {
        setShouldAnimate(true);
        animatePaths();
        const timer = setTimeout(() => setShouldAnimate(false), 1000);
        return () => clearTimeout(timer);
      }
      prevActiveRef.current = isActive;
    }, [isActive]);

    const animatePaths = () => {
      // Tìm SVG element trong DOM
      setTimeout(() => {
        const svgElement = containerRef.current?.querySelector('svg');
        
        if (!svgElement) return;

        // Lấy tất cả các path elements
        const paths = svgElement.querySelectorAll('path, circle, rect, line, polyline, polygon');
        
        paths.forEach((path, index) => {
          const element = path as SVGPathElement | SVGCircleElement | SVGRectElement | SVGLineElement | SVGPolylineElement | SVGPolygonElement;
          
          // Tính toán path length
          let length = 0;
          if (element instanceof SVGPathElement) {
            length = element.getTotalLength();
          } else if (element instanceof SVGCircleElement) {
            const r = parseFloat(element.getAttribute('r') || '0');
            length = 2 * Math.PI * r;
          } else if (element instanceof SVGRectElement) {
            const w = parseFloat(element.getAttribute('width') || '0');
            const h = parseFloat(element.getAttribute('height') || '0');
            length = 2 * (w + h);
          } else {
            // Fallback cho line, polyline, polygon
            length = element.getTotalLength ? element.getTotalLength() : 200;
          }

          // Set stroke-dasharray và stroke-dashoffset
          element.style.setProperty('--path-length', `${length}`);
          element.style.strokeDasharray = `${length}`;
          element.style.strokeDashoffset = `${length}`;
          
          // Animation delay cho từng path (tổng thời gian ≤ 1s)
          const delay = index * 0.1;
          element.style.animationDelay = `${delay}s`;
          element.style.animation = `icon-stroke-draw 0.5s ease-out ${delay}s forwards`;
        });
      }, 10);
    };

    return (
      <div ref={containerRef}>
        <Icon 
          className={`h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-active:scale-95 ${
            shouldAnimate ? "icon-active-animate" : ""
          }`} 
        />
      </div>
    );
  };

  const menuItems = getMenuItems(isAdmin);

  const renderMenuItem = (item: (typeof menuItems)[0]) => {
    const isActive = pathname === item.url;
    const menuButton = (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          isActive={isActive}
          onClick={() => {
            router.push(item.url);
            if (isMobile) setOpenMobile(false);
          }}
          className="cursor-pointer group"
          tooltip={item.title}
        >
          <ActiveIcon Icon={item.icon} isActive={isActive} />
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );

    // If no module required, show directly
    if (!item.module) return menuButton;

    // If admin, show directly (admin has access to everything)
    if (isAdmin) return menuButton;

    // If adminOnly is false, show directly (available to all users regardless of module permissions)
    // if (!item.adminOnly) return menuButton;

    // For adminOnly items, check module access
    return (
      <ModuleGate key={item.title} module={item.module}>
        {menuButton}
      </ModuleGate>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-3">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md glow-primary group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
            <Package className="h-5 w-5 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight">Quản Lý Kho</span>
            <span className="text-[11px] text-muted-foreground font-medium">
              Warehouse Management
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 group-data-[collapsible=icon]:px-0">
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

      <SidebarFooter className="border-t border-sidebar-border px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] group-data-[collapsible=icon]:p-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-9 w-9 ring-2 ring-primary/20 shrink-0 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold">{user?.name}</span>
            <span className="truncate text-[11px] text-muted-foreground font-medium">
              {user?.role?.name}
            </span>
          </div>
          <button
            onClick={() => setProfileOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent hover:text-primary transition-all duration-200 cursor-pointer shrink-0 group group-data-[collapsible=icon]:hidden"
            title="Cài đặt tài khoản"
          >
            <Settings className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-90" />
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 cursor-pointer shrink-0 group group-data-[collapsible=icon]:hidden"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:-translate-x-1" />
          </button>
        </div>
      </SidebarFooter>

      <UserProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </Sidebar>
  );
}
