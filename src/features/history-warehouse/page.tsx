"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { HistoryEnterTable } from "./components/history-enter-table";
import { HistoryExportTable } from "./components/history-export-table";
import {
  useHistoryEnter,
  useHistoryExport,
} from "./hooks/use-history-warehouse";

export default function HistoryWarehousePage() {
  const [enterPage, setEnterPage] = useState(1);
  const [enterPageSize, setEnterPageSize] = useState(20);
  const [exportPage, setExportPage] = useState(1);
  const [exportPageSize, setExportPageSize] = useState(20);

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

      <Tabs defaultValue="enter" className="space-y-4 w-full min-w-0">
        <TabsList>
          <TabsTrigger value="enter">Lịch sử nhập kho</TabsTrigger>
          <TabsTrigger value="export">Lịch sử xuất kho</TabsTrigger>
        </TabsList>

        <TabsContent value="enter" className="space-y-4 w-full min-w-0">
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

        <TabsContent value="export" className="space-y-4 w-full min-w-0">
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
