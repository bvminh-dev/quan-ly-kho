"use client";

import { useAccessControl } from "@/components/access-control";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardCards } from "@/config/navigation.config";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { isAdmin, user } = useAccessControl();
  const router = useRouter();

  const cards = getDashboardCards(isAdmin);

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
              className={`group cursor-pointer border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${card.hoverBorder || ""} ${card.comingSoon ? "opacity-70" : ""}`}
              onClick={() => {
                if (!card.comingSoon && card.url !== "#") router.push(card.url);
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className={`rounded-xl p-2.5 ${card.iconBg} transition-all duration-300 group-hover:scale-110`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor} transition-all duration-300 group-hover:rotate-6 group-hover:scale-110`} />
                </div>
                {!card.comingSoon && card.url !== "#" && (
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
                {card.comingSoon && (
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
