"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useAddStock } from "../hooks/use-warehouses";
import type { WarehouseItem } from "@/types/api";

const createSchema = (isKg: boolean) =>
  z.object({
    quantity: isKg
      ? z.number().min(0.01, "Số lượng phải lớn hơn 0")
      : z
          .number()
          .int("Số lượng phải là số nguyên")
          .min(1, "Số lượng phải lớn hơn 0"),
    note: z.string().min(1, "Ghi chú là bắt buộc"),
  });

type FormValues = z.infer<ReturnType<typeof createSchema>>;

interface AddStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse: WarehouseItem | null;
}

export function AddStockDialog({
  open,
  onOpenChange,
  warehouse,
}: AddStockDialogProps) {
  const addStock = useAddStock();
  const isKg = warehouse?.unitOfCalculation?.toLowerCase() === "kg";

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema(isKg)),
    defaultValues: {
      quantity: 1,
      note: "",
    },
  });

  const [quantityInput, setQuantityInput] = useState("1");

  const roundKg = (v: number) => Math.round(v * 100) / 100;
  const formatKg = (v: number) => (v === 0 ? "" : v.toFixed(2));

  const handleQuantityKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentValue: number,
    onChange: (value: number) => void
  ) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const step = 1;
    const min = isKg ? 0 : 1;
    let next =
      e.key === "ArrowUp"
        ? currentValue + step
        : Math.max(min, currentValue - step);
    if (isKg && next < 0.01) next = 0.01;
    if (isKg) next = roundKg(next);
    onChange(next);
    setQuantityInput(
      next === 0 ? "" : isKg ? formatKg(next) : String(Math.floor(next))
    );
  };

  const handleQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: number) => void
  ) => {
    let raw = e.target.value;
    if (isKg) {
      raw = raw.replace(",", ".");
      const filtered = raw.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
      setQuantityInput(filtered);
      if (filtered === "" || filtered === ".") {
        onChange(0);
        return;
      }
      const parsed = parseFloat(filtered);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        onChange(parsed);
      }
    } else {
      const filtered = raw.replace(/\D/g, "");
      setQuantityInput(filtered || "");
      const parsed = parseInt(filtered, 10);
      onChange(Number.isNaN(parsed) ? 0 : parsed);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!warehouse) return;

    await addStock.mutateAsync({
      id: warehouse._id,
      quantity: isKg ? roundKg(values.quantity) : values.quantity,
      note: values.note,
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm hàng hóa</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng thêm</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode={isKg ? "decimal" : "numeric"}
                      placeholder={isKg ? "0.00" : "0"}
                      value={quantityInput}
                      onChange={(e) => handleQuantityChange(e, field.onChange)}
                      onKeyDown={(e) =>
                        handleQuantityKeyDown(e, field.value, field.onChange)
                      }
                      onBlur={() => {
                        const v = field.value;
                        const rounded = isKg ? roundKg(v) : Math.floor(v);
                        if (isKg && v !== rounded) field.onChange(rounded);
                        const display =
                          rounded === 0 ? "" : isKg ? formatKg(rounded) : String(rounded);
                        setQuantityInput(display);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Nhập ghi chú về việc bổ sung hàng hóa"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
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
                disabled={addStock.isPending}
                className="cursor-pointer"
              >
                Thêm
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
