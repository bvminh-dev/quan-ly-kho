"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { OrderDetail } from "@/types/api";
import { round2 } from "@/utils/currency";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useAddHistory, useConfirmOrder } from "../hooks/use-orders";

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

export function PaymentDialog({
  open,
  onOpenChange,
  order,
}: PaymentDialogProps) {
  const addHistory = useAddHistory();
  const confirmOrder = useConfirmOrder();
  const { data: liveRate } = useExchangeRate();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "khách trả",
      exchangeRate:
        order?.exchangeRate || (liveRate ? Math.round(liveRate) : 1550),
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
      form.setValue("moneyPaidDolar", round2(ngn / watchRate));
    }
  };

  const handleQuickFill = (percent: number) => {
    if (!order) return;
    const type = form.getValues("type");
    const remaining = Math.max(0, Math.abs(order.payment));
    const refundable = Math.max(0, order.totalPrice - Math.abs(order.payment));
    const baseAmount =
      type.toLowerCase() === "khách trả" ? remaining : refundable;
    const value = Math.round((baseAmount * percent) / 100);
    handleNGNChange(value);
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
                onValueChange={(v) => {
                  form.setValue("type", v as "khách trả" | "hoàn tiền");
                  handleNGNChange(0);
                }}
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
              min={0}
              step="any"
              className="h-9"
              {...form.register("exchangeRate", {
                valueAsNumber: true,
                setValueAs: (v) => (v === "" || Number.isNaN(Number(v)) ? 0 : parseFloat(String(v))),
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Số tiền (NGN)</Label>
              <Input
                type="number"
                min={0}
                step="any"
                value={watchNGN ?? ""}
                onChange={(e) =>
                  handleNGNChange(
                    e.target.value === "" ? 0 : parseFloat(e.target.value) || 0
                  )
                }
                className="h-9"
              />
              
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Số tiền (USD)</Label>
              <Input
                type="text"
                value={
                  form.watch("moneyPaidDolar") != null
                    ? Number(form.watch("moneyPaidDolar")).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : ""
                }
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
            <Button
              type="submit"
              disabled={addHistory.isPending}
              className="cursor-pointer"
            >
              Lưu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
