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
import { round2, formatMoneyValue, formatUSD, formatNGN } from "@/utils/currency";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useAddHistory, useConfirmOrder } from "../hooks/use-orders";

const schema = z.object({
  type: z.enum(["khách trả", "hoàn tiền"]),
  exchangeRate: z.number().gt(0, { message: "Tỷ giá phải lớn hơn 0" }),
  moneyPaidNGN: z.number().gt(0, { message: "Số tiền NGN phải lớn hơn 0" }),
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
    mode: "onBlur",
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
  const formErrors = form.formState.errors;
  const isFormValid = form.formState.isValid;

  const handleExchangeRateChange = (value: string) => {
    if (value === "") {
      // Khi xóa hết, không set giá trị mới để tránh NaN
      form.setValue("exchangeRate", 0, { shouldValidate: false });
      return;
    }
    const numValue = parseFloat(value);
    if (!Number.isNaN(numValue)) {
      form.setValue("exchangeRate", numValue, { shouldValidate: false });
      // Recalculate USD if NGN is already entered
      if (watchNGN > 0 && numValue > 0) {
        form.setValue("moneyPaidDolar", round2(watchNGN / numValue));
      }
    }
  };

  const handleExchangeRateBlur = () => {
    const currentValue = form.getValues("exchangeRate");
    // Nếu giá trị là 0 hoặc không hợp lệ, khôi phục về giá trị mặc định
    if (currentValue === 0 || Number.isNaN(currentValue) || currentValue === undefined) {
      const defaultValue = order?.exchangeRate || (liveRate ? Math.round(liveRate) : 1550);
      form.setValue("exchangeRate", defaultValue, { shouldValidate: true });
      // Recalculate USD if NGN is already entered
      if (watchNGN > 0 && defaultValue > 0) {
        form.setValue("moneyPaidDolar", round2(watchNGN / defaultValue));
      }
    } else {
      form.trigger("exchangeRate");
      // Recalculate USD if NGN is already entered
      if (watchNGN > 0 && currentValue > 0) {
        form.setValue("moneyPaidDolar", round2(watchNGN / currentValue));
      }
    }
  };

  const totalUSD = order?.totalUsd ?? 0;
  const paidUSD = (order?.history ?? []).reduce((acc, h) => {
    const sign = h.type?.toLowerCase() === "hoàn tiền" ? -1 : 1;
    return acc + sign * (h.moneyPaidDolar ?? 0);
  }, 0);
  const remainingUSD = totalUSD - paidUSD;
  const remainingNGN = remainingUSD * (watchRate || 1);

  const handleNGNChange = (ngn: number) => {
    form.setValue("moneyPaidNGN", ngn, { shouldValidate: true });
    if (watchRate > 0) {
      form.setValue("moneyPaidDolar", round2(ngn / watchRate));
    }
  };

  const handleQuickFill = (percent: number) => {
    if (!order) return;
    const type = form.getValues("type");
    const rate = order.exchangeRate || 1;
    const totalUSD = order.totalUsd ?? 0;
    const paidedUSD = order.paidedUsd ?? 0;
    const remainingNGN = Math.max(0, totalUSD - paidedUSD) * rate;
    const refundableNGN = Math.max(0, paidedUSD - totalUSD) * rate;
    const baseAmount =
      type.toLowerCase() === "khách trả" ? remainingNGN : refundableNGN;
    const value = Math.round((baseAmount * percent) / 100);
    handleNGNChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ghi nhận thanh toán</DialogTitle>
        </DialogHeader>

        {order && (
          <div className={`rounded-lg px-4 py-3 text-sm border ${
            remainingUSD > 0
              ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
              : remainingUSD < 0
              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              : "bg-muted border-border"
          }`}>
            <div className="flex items-center justify-between gap-4">
              <span className={`font-medium ${
                remainingUSD > 0 ? "text-red-700 dark:text-red-400"
                : remainingUSD < 0 ? "text-green-700 dark:text-green-400"
                : "text-muted-foreground"
              }`}>
                {remainingUSD > 0 ? "Khách còn nợ" : remainingUSD < 0 ? "Khách trả thừa" : "Đã thanh toán đủ"}
              </span>
              <div className="text-right">
                <div className={`font-bold tabular-nums ${
                  remainingUSD > 0 ? "text-red-700 dark:text-red-400"
                  : remainingUSD < 0 ? "text-green-700 dark:text-green-400"
                  : "text-muted-foreground"
                }`}>
                  {formatUSD(Math.abs(remainingUSD))}
                </div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  ≈ {formatNGN(Math.abs(remainingNGN))}
                </div>
              </div>
            </div>
          </div>
        )}

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
              value={watchRate || ""}
              onChange={(e) => handleExchangeRateChange(e.target.value)}
              onBlur={handleExchangeRateBlur}
              className={formErrors.exchangeRate ? "h-9 border-destructive" : "h-9"}
            />
            {formErrors.exchangeRate && (
              <p className="text-destructive text-sm">
                {formErrors.exchangeRate.message as string}
              </p>
            )}
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
                className={formErrors.moneyPaidNGN ? "h-9 border-destructive" : "h-9"}
              />
              {formErrors.moneyPaidNGN && (
                <p className="text-destructive text-sm">
                  {formErrors.moneyPaidNGN.message as string}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Số tiền (USD)</Label>
              <Input
                type="text"
                value={
                  form.watch("moneyPaidDolar") != null
                    ? formatMoneyValue(form.watch("moneyPaidDolar"))
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
              disabled={addHistory.isPending || !isFormValid}
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
