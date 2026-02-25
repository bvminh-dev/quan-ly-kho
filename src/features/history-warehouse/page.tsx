"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HistoryEnterTable } from "./components/history-enter-table";
import { HistoryExportTable } from "./components/history-export-table";
import {
  useHistoryEnter,
  useHistoryExport,
} from "./hooks/use-history-warehouse";

const TAB_ENTER = "enter";
const TAB_EXPORT = "export";
const TAB_PARAM = "tab";
const TAB_STORAGE_KEY = "history-warehouse-tab";

function getStoredTab(): string {
  if (typeof window === "undefined") return TAB_ENTER;
  const stored = window.localStorage.getItem(TAB_STORAGE_KEY);
  return stored === TAB_EXPORT ? TAB_EXPORT : TAB_ENTER;
}

export default function HistoryWarehousePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get(TAB_PARAM);
  const [lastUsedTab, setLastUsedTab] = useState(TAB_ENTER);

  useEffect(() => {
    const stored = getStoredTab();
    setLastUsedTab(stored);
    if (tabFromUrl !== TAB_ENTER && tabFromUrl !== TAB_EXPORT && stored === TAB_EXPORT) {
      router.replace(`${pathname}?${TAB_PARAM}=${TAB_EXPORT}`, { scroll: false });
    }
  }, [pathname, router, tabFromUrl]);

  const activeTab =
    tabFromUrl === TAB_EXPORT || tabFromUrl === TAB_ENTER
      ? tabFromUrl
      : lastUsedTab;

  const [enterPage, setEnterPage] = useState(1);
  const [enterPageSize, setEnterPageSize] = useState(20);
  const [exportPage, setExportPage] = useState(1);
  const [exportPageSize, setExportPageSize] = useState(20);

  const setTab = useCallback(
    (value: string) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(TAB_STORAGE_KEY, value);
      }
      const params = new URLSearchParams(searchParams.toString());
      if (value === TAB_ENTER) {
        params.delete(TAB_PARAM);
      } else {
        params.set(TAB_PARAM, value);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const { data: enterData, isLoading: enterLoading } = useHistoryEnter({
    current: enterPage,
    pageSize: enterPageSize,
    sort: "-createdAt",
  });

  const { data: exportData, isLoading: exportLoading } = useHistoryExport({
    current: exportPage,
    pageSize: exportPageSize,
    sort: "-createdAt",
  });

  const enterItems = enterData?.data?.items ?? [];
  const enterMeta = enterData?.data?.meta ?? {
    current: 1,
    pageSize: 20,
    pages: 1,
    total: 0,
  };

  const exportItems = exportData?.data?.items ?? [];
  const exportMeta = exportData?.data?.meta ?? {
    current: 1,
    pageSize: 20,
    pages: 1,
    total: 0,
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Lịch sử xuất nhập kho</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý lịch sử xuất nhập kho hàng
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setTab}
        className="space-y-4 w-full min-w-0"
      >
        <TabsList>
          <TabsTrigger value={TAB_ENTER}>Lịch sử nhập kho</TabsTrigger>
          <TabsTrigger value={TAB_EXPORT}>Lịch sử xuất kho</TabsTrigger>
        </TabsList>

        <TabsContent value={TAB_ENTER} className="space-y-4 w-full min-w-0">
          <HistoryEnterTable
            items={enterItems}
            meta={enterMeta}
            isLoading={enterLoading}
            onPageChange={setEnterPage}
            onPageSizeChange={(size) => {
              setEnterPageSize(size);
              setEnterPage(1);
            }}
          />
        </TabsContent>

        <TabsContent value={TAB_EXPORT} className="space-y-4 w-full min-w-0">
          <HistoryExportTable
            items={exportItems}
            meta={exportMeta}
            isLoading={exportLoading}
            onPageChange={setExportPage}
            onPageSizeChange={(size) => {
              setExportPageSize(size);
              setExportPage(1);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
