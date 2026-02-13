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
import { useAllCustomers, useCreateCustomer } from "@/features/customers/hooks/use-customers";
import { useConfirmOrder, useCreateOrder } from "@/features/orders/hooks/use-orders";
import { useAllWarehouses } from "@/features/warehouse/hooks/use-warehouses";
import { useExchangeRate } from "@/hooks/use-exchange-rate";
import type { CreateOrderDto, OrderDetail, WarehouseItem } from "@/types/api";
import { ChevronDown, ChevronRight, Warehouse } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { InvoiceDialog } from "./components/invoice-dialog";
import { OrderBuilder } from "./components/order-builder";
import { WarehousePicker } from "./components/warehouse-picker";
import type { OrderSet, SelectedItem } from "./types";

let tempIdCounter = 0;
const genTempId = () => `temp-${++tempIdCounter}-${Date.now()}`;
let setIdCounter = 0;
const genSetId = () => `set-${++setIdCounter}-${Date.now()}`;
let orderCounter = 0;
const getNextOrder = () => ++orderCounter;

export default function SalesPage() {
  const router = useRouter();

  const { data: whData } = useAllWarehouses();
  const { data: custData } = useAllCustomers();
  const createOrder = useCreateOrder();
  const confirmOrder = useConfirmOrder();
  const createCustomer = useCreateCustomer();
  const { data: liveRate } = useExchangeRate();

  const warehouseItems = whData?.data?.items ?? [];
  const customers = custData?.data?.items ?? [];

  const warehouseMap = useMemo(() => {
    const map: Record<string, WarehouseItem> = {};
    for (const wh of warehouseItems) {
      map[wh._id] = wh;
    }
    return map;
  }, [warehouseItems]);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [userExchangeRate, setUserExchangeRate] = useState<number | null>(null);
  const exchangeRate = userExchangeRate ?? (liveRate ? Math.round(liveRate) : 1550);
  const setExchangeRate = setUserExchangeRate;
  const [priceType, setPriceType] = useState<"high" | "low">("high");
  const [standaloneItems, setStandaloneItems] = useState<SelectedItem[]>([]);
  const [sets, setSets] = useState<OrderSet[]>([]);
  const [note, setNote] = useState("");

  const [warehouseExpanded, setWarehouseExpanded] = useState(true);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderDetail | null>(null);
  const [createCustOpen, setCreateCustOpen] = useState(false);
  const [newCustName, setNewCustName] = useState("");

  const allSelectedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of standaloneItems) ids.add(item.warehouseId);
    for (const set of sets) {
      for (const item of set.items) ids.add(item.warehouseId);
    }
    return ids;
  }, [standaloneItems, sets]);

  const handleSelectWarehouse = useCallback(
    (wh: WarehouseItem) => {
      const price =
        priceType === "high" ? wh.priceHigh : wh.priceLow;
      const sale = priceType === "high" ? wh.sale : 0;

      setStandaloneItems((prev) => [
        ...prev,
        {
          tempId: genTempId(),
          warehouseId: wh._id,
          warehouse: wh,
          quantity: 0,
          price,
          sale,
          customPrice: false,
          customSale: false,
          orderIndex: getNextOrder(),
        },
      ]);
    },
    [priceType]
  );

  const handleDeselectWarehouse = useCallback(
    (warehouseId: string) => {
      setStandaloneItems((prev) =>
        prev.filter((i) => i.warehouseId !== warehouseId)
      );
      setSets((prev) => {
        const updatedSets: OrderSet[] = [];
        const returnedItems: SelectedItem[] = [];
        for (const set of prev) {
          const remaining = set.items.filter(
            (i) => i.warehouseId !== warehouseId
          );
          if (remaining.length < 2) {
            returnedItems.push(...remaining);
          } else {
            updatedSets.push({ ...set, items: remaining });
          }
        }
        if (returnedItems.length > 0) {
          setStandaloneItems((items) => [...items, ...returnedItems]);
        }
        return updatedSets;
      });
    },
    []
  );

  const handleUpdateItem = useCallback(
    (tempId: string, updates: Partial<SelectedItem>) => {
      setStandaloneItems((prev) =>
        prev.map((item) =>
          item.tempId === tempId ? { ...item, ...updates } : item
        )
      );
    },
    []
  );

  const handleRemoveItem = useCallback((tempId: string) => {
    setStandaloneItems((prev) => prev.filter((i) => i.tempId !== tempId));
  }, []);

  const handleCreateSet = useCallback(
    (tempIds: string[]) => {
      const itemsToGroup = standaloneItems.filter((i) =>
        tempIds.includes(i.tempId)
      );
      if (itemsToGroup.length < 2) return;

      const newSet: OrderSet = {
        id: genSetId(),
        nameSet: `Set ${sets.length + 1}`,
        priceSet: 0,
        saleSet: 0,
        quantitySet: 1,
        items: itemsToGroup,
        orderIndex: Math.min(...itemsToGroup.map((i) => i.orderIndex)),
      };

      setStandaloneItems((prev) =>
        prev.filter((i) => !tempIds.includes(i.tempId))
      );
      setSets((prev) => [...prev, newSet]);
    },
    [standaloneItems, sets.length]
  );

  const handleUngroupSet = useCallback((setId: string) => {
    setSets((prev) => {
      const set = prev.find((s) => s.id === setId);
      if (!set) return prev;
      setStandaloneItems((items) => [...items, ...set.items]);
      return prev.filter((s) => s.id !== setId);
    });
  }, []);

  const handleUpdateSet = useCallback(
    (setId: string, updates: Partial<OrderSet>) => {
      setSets((prev) =>
        prev.map((s) => (s.id === setId ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const handleUpdateSetItem = useCallback(
    (setId: string, tempId: string, updates: Partial<SelectedItem>) => {
      setSets((prev) =>
        prev.map((s) =>
          s.id === setId
            ? {
                ...s,
                items: s.items.map((i) =>
                  i.tempId === tempId ? { ...i, ...updates } : i
                ),
              }
            : s
        )
      );
    },
    []
  );

  const handleRemoveSetItem = useCallback((setId: string, tempId: string) => {
    setSets((prev) => {
      const set = prev.find((s) => s.id === setId);
      if (!set) return prev;
      const remaining = set.items.filter((i) => i.tempId !== tempId);
      if (remaining.length < 2) {
        setStandaloneItems((items) => [...items, ...remaining]);
        return prev.filter((s) => s.id !== setId);
      }
      return prev.map((s) =>
        s.id === setId ? { ...s, items: remaining } : s
      );
    });
  }, []);

  const handlePriceTypeChange = useCallback(
    (type: "high" | "low") => {
      setPriceType(type);
      setStandaloneItems((prev) =>
        prev.map((item) => {
          if (item.customPrice) return item;
          const wh = warehouseMap[item.warehouseId];
          if (!wh) return item;
          const price = type === "high" ? wh.priceHigh : wh.priceLow;
          // Giữ lại giá trị sale nếu đã được tùy chỉnh, nếu không thì chỉ cập nhật khi chọn giá cao
          const sale = item.customSale 
            ? item.sale 
            : (type === "high" ? wh.sale : item.sale);
          return {
            ...item,
            price,
            sale,
          };
        })
      );
      // Cập nhật items trong sets
      setSets((prev) =>
        prev.map((set) => ({
          ...set,
          items: set.items.map((item) => {
            if (item.customPrice) return item;
            const wh = warehouseMap[item.warehouseId];
            if (!wh) return item;
            const price = type === "high" ? wh.priceHigh : wh.priceLow;
            // Giữ lại giá trị sale nếu đã được tùy chỉnh, nếu không thì chỉ cập nhật khi chọn giá cao
            const sale = item.customSale 
              ? item.sale 
              : (type === "high" ? wh.sale : item.sale);
            return {
              ...item,
              price,
              sale,
            };
          }),
        }))
      );
    },
    [warehouseMap]
  );

  const buildOrderDto = (): CreateOrderDto | null => {
    if (!selectedCustomerId) {
      toast.error("Vui lòng chọn khách hàng");
      return null;
    }
    if (standaloneItems.length === 0 && sets.length === 0) {
      toast.error("Vui lòng chọn sản phẩm");
      return null;
    }
    for (const item of standaloneItems) {
      if (!item.quantity || item.quantity <= 0) {
        toast.error("Vui lòng nhập số lượng cho tất cả sản phẩm");
        return null;
      }
    }
    for (const set of sets) {
      for (const item of set.items) {
        if (!item.quantity || item.quantity <= 0) {
          toast.error("Vui lòng nhập số lượng cho tất cả sản phẩm trong set");
          return null;
        }
      }
    }

    // Build a unified ordered list so the API receives products in display order
    const entries: Array<
      | { type: "item"; item: SelectedItem; order: number }
      | { type: "set"; set: OrderSet; order: number }
    > = [];
    for (const item of standaloneItems) {
      entries.push({ type: "item", item, order: item.orderIndex });
    }
    for (const set of sets) {
      entries.push({ type: "set", set, order: set.orderIndex });
    }
    entries.sort((a, b) => a.order - b.order);

    const products = entries.map((entry) => {
      if (entry.type === "item") {
        const it = entry.item;
        return {
          items: [
            {
              id: it.warehouseId,
              quantity: it.quantity,
              price: it.price,
              sale: it.sale,
              customPrice: it.customPrice,
              customSale: it.customSale,
            },
          ],
        };
      }
      const s = entry.set;
      return {
        nameSet: s.nameSet,
        priceSet: s.priceSet,
        quantitySet: s.quantitySet,
        saleSet: s.saleSet,
        isCalcSet: s.priceSet > 0,
        items: s.items.map((i) => ({
          id: i.warehouseId,
          quantity: i.quantity,
          price: i.price,
          sale: i.sale,
          customPrice: i.customPrice,
          customSale: i.customSale,
        })),
      };
    });

    return {
      type: priceType === "high" ? "cao" : "thấp",
      exchangeRate,
      customer: selectedCustomerId,
      note,
      products,
    };
  };

  const handleSaveQuote = async () => {
    const dto = buildOrderDto();
    if (!dto) return;
    try {
      await createOrder.mutateAsync(dto);
      toast.success("Lưu báo giá thành công");
      router.push("/dashboard/orders");
    } catch {
      // handled by hook
    }
  };

  const handleConfirm = async () => {
    const dto = buildOrderDto();
    if (!dto) return;
    try {
      const result = await createOrder.mutateAsync(dto);
      const orderId = result.data._id;
      const confirmedResult = await confirmOrder.mutateAsync(orderId);
      toast.success("Đã chốt đơn hàng thành công");
      setCreatedOrder(confirmedResult.data);
      setInvoiceOpen(true);
    } catch {
      // handled by hook
    }
  };

  const handleInvoiceClose = () => {
    setInvoiceOpen(false);
    setCreatedOrder(null);
    router.push("/dashboard/orders");
  };

  const handleCreateCust = async () => {
    if (!newCustName.trim()) return;
    try {
      const result = await createCustomer.mutateAsync({ name: newCustName.trim() });
      setSelectedCustomerId(result.data._id);
      setNewCustName("");
      setCreateCustOpen(false);
    } catch {
      // handled by hook
    }
  };

  const isSaving = createOrder.isPending || confirmOrder.isPending;

  return (
    <div className="flex flex-col gap-4 lg:h-full lg:overflow-hidden">
      <div className="space-y-1 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Bán hàng</h1>
        <p className="text-sm text-muted-foreground">
          Tạo đơn hàng mới
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1 min-h-0">
        <div className={`border rounded-lg bg-card shadow-sm overflow-hidden flex flex-col shrink-0 transition-all duration-300 ${warehouseExpanded ? "max-h-[500px]" : "h-auto"}`}>
          <button
            type="button"
            onClick={() => setWarehouseExpanded((prev) => !prev)}
            className="p-3 border-b bg-muted/30 shrink-0 flex items-center gap-2 w-full text-left hover:bg-muted/50 transition-colors cursor-pointer"
          >
            {warehouseExpanded ? (
              <ChevronDown className="size-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground" />
            )}
            <Warehouse className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Danh sách kho</h3>
            <span className="text-xs text-muted-foreground ml-auto">
              {allSelectedIds.size > 0 && `${allSelectedIds.size} đã chọn`}
            </span>
          </button>
          {warehouseExpanded && (
            <WarehousePicker
              items={warehouseItems}
              onSelect={handleSelectWarehouse}
              onDeselect={handleDeselectWarehouse}
              selectedIds={allSelectedIds}
            />
          )}
        </div>

        <div className="flex-1 min-h-[50dvh] border rounded-lg bg-card shadow-sm overflow-hidden flex flex-col">
          <OrderBuilder
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onCustomerChange={setSelectedCustomerId}
            onCreateCustomer={() => setCreateCustOpen(true)}
            exchangeRate={exchangeRate}
            onExchangeRateChange={setExchangeRate}
            priceType={priceType}
            onPriceTypeChange={handlePriceTypeChange}
            standaloneItems={standaloneItems}
            sets={sets}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
            onCreateSet={handleCreateSet}
            onUngroupSet={handleUngroupSet}
            onUpdateSet={handleUpdateSet}
            onUpdateSetItem={handleUpdateSetItem}
            onRemoveSetItem={handleRemoveSetItem}
            note={note}
            onNoteChange={setNote}
            onSaveQuote={handleSaveQuote}
            onConfirm={handleConfirm}
            isSaving={isSaving}
            warehouseMap={warehouseMap}
          />
        </div>
      </div>

      <InvoiceDialog
        open={invoiceOpen}
        onClose={handleInvoiceClose}
        order={createdOrder}
        warehouseMap={warehouseMap}
      />

      <Dialog open={createCustOpen} onOpenChange={setCreateCustOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo khách hàng mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tên khách hàng</Label>
              <Input
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="Nhập tên khách hàng"
                onKeyDown={(e) => e.key === "Enter" && handleCreateCust()}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCreateCustOpen(false)}
                className="cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreateCust}
                disabled={createCustomer.isPending}
                className="cursor-pointer"
              >
                Tạo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
