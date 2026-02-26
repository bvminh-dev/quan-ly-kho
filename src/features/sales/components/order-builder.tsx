"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getWarehouseDisplayName } from "@/features/warehouse/utils/sort-warehouse";
import { formatNGN, formatUSD } from "@/utils/currency";
import { cn } from "@/lib/utils";
import type { CustomerItem, WarehouseItem } from "@/types/api";
import { Layers, Package, Plus, Trash2, Ungroup } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { OrderSet, SelectedItem } from "../types";
import { SET_COLORS } from "../types";

interface OrderBuilderProps {
  customers: CustomerItem[];
  selectedCustomerId: string;
  onCustomerChange: (id: string) => void;
  onCreateCustomer: () => void;
  exchangeRate: number;
  onExchangeRateChange: (rate: number) => void;
  priceType: "high" | "low";
  onPriceTypeChange: (type: "high" | "low") => void;
  standaloneItems: SelectedItem[];
  sets: OrderSet[];
  onUpdateItem: (tempId: string, updates: Partial<SelectedItem>) => void;
  onRemoveItem: (tempId: string) => void;
  onCreateSet: (tempIds: string[]) => void;
  onUngroupSet: (setId: string) => void;
  onUpdateSet: (setId: string, updates: Partial<OrderSet>) => void;
  onUpdateSetItem: (
    setId: string,
    tempId: string,
    updates: Partial<SelectedItem>,
  ) => void;
  onRemoveSetItem: (setId: string, tempId: string) => void;
  note: string;
  onNoteChange: (note: string) => void;
  debt: number;
  onDebtChange: (value: number) => void;
  paid: number;
  onPaidChange: (value: number) => void;
  onSaveQuote: () => void;
  onConfirm: () => void;
  isSaving: boolean;
  warehouseMap: Record<string, WarehouseItem>;
  title?: string;
}

