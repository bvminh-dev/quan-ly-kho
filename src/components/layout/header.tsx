"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex shrink-0 items-center gap-2 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 pb-3.5 pt-[calc(0.875rem+env(safe-area-inset-top))]">
      <SidebarTrigger className="-ml-1 hover:bg-primary/10 hover:text-primary transition-colors" />
      <Separator orientation="vertical" className="mr-2 !h-4 bg-border/60" />
      <div className="flex-1" />
      <ThemeToggle />
    </header>
  );
}
