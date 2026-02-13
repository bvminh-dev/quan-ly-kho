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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useRevertOrder } from "../hooks/use-orders";
import type { OrderDetail } from "@/types/api";

const schema = z.object({
  note: z.string().min(1, "Lý do hoàn đơn là bắt buộc"),
});

type FormValues = z.infer<typeof schema>;

interface RevertOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderDetail | null;
}

export function RevertOrderDialog({
  open,
  onOpenChange,
  order,
}: RevertOrderDialogProps) {
  const revertOrder = useRevertOrder();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      note: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!order) return;
    await revertOrder.mutateAsync({
      id: order._id,
      dto: values,
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hoàn đơn hàng</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do hoàn đơn</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[100px] resize-none"
                      placeholder="Nhập lý do hoàn đơn..."
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
                disabled={revertOrder.isPending}
                className="cursor-pointer"
              >
                Xác nhận
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