export function OrderBuilder({
  customers,
  selectedCustomerId,
  onCustomerChange,
  onCreateCustomer,
  exchangeRate,
  onExchangeRateChange,
  priceType,
  onPriceTypeChange,
  standaloneItems,
  sets,
  onUpdateItem,
  onRemoveItem,
  onCreateSet,
  onUngroupSet,
  onUpdateSet,
  onUpdateSetItem,
  onRemoveSetItem,
  note,
  onNoteChange,
  debt,
  onDebtChange,
  paid,
  onPaidChange,
  onSaveQuote,
  onConfirm,
  isSaving,
  warehouseMap,
  title = "Tạo đơn hàng",
}: OrderBuilderProps) {
  const [selectedForSet, setSelectedForSet] = useState<Set<string>>(new Set());

  const toggleSelectForSet = useCallback((tempId: string) => {
    setSelectedForSet((prev) => {
      const next = new Set(prev);
      if (next.has(tempId)) next.delete(tempId);
      else next.add(tempId);
      return next;
    });
  }, []);

  const handleCreateSet = () => {
    if (selectedForSet.size < 2) return;
    onCreateSet(Array.from(selectedForSet));
    setSelectedForSet(new Set());
  };

  const orderedEntries = useMemo(() => {
    const entries: Array<
      | { type: "standalone"; item: SelectedItem; order: number }
      | { type: "set"; set: OrderSet; setColorIndex: number; order: number }
    > = [];
    for (const item of standaloneItems) {
      entries.push({ type: "standalone", item, order: item.orderIndex });
    }
    // Sort sets by orderIndex first to determine stable color indices
    const sortedSets = [...sets].sort((a, b) => a.orderIndex - b.orderIndex);
    for (let i = 0; i < sortedSets.length; i++) {
      entries.push({
        type: "set",
        set: sortedSets[i],
        setColorIndex: i,
        order: sortedSets[i].orderIndex,
      });
    }
    entries.sort((a, b) => a.order - b.order);
    return entries;
  }, [standaloneItems, sets]);

  const total = useMemo(() => {
    let sum = 0;
    for (const item of standaloneItems) {
      sum += (item.price - item.sale) * item.quantity;
    }
    for (const set of sets) {
      if (set.priceSet > 0) {
        sum += (set.priceSet - set.saleSet) * set.quantitySet;
      } else {
        for (const item of set.items) {
          sum += (item.price - item.sale) * item.quantity;
        }
      }
    }
    return sum;
  }, [standaloneItems, sets]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="p-4 border-b space-y-4">
        <h2 className="text-lg font-semibold">{title}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Khách hàng</Label>
            <div className="flex gap-2">
              <Select
                value={selectedCustomerId}
                onValueChange={onCustomerChange}
              >
                <SelectTrigger className="h-9 flex-1">
                  <SelectValue placeholder="Chọn khách hàng" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 shrink-0 cursor-pointer"
                onClick={onCreateCustomer}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Debt (USD)</Label>
            <Input
              type="number"
              min={0}
              step="any"
              value={debt ?? ""}
              onChange={(e) =>
                onDebtChange(
                  e.target.value === "" ? 0 : parseFloat(e.target.value) || 0,
                )
              }
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Paid (USD)</Label>
            <Input
              type="number"
              min={0}
              step="any"
              value={paid ?? ""}
              onChange={(e) =>
                onPaidChange(
                  e.target.value === "" ? 0 : parseFloat(e.target.value) || 0,
                )
              }
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Tỷ giá (1 USD = ? NGN)</Label>
            <Input
              type="number"
              min={0}
              step="any"
              value={exchangeRate ?? ""}
              onChange={(e) =>
                onExchangeRateChange(
                  e.target.value === "" ? 0 : parseFloat(e.target.value) || 0,
                )
              }
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Loại giá</Label>
            <div className="inline-flex h-8 rounded-md border bg-muted p-0.5">
              <button
                type="button"
                onClick={() => onPriceTypeChange("low")}
                className={cn(
                  "inline-flex items-center justify-center rounded-sm px-2 text-xs font-medium transition-all cursor-pointer",
                  priceType === "low"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Giá thấp
              </button>
              <button
                type="button"
                onClick={() => onPriceTypeChange("high")}
                className={cn(
                  "inline-flex items-center justify-center rounded-sm px-2 text-xs font-medium transition-all cursor-pointer",
                  priceType === "high"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Giá cao
              </button>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {standaloneItems.length === 0 && sets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm">Chọn sản phẩm từ danh sách bên trái</p>
            </div>
          )}

          {selectedForSet.size >= 2 && (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateSet}
                className="cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5 mr-1" />
                Tạo Set ({selectedForSet.size})
              </Button>
            </div>
          )}

          {orderedEntries.map((entry) => {
            if (entry.type === "standalone") {
              const item = entry.item;
              const wh = warehouseMap[item.warehouseId];
              return (
                <div
                  key={item.tempId}
                  className={`border rounded-lg p-3 transition-colors ${
                    selectedForSet.has(item.tempId)
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedForSet.has(item.tempId)}
                        onChange={() => toggleSelectForSet(item.tempId)}
                        className="rounded cursor-pointer"
                      />
                      <span className="text-sm font-medium truncate max-w-[250px]">
                        {getWarehouseDisplayName(item.warehouse)}
                      </span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive cursor-pointer"
                      onClick={() => onRemoveItem(item.tempId)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">
                        Số lượng (max: {wh?.amountAvailable}{" "}
                        {wh?.unitOfCalculation})
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        max={wh?.amountAvailable ?? 999}
                        value={item.quantity ?? ""}
                        onChange={(e) =>
                          onUpdateItem(item.tempId, {
                            quantity: Math.min(
                              parseFloat(e.target.value) || 0,
                              wh?.amountAvailable ?? 999,
                            ),
                          })
                        }
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Đơn giá ($)</Label>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={item.price ?? ""}
                        onChange={(e) =>
                          onUpdateItem(item.tempId, {
                            price: parseFloat(e.target.value) || 0,
                            customPrice: true,
                          })
                        }
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Giảm giá ($)</Label>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={item.sale ?? ""}
                        onChange={(e) =>
                          onUpdateItem(item.tempId, {
                            sale: parseFloat(e.target.value) || 0,
                            customSale: true,
                          })
                        }
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              );
            }

            const set = entry.set;
            const setColorIdx = entry.setColorIndex;
            return (
              <div
                key={set.id}
                className={`border-2 rounded-lg p-3 space-y-3 ${SET_COLORS[setColorIdx % SET_COLORS.length]}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    {set.nameSet || "(Chưa đặt tên)"}
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onUngroupSet(set.id)}
                    className="cursor-pointer text-xs"
                  >
                    <Ungroup className="h-3.5 w-3.5 mr-1" />
                    Tách set
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Tên set</Label>
                    <Input
                      value={set.nameSet}
                      onChange={(e) =>
                        onUpdateSet(set.id, { nameSet: e.target.value })
                      }
                      className="h-8"
                      placeholder="Set A"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Giá set ($)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={set.priceSet ?? ""}
                      onChange={(e) =>
                        onUpdateSet(set.id, {
                          priceSet: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Giảm giá ($)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={set.saleSet ?? ""}
                      onChange={(e) =>
                        onUpdateSet(set.id, {
                          saleSet: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">SL set</Label>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      value={set.quantitySet ?? ""}
                      onChange={(e) =>
                        onUpdateSet(set.id, {
                          quantitySet: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-8"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  {set.items.map((item) => {
                    const wh = warehouseMap[item.warehouseId];
                    return (
                      <div
                        key={item.tempId}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="flex-1 truncate font-medium">
                          {getWarehouseDisplayName(item.warehouse)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            max={wh?.amountAvailable ?? 999}
                            value={item.quantity ?? ""}
                            onChange={(e) =>
                              onUpdateSetItem(set.id, item.tempId, {
                                quantity: Math.min(
                                  parseFloat(e.target.value) || 0,
                                  wh?.amountAvailable ?? 999,
                                ),
                              })
                            }
                            className="h-7 w-20"
                            placeholder="SL"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive cursor-pointer"
                            onClick={() => onRemoveSetItem(set.id, item.tempId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="border-t p-4 space-y-3">
        {/* <div className="space-y-1.5">
          <Label className="text-xs">Ghi chú</Label>
          <Textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Ghi chú đơn hàng..."
            className="h-16 resize-none"
          />
        </div> */}

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-muted-foreground">Tổng: </span>
            <span className="text-lg font-bold text-primary">
              {formatUSD(total)}
            </span>
            <span className="text-muted-foreground ml-2">
              ({formatNGN(total * exchangeRate)})
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onSaveQuote}
              disabled={isSaving}
              className="cursor-pointer"
            >
              Lưu báo giá
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isSaving}
              className="cursor-pointer"
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
