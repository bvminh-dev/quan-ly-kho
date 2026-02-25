"use client";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getWarehouseDisplayName,
  sortWarehouseItems,
} from "@/features/warehouse/utils/sort-warehouse";
import { quickSearchFilter } from "@/utils/search";
import type { WarehouseItem } from "@/types/api";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

interface WarehousePickerProps {
  items: WarehouseItem[];
  onSelect: (item: WarehouseItem) => void;
  onDeselect: (warehouseId: string) => void;
  selectedIds: Set<string>;
}

export function WarehousePicker({
  items,
  onSelect,
  onDeselect,
  selectedIds,
}: WarehousePickerProps) {
  const [search, setSearch] = useState("");

  const sortedItems = useMemo(() => sortWarehouseItems(items), [items]);

  const filteredItems = useMemo(
    () =>
      quickSearchFilter(sortedItems, search, (item) => [
        item._id,
        item.inches,
        item.item,
        item.quality,
        item.style,
        item.color,
        item.amountAvailable,
        item.unitOfCalculation,
      ]),
    [sortedItems, search],
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="p-3 border-b">
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9"
        />
      </div>
      <ScrollArea className="flex-1 min-h-0 overflow-auto">
        <div className="p-2">
          {filteredItems.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Không tìm thấy sản phẩm
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.has(item._id);
                const isDisabled = item.amountAvailable <= 0;
                return (
                  <button
                    key={item._id}
                    disabled={isDisabled && !isSelected}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 text-primary hover:bg-destructive/10 hover:text-destructive"
                        : isDisabled
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() =>
                      isSelected ? onDeselect(item._id) : onSelect(item)
                    }
                  >
                    {isSelected ? (
                      <X className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <div className="flex-1 text-left truncate">
                      <span className="font-medium">
                        {getWarehouseDisplayName(item)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {item.amountAvailable} {item.unitOfCalculation}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
