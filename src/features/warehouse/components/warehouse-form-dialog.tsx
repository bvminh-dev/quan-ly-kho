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
import { useEffect, useState } from "react";
import { z } from "zod/v4";
import { useCreateWarehouse } from "../hooks/use-warehouses";
import {
  useInchs,
  useItems,
  useQualitys,
  useStyles,
  useColors,
} from "@/features/catalog/hooks/use-catalogs";

const UNIT_OPTIONS = ["Kg", "Pcs"] as const;

const schema = z.object({
  inchId: z.string().min(1, "Chọn inches"),
  itemId: z.string().min(1, "Chọn loại sản phẩm"),
  qualityId: z.string().min(1, "Chọn chất lượng"),
  styleId: z.string().min(1, "Chọn kiểu"),
  colorId: z.string().min(1, "Chọn màu"),
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

  const { data: inchsData, isLoading: inchsLoading } = useInchs();
  const { data: itemsData, isLoading: itemsLoading } = useItems();
  const { data: qualitysData, isLoading: qualitysLoading } = useQualitys();
  const { data: stylesData, isLoading: stylesLoading } = useStyles();
  const { data: colorsData, isLoading: colorsLoading } = useColors();

  const inchs = inchsData?.data?.items ?? [];
  const items = itemsData?.data?.items ?? [];
  const qualitys = qualitysData?.data?.items ?? [];
  const styles = stylesData?.data?.items ?? [];
  const colors = colorsData?.data?.items ?? [];

  const isLoadingOptions = inchsLoading || itemsLoading || qualitysLoading || stylesLoading || colorsLoading;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      inchId: "",
      itemId: "",
      qualityId: "",
      styleId: "",
      colorId: "",
      totalAmount: 0,
      unitOfCalculation: "",
      priceHigh: 0,
      priceLow: 0,
      sale: 0,
    },
  });

  const unitOfCalculation = form.watch("unitOfCalculation");
  const isPcsUnit = unitOfCalculation === "Pcs";

  // State để lưu giá trị string đang nhập cho các trường số
  const [totalAmountInput, setTotalAmountInput] = useState<string>("0");
  const [priceHighInput, setPriceHighInput] = useState<string>("0");
  const [priceLowInput, setPriceLowInput] = useState<string>("0");
  const [saleInput, setSaleInput] = useState<string>("0");

  // Reset các input khi dialog mở
  useEffect(() => {
    if (open) {
      setTotalAmountInput("0");
      setPriceHighInput("0");
      setPriceLowInput("0");
      setSaleInput("0");
    }
  }, [open]);

  const onSubmit = async (values: FormValues) => {
    await createWarehouse.mutateAsync(values);
    onOpenChange(false);
    form.reset();
    setTotalAmountInput("0");
    setPriceHighInput("0");
    setPriceLowInput("0");
    setSaleInput("0");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo mới sản phẩm kho hàng</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="itemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại sản phẩm</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={itemsLoading}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={itemsLoading ? "Đang tải..." : "Chọn..."} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {items.map((v) => (
                          <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inches</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={inchsLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={inchsLoading ? "Đang tải..." : "Chọn..."} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {inchs.map((v) => (
                          <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
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
                name="qualityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chất lượng</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={qualitysLoading}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={qualitysLoading ? "Đang tải..." : "Chọn..."} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {qualitys.map((v) => (
                          <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="styleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kiểu</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={stylesLoading}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={stylesLoading ? "Đang tải..." : "Chọn..."} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {styles.map((v) => (
                          <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
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
                name="colorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Màu</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={colorsLoading}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={colorsLoading ? "Đang tải..." : "Chọn..."} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colors.map((v) => (
                          <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
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
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Nếu chuyển sang Pcs, làm tròn totalAmount về số nguyên
                        if (value === "Pcs") {
                          const currentAmount = form.getValues("totalAmount");
                          if (currentAmount && currentAmount % 1 !== 0) {
                            const roundedValue = Math.round(currentAmount);
                            form.setValue("totalAmount", roundedValue);
                            setTotalAmountInput(roundedValue.toString());
                          }
                        }
                      }}
                      value={field.value}
                    >
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
                      type="text"
                      inputMode={isPcsUnit ? "numeric" : "decimal"}
                      value={totalAmountInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Nếu đơn vị là Pcs, chỉ cho phép số nguyên
                        // Nếu đơn vị là Kg hoặc chưa chọn, cho phép số thập phân
                        const pattern = isPcsUnit ? /^\d*$/ : /^\d*\.?\d*$/;
                        if (value === "") {
                          // Không cho phép để trống, tự động set về "0"
                          setTotalAmountInput("0");
                          field.onChange(0);
                        } else if (pattern.test(value)) {
                          setTotalAmountInput(value);
                          // Chỉ parse và cập nhật form khi giá trị hợp lệ và không phải đang nhập dở
                          if (value !== ".") {
                            if (isPcsUnit) {
                              const intValue = parseInt(value, 10);
                              if (!isNaN(intValue)) {
                                field.onChange(intValue);
                              }
                            } else {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue)) {
                                field.onChange(numValue);
                              }
                            }
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const value = e.target.value;
                        // Đảm bảo giá trị cuối cùng là số hợp lệ
                        if (value === "" || value === ".") {
                          field.onChange(0);
                          setTotalAmountInput("0");
                        } else {
                          if (isPcsUnit) {
                            // Với Pcs, làm tròn về số nguyên
                            const intValue = parseInt(value, 10);
                            const finalValue = isNaN(intValue) ? 0 : intValue;
                            field.onChange(finalValue);
                            setTotalAmountInput(finalValue.toString());
                          } else {
                            // Với Kg, giữ nguyên số thập phân
                            const numValue = parseFloat(value);
                            const finalValue = isNaN(numValue) ? 0 : numValue;
                            field.onChange(finalValue);
                            setTotalAmountInput(finalValue.toString());
                          }
                        }
                      }}
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
                        type="text"
                        inputMode="decimal"
                        value={priceHighInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Chỉ cho phép số và dấu chấm
                          if (value === "") {
                            // Không cho phép để trống, tự động set về "0"
                            setPriceHighInput("0");
                            field.onChange(0);
                          } else if (/^\d*\.?\d*$/.test(value)) {
                            setPriceHighInput(value);
                            // Chỉ parse và cập nhật form khi giá trị hợp lệ và không phải đang nhập dở
                            if (value !== ".") {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue)) {
                                field.onChange(numValue);
                              }
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          // Đảm bảo giá trị cuối cùng là số hợp lệ
                          if (value === "" || value === ".") {
                            field.onChange(0);
                            setPriceHighInput("0");
                          } else {
                            const numValue = parseFloat(value);
                            const finalValue = isNaN(numValue) ? 0 : numValue;
                            field.onChange(finalValue);
                            setPriceHighInput(finalValue.toString());
                          }
                        }}
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
                        type="text"
                        inputMode="decimal"
                        value={priceLowInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Chỉ cho phép số và dấu chấm
                          if (value === "") {
                            // Không cho phép để trống, tự động set về "0"
                            setPriceLowInput("0");
                            field.onChange(0);
                          } else if (/^\d*\.?\d*$/.test(value)) {
                            setPriceLowInput(value);
                            // Chỉ parse và cập nhật form khi giá trị hợp lệ và không phải đang nhập dở
                            if (value !== ".") {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue)) {
                                field.onChange(numValue);
                              }
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          // Đảm bảo giá trị cuối cùng là số hợp lệ
                          if (value === "" || value === ".") {
                            field.onChange(0);
                            setPriceLowInput("0");
                          } else {
                            const numValue = parseFloat(value);
                            const finalValue = isNaN(numValue) ? 0 : numValue;
                            field.onChange(finalValue);
                            setPriceLowInput(finalValue.toString());
                          }
                        }}
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
                        type="text"
                        inputMode="decimal"
                        value={saleInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Chỉ cho phép số và dấu chấm
                          if (value === "") {
                            // Không cho phép để trống, tự động set về "0"
                            setSaleInput("0");
                            field.onChange(0);
                          } else if (/^\d*\.?\d*$/.test(value)) {
                            setSaleInput(value);
                            // Chỉ parse và cập nhật form khi giá trị hợp lệ và không phải đang nhập dở
                            if (value !== ".") {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue)) {
                                field.onChange(numValue);
                              }
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          // Đảm bảo giá trị cuối cùng là số hợp lệ
                          if (value === "" || value === ".") {
                            field.onChange(0);
                            setSaleInput("0");
                          } else {
                            const numValue = parseFloat(value);
                            const finalValue = isNaN(numValue) ? 0 : numValue;
                            field.onChange(finalValue);
                            setSaleInput(finalValue.toString());
                          }
                        }}
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
                disabled={createWarehouse.isPending || isLoadingOptions}
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
