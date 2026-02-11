"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { ArrowRight, KeyRound, Package, Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const cards = [
    {
      title: "Người dùng",
      description: "Quản lý tài khoản người dùng",
      icon: Users,
      href: "/dashboard/users",
      gradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-500/10 dark:bg-blue-400/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      hoverBorder: "hover:border-blue-200 dark:hover:border-blue-800",
    },
    {
      title: "Vai trò",
      description: "Quản lý phân quyền vai trò",
      icon: Shield,
      href: "/dashboard/roles",
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      hoverBorder: "hover:border-emerald-200 dark:hover:border-emerald-800",
    },
    {
      title: "Quyền hạn",
      description: "Quản lý quyền truy cập hệ thống",
      icon: KeyRound,
      href: "/dashboard/permissions",
      gradient: "from-violet-500 to-purple-600",
      iconBg: "bg-violet-500/10 dark:bg-violet-400/10",
      iconColor: "text-violet-600 dark:text-violet-400",
      hoverBorder: "hover:border-violet-200 dark:hover:border-violet-800",
    },
    {
      title: "Kho hàng",
      description: "Sắp ra mắt — quản lý kho",
      icon: Package,
      href: "#",
      gradient: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-500/10 dark:bg-amber-400/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      hoverBorder: "hover:border-amber-200 dark:hover:border-amber-800",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-6 md:p-8">
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-accent/10 blur-2xl" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Xin chào, <span className="text-primary">{user?.name}</span>! 👋
          </h1>
          <p className="mt-2 text-muted-foreground text-base">
            Chào mừng bạn đến với hệ thống Quản Lý Kho
          </p>
        </div>
      </div>

      {/* Quick access cards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground/80">
          Truy cập nhanh
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Card
              key={card.title}
              className={`group cursor-pointer border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${card.hoverBorder} ${card.href === "#" ? "opacity-70" : ""}`}
              onClick={() => {
                if (card.href !== "#") router.push(card.href);
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className={`rounded-xl p-2.5 ${card.iconBg}`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                {card.href !== "#" && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                )}
              </CardHeader>
              <CardContent className="space-y-1">
                <CardTitle className="text-base font-semibold">
                  {card.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
                {card.href === "#" && (
                  <span className="inline-block mt-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    Coming soon
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
