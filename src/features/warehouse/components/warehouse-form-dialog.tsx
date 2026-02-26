"use client";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useCreateWarehouse } from "../hooks/use-warehouses";

const INCHES_OPTIONS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30];
const ITEM_OPTIONS = ["CLOSURE", "FRONTAL", "WEFT"] as const;
const QUALITY_OPTIONS = [
  "SDD",
  "DD",
  "VIP",
  "SINGLEDONOR",
  "2X4",
  "2X4 SINGLEDONOR",
  "2X6",
  "2X6 SINGLEDONOR",
  "5X5",
  "5X5 HD",
  "5X5 SINGLEDONOR",
  "5X5 SINGLEDONOR HD",
  "13X4",
  "13X4 HD",
  "13X6",
  "13X6 HD",
] as const;
const STYLE_OPTIONS = [
  "BONESTRAIGHT",
  "BONESTRAIGHT LỖI",
  "BOUNCE",
  "EGG LỖI",
  "EGGCURLS",
] as const;
const COLOR_OPTIONS = [
  "NATURAL",
  "BROWN COPPER",
  "BURGUNDY",
  "GREY",
  "PIANO RED",
  "BURGUNDYN",
  "BROWN TIP",
  "BROWN CŨ",
  "BROWN LẪN",
] as const;
const UNIT_OPTIONS = ["Kg", "Pcs"] as const;

const schema = z.object({
  inches: z.number().min(1, "Chọn inches"),
  item: z.string().min(1, "Chọn loại sản phẩm"),
  quality: z.string().min(1, "Chọn chất lượng"),
  style: z.string().min(1, "Chọn kiểu"),
  color: z.string().min(1, "Chọn màu"),
  totalAmount: z.number().min(0, "Số lượng >= 0"),
  unitOfCalculation: z.string().min(1, "Chọn đơn vị"),
  priceHigh: z.number().min(0).optional(),
  priceLow: z.number().min(0).optional(),
  sale: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

interface WarehouseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WarehouseFormDialog({
  open,
  onOpenChange,
}: WarehouseFormDialogProps) {
  const createWarehouse = useCreateWarehouse();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      inches: 10,
      item: "",
      quality: "",
      style: "",
      color: "",
      totalAmount: 0,
      unitOfCalculation: "",
      priceHigh: 0,
      priceLow: 0,
      sale: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createWarehouse.mutateAsync(values);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo mới sản phẩm tồn kho</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="item"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại sản phẩm</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Chọn..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ITEM_OPTIONS.map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inches"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inches</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Chọn..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INCHES_OPTIONS.map((v) => (
                          <SelectItem key={v} value={String(v)}>{v}&quot;</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="quality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chất lượng</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Chọn..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {QUALITY_OPTIONS.map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kiểu</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Chọn..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STYLE_OPTIONS.map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Màu</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Chọn..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COLOR_OPTIONS.map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitOfCalculation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn vị tính</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Chọn..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {UNIT_OPTIONS.map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tổng số lượng</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? 0
                            : parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="priceHigh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá cao ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priceLow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá thấp ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giảm giá ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? 0
                              : parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                disabled={createWarehouse.isPending}
                className="cursor-pointer"
              >
                Tạo
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
