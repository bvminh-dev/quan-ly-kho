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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useUpdateHistoryEnter } from "../hooks/use-history-warehouse";
import type { HistoryEnterItem } from "@/types/api";

const TYPE_OPTIONS = [
  "Tạo mới",
  "Nhập thêm hàng",
  "Hoàn đơn",
  "Sửa giá",
  "Xóa",
] as const;

const schema = z.object({
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface HistoryEnterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: HistoryEnterItem | null;
}

export function HistoryEnterFormDialog({
  open,
  onOpenChange,
  item,
}: HistoryEnterFormDialogProps) {
  const updateHistory = useUpdateHistoryEnter();

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa lịch sử nhập kho</DialogTitle>
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
              <span className="text-muted-foreground">Loại:</span>{" "}
              <span className="font-medium">{item.type}</span>
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
