"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useExchangeRate } from "@/hooks/use-exchange-rate";
import { useAddHistory, useConfirmOrder } from "../hooks/use-orders";
import type { OrderDetail } from "@/types/api";

const schema = z.object({
  type: z.enum(["khách trả", "hoàn tiền"]),
  exchangeRate: z.number().min(1),
  moneyPaidNGN: z.number().min(0),
  moneyPaidDolar: z.number().min(0),
  paymentMethod: z.string().min(1),
  datePaid: z.string().min(1),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderDetail | null;
}

export function PaymentDialog({ open, onOpenChange, order }: PaymentDialogProps) {
  const addHistory = useAddHistory();
  const confirmOrder = useConfirmOrder();
  const { data: liveRate } = useExchangeRate();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "khách trả",
      exchangeRate: order?.exchangeRate || (liveRate ? Math.round(liveRate) : 1550),
      moneyPaidNGN: 0,
      moneyPaidDolar: 0,
      paymentMethod: "Chuyển khoản",
      datePaid: new Date().toISOString().slice(0, 16),
      note: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!order) return;

    if (order.state?.toLowerCase() === "báo giá") {
      await confirmOrder.mutateAsync(order._id);
    }

    await addHistory.mutateAsync({
      id: order._id,
      dto: {
        ...values,
        datePaid: new Date(values.datePaid).toISOString(),
      },
    });
    onOpenChange(false);
    form.reset();
  };

  const watchRate = form.watch("exchangeRate");
  const watchNGN = form.watch("moneyPaidNGN");

  const handleNGNChange = (ngn: number) => {
    form.setValue("moneyPaidNGN", ngn);
    if (watchRate > 0) {
      form.setValue("moneyPaidDolar", parseFloat((ngn / watchRate).toFixed(2)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ghi nhận thanh toán</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Loại</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(v) => form.setValue("type", v as "khách trả" | "hoàn tiền")}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="khách trả">Khách trả</SelectItem>
                  <SelectItem value="hoàn tiền">Hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Phương thức</Label>
              <Select
                value={form.watch("paymentMethod")}
                onValueChange={(v) => form.setValue("paymentMethod", v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                  <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                  <SelectItem value="Thẻ">Thẻ</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Tỷ giá</Label>
            <Input
              type="number"
              {...form.register("exchangeRate", { valueAsNumber: true })}
              className="h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Số tiền (NGN)</Label>
              <Input
                type="number"
                value={watchNGN || ""}
                onChange={(e) => handleNGNChange(Number(e.target.value))}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Số tiền (USD)</Label>
              <Input
                type="number"
                value={form.watch("moneyPaidDolar") || ""}
                disabled
                className="h-9 bg-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Ngày thanh toán</Label>
            <Input
              type="datetime-local"
              {...form.register("datePaid")}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Ghi chú</Label>
            <Textarea
              {...form.register("note")}
              className="h-16 resize-none"
              placeholder="Ghi chú..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={addHistory.isPending} className="cursor-pointer">
              Lưu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
