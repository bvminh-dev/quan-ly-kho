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
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useMemo, useRef } from "react";
import { z } from "zod/v4";
import {
  Package,
  Ruler,
  Award,
  Shapes,
  Palette,
  Scale,
  PackageCheck,
  Loader2,
  Plus,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { quickSearchFilter, normalizeText } from "@/utils/search";
import { useCreateWarehouse } from "../hooks/use-warehouses";
import {
  useInchs,
  useItems,
  useQualitys,
  useStyles,
  useColors,
  useCreateInch,
  useCreateItem,
  useCreateQuality,
  useCreateStyle,
  useCreateColor,
} from "@/features/catalog/hooks/use-catalogs";

const UNIT_OPTIONS = ["Kg", "Pcs"] as const;

// Searchable Select Component
interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ _id: string; name: string }>;
  placeholder: string;
  isLoading?: boolean;
  disabled?: boolean;
  onAddNew?: (searchText: string) => void;
}

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  isLoading = false,
  disabled = false,
  onAddNew,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectedOption = options.find((opt) => opt._id === value);

  // Track previous value to detect external changes
  const [prevValue, setPrevValue] = useState(value);
  const [inputValue, setInputValue] = useState(selectedOption?.name || "");

  // Sync input value when value changes externally (not from user input)
  if (value !== prevValue) {
    setPrevValue(value);
    if (selectedOption) {
      setInputValue(selectedOption.name);
    } else {
      setInputValue("");
    }
  }

  const filteredOptions = useMemo(() => {
    if (!inputValue.trim()) return options;
    return quickSearchFilter(options, inputValue, (item) => [item.name]);
  }, [options, inputValue]);

  // Check if input value exactly matches any option (case-insensitive, no diacritics)
  const hasExactMatch = useMemo(() => {
    if (!inputValue.trim()) return false;
    const normalizedInput = normalizeText(inputValue);
    return options.some(opt => normalizeText(opt.name) === normalizedInput);
  }, [options, inputValue]);

  // Show add button when:
  // 1. There's input text
  // 2. No exact match found
  // 3. onAddNew callback is provided
  const showAddButton = inputValue.trim() && !hasExactMatch && onAddNew;

  // Clamp highlighted index to valid range
  const safeHighlightedIndex =
    highlightedIndex >= filteredOptions.length ? -1 : highlightedIndex;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHighlightedIndex(-1);

    // Clear selection if input doesn't match selected option
    if (selectedOption && newValue !== selectedOption.name) {
      onValueChange("");
    }

    // Open dropdown when typing
    if (!open && newValue.trim()) {
      setOpen(true);
    }
  };

  const handleInputFocus = () => {
    setOpen(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlightedIndex(prev =>
        filteredOptions.length === 0 ? -1 : (prev + 1) % filteredOptions.length
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlightedIndex(prev =>
        filteredOptions.length === 0
          ? -1
          : prev <= 0
            ? filteredOptions.length - 1
            : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();

      // If an item is highlighted via keyboard navigation, select it
      if (safeHighlightedIndex >= 0) {
        handleSelectOption(filteredOptions[safeHighlightedIndex]._id);
        return;
      }

      // If only one result, select it
      if (filteredOptions.length === 1) {
        handleSelectOption(filteredOptions[0]._id);
        return;
      }

      // If exact match found, select it
      if (hasExactMatch) {
        const exactMatch = filteredOptions.find(
          opt => normalizeText(opt.name) === normalizeText(inputValue)
        );
        if (exactMatch) {
          handleSelectOption(exactMatch._id);
          return;
        }
      }

      // If no match and add button is shown, add new
      if (showAddButton) {
        handleAddNew();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSelectOption = (optionId: string) => {
    const opt = options.find(o => o._id === optionId);
    if (opt) setInputValue(opt.name);
    onValueChange(optionId);
    setHighlightedIndex(-1);
    setOpen(false);
  };

  const handleAddNew = () => {
    if (onAddNew && inputValue.trim()) {
      setOpen(false);
      setHighlightedIndex(-1);
      onAddNew(inputValue.trim());
      setInputValue("");
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              onClick={() => {
                if (!open) {
                  setOpen(true);
                }
              }}
              placeholder={isLoading ? "Đang tải..." : placeholder}
              disabled={disabled || isLoading}
              className="h-10 pr-8"
            />
            {isLoading && (
              <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground pointer-events-none" />
            )}
            {!isLoading && !showAddButton && (
              <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 opacity-50 pointer-events-none" />
            )}
          </div>
        </PopoverAnchor>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onOpenAutoFocus={(e) => {
            // Prevent auto focus on popover content, keep focus on input
            e.preventDefault();
            inputRef.current?.focus();
          }}
          onInteractOutside={(e) => {
            // Don't close if clicking on the input
            if (inputRef.current?.contains(e.target as Node)) {
              e.preventDefault();
            }
          }}
        >
          <div className="py-1">
            {filteredOptions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Thêm mới bằng cách ấn enter hoặc click vào nút + bên phải
              </p>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option._id}
                  role="option"
                  aria-selected={value === option._id}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    safeHighlightedIndex === index
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onMouseDown={(e) => {
                    // Prevent blur on input before click registers
                    e.preventDefault();
                    handleSelectOption(option._id);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseLeave={() => setHighlightedIndex(-1)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === option._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.name}
                </div>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
      {showAddButton && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={handleAddNew}
          title={`Thêm mới "${inputValue}"`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}


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

  const { data: inchsData, isLoading: inchsLoading, refetch: refetchInchs } = useInchs();
  const { data: itemsData, isLoading: itemsLoading, refetch: refetchItems } = useItems();
  const { data: qualitysData, isLoading: qualitysLoading, refetch: refetchQualitys } = useQualitys();
  const { data: stylesData, isLoading: stylesLoading, refetch: refetchStyles } = useStyles();
  const { data: colorsData, isLoading: colorsLoading, refetch: refetchColors } = useColors();

  const inchs = inchsData?.data?.items ?? [];
  const items = itemsData?.data?.items ?? [];
  const qualitys = qualitysData?.data?.items ?? [];
  const styles = stylesData?.data?.items ?? [];
  const colors = colorsData?.data?.items ?? [];

  const isLoadingOptions = inchsLoading || itemsLoading || qualitysLoading || stylesLoading || colorsLoading;

  // Mutation hooks
  const createInch = useCreateInch();
  const createItem = useCreateItem();
  const createQuality = useCreateQuality();
  const createStyle = useCreateStyle();
  const createColor = useCreateColor();

  // Confirmation dialog state
  const [confirmAddOpen, setConfirmAddOpen] = useState<{
    type: "inch" | "item" | "quality" | "style" | "color" | null;
    searchText: string;
  }>({ type: null, searchText: "" });
  const [isConfirmPending, setIsConfirmPending] = useState(false);

  // Helper function to generate code from name
  function toCode(name: string): string {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  const handleQuickAdd = async (
    type: "inch" | "item" | "quality" | "style" | "color",
    name: string
  ) => {
    const code = toCode(name);
    let result: { data: { _id: string; name: string } } | undefined;

    switch (type) {
      case "inch":
        result = await createInch.mutateAsync({ code, name });
        await refetchInchs();
        if (result?.data?._id) form.setValue("inchId", result.data._id);
        break;
      case "item":
        result = await createItem.mutateAsync({ code, name });
        await refetchItems();
        if (result?.data?._id) form.setValue("itemId", result.data._id);
        break;
      case "quality":
        result = await createQuality.mutateAsync({ code, name });
        await refetchQualitys();
        if (result?.data?._id) form.setValue("qualityId", result.data._id);
        break;
      case "style":
        result = await createStyle.mutateAsync({ code, name });
        await refetchStyles();
        if (result?.data?._id) form.setValue("styleId", result.data._id);
        break;
      case "color":
        result = await createColor.mutateAsync({ code, name });
        await refetchColors();
        if (result?.data?._id) form.setValue("colorId", result.data._id);
        break;
    }

    if (!result?.data) throw new Error("Failed to create item");
    return result.data;
  };

  const getConfirmAddConfig = () => {
    const labels: Record<string, string> = {
      inch: "inches",
      item: "loại sản phẩm",
      quality: "chất lượng",
      style: "kiểu",
      color: "màu sắc",
    };
    const label = confirmAddOpen.type ? labels[confirmAddOpen.type] : "";
    return {
      title: `Thêm mới ${label}`,
      description: `Bạn có muốn thêm mới ${label} "${confirmAddOpen.searchText}" không?`,
    };
  };

  const handleConfirmAdd = async () => {
    if (!confirmAddOpen.type || !confirmAddOpen.searchText.trim()) return;
    const { type, searchText } = confirmAddOpen;
    setConfirmAddOpen({ type: null, searchText: "" });
    setIsConfirmPending(true);
    try {
      await handleQuickAdd(type, searchText.trim());
    } finally {
      setIsConfirmPending(false);
    }
  };

  const handleRequestAdd = (type: "inch" | "item" | "quality" | "style" | "color", searchText: string) => {
    setConfirmAddOpen({ type, searchText });
  };

  const confirmAddConfig = getConfirmAddConfig();

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
  const [prevOpen, setPrevOpen] = useState(open);

  // Reset các input khi dialog mở
  if (open && !prevOpen) {
    setTotalAmountInput("0");
    setPriceHighInput("0");
    setPriceLowInput("0");
    setSaleInput("0");
    setPrevOpen(true);
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tạo mới sản phẩm kho hàng
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Section 1: Thông tin sản phẩm */}
              <div className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="itemId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          Loại sản phẩm
                        </FormLabel>
                        <FormControl>
                          <SearchableSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            options={items}
                            placeholder="Chọn loại sản phẩm..."
                            isLoading={itemsLoading}
                            disabled={itemsLoading}
                            onAddNew={(searchText) => handleRequestAdd("item", searchText)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="inchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Ruler className="h-4 w-4 text-muted-foreground" />
                          Inches
                        </FormLabel>
                        <FormControl>
                          <SearchableSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            options={inchs}
                            placeholder="Chọn inches..."
                            isLoading={inchsLoading}
                            disabled={inchsLoading}
                            onAddNew={(searchText) => handleRequestAdd("inch", searchText)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="qualityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          Chất lượng
                        </FormLabel>
                        <FormControl>
                          <SearchableSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            options={qualitys}
                            placeholder="Chọn chất lượng..."
                            isLoading={qualitysLoading}
                            disabled={qualitysLoading}
                            onAddNew={(searchText) => handleRequestAdd("quality", searchText)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="styleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Shapes className="h-4 w-4 text-muted-foreground" />
                          Kiểu
                        </FormLabel>
                        <FormControl>
                          <SearchableSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            options={styles}
                            placeholder="Chọn kiểu..."
                            isLoading={stylesLoading}
                            disabled={stylesLoading}
                            onAddNew={(searchText) => handleRequestAdd("style", searchText)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="colorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        Màu sắc
                      </FormLabel>
                      <FormControl>
                        <SearchableSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          options={colors}
                          placeholder="Chọn màu sắc..."
                          isLoading={colorsLoading}
                          disabled={colorsLoading}
                          onAddNew={(searchText) => handleRequestAdd("color", searchText)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


              {/* Section 2: Số lượng và đơn vị */}
              <div className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="unitOfCalculation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Scale className="h-4 w-4 text-muted-foreground" />
                          Đơn vị tính
                        </FormLabel>
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
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Chọn đơn vị..." />
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

                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <PackageCheck className="h-4 w-4 text-muted-foreground" />
                          Tổng số lượng
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode={isPcsUnit ? "numeric" : "decimal"}
                            value={totalAmountInput}
                            className="h-10"
                            placeholder={isPcsUnit ? "Nhập số nguyên..." : "Nhập số lượng..."}
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
                </div>
              </div>


              {/* Section 3: Giá cả */}
              <div className="space-y-4">

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="priceHigh"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Giá cao ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={priceHighInput}
                            className="h-10"
                            placeholder="0.00"
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
                        <FormLabel className="text-sm font-medium">Giá thấp ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={priceLowInput}
                            className="h-10"
                            placeholder="0.00"
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
                        <FormLabel className="text-sm font-medium">Giảm giá ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={saleInput}
                            className="h-10"
                            placeholder="0.00"
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
              </div>


              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="cursor-pointer min-w-[100px]"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={createWarehouse.isPending || isLoadingOptions}
                  className="cursor-pointer min-w-[100px]"
                >
                  {createWarehouse.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    "Tạo mới"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAddOpen.type} onOpenChange={(open) => {
        if (!open) {
          setConfirmAddOpen({ type: null, searchText: "" });
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAddConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAddConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConfirmPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAdd} disabled={isConfirmPending}>
              {isConfirmPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                "Xác nhận"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
