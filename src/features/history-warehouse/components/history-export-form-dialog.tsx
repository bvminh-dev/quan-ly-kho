"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useUpdateHistoryExport } from "../hooks/use-history-warehouse";
import { formatNumber } from "@/utils/currency";
import type { HistoryExportItem } from "@/types/api";

const schema = z.object({
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface HistoryExportFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: HistoryExportItem | null;
}

export function HistoryExportFormDialog({
  open,
  onOpenChange,
  item,
}: HistoryExportFormDialogProps) {
  const updateHistory = useUpdateHistoryExport();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      note: "",
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        note: item.note || "",
      });
    }
  }, [item, form]);

  const onSubmit = async (values: FormValues) => {
    if (!item) return;
    await updateHistory.mutateAsync({
      id: item._id,
      dto: {
        note: values.note,
      },
    });
    onOpenChange(false);
  };

  if (!item) return null;

  const orderIdString =
    typeof item.orderId === "string" ? item.orderId : item.orderId?._id ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa lịch sử xuất kho</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Item:</span>{" "}
              <span className="font-medium">{item.item}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Inch:</span>{" "}
              <span className="font-medium">{item.inches}&quot;</span>
            </div>
            <div>
              <span className="text-muted-foreground">Quality:</span>{" "}
              <span className="font-medium">{item.quality}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Style:</span>{" "}
              <span className="font-medium">{item.style}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Color:</span>{" "}
              <span className="font-medium">{item.color}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Đơn hàng:</span>{" "}
              <span className="font-medium font-mono">
                {orderIdString.slice(-5).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Loại:</span>{" "}
              <span className="font-medium">{item.type}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Trạng thái:</span>{" "}
              <span className="font-medium">{item.stateOrder}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Số lượng:</span>{" "}
              <span className="font-medium">{item.quantityOrder}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Thanh toán:</span>{" "}
              <span className="font-medium">{formatNumber(item.paymentOrder)}</span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Nhập ghi chú..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateHistory.isPending}>
                {updateHistory.isPending ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
