"use client";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getWarehouseDisplayName, sortWarehouseItems } from "@/features/warehouse/utils/sort-warehouse";
import type { WarehouseItem } from "@/types/api";
import { ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

interface WarehousePickerProps {
  items: WarehouseItem[];
  onSelect: (item: WarehouseItem) => void;
  onDeselect: (warehouseId: string) => void;
  selectedIds: Set<string>;
}

interface ColorGroup {
  color: string;
  items: WarehouseItem[];
}

export function WarehousePicker({ items, onSelect, onDeselect, selectedIds }: WarehousePickerProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => sortWarehouseItems(items), [items]);

  const groups = useMemo(() => {
    const map = new Map<string, WarehouseItem[]>();
    for (const item of sorted) {
      const key = item.color;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    const result: ColorGroup[] = [];
    for (const [color, groupItems] of map) {
      result.push({ color, items: groupItems });
    }
    return result;
  }, [sorted]);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((i) =>
          getWarehouseDisplayName(i).toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, search]);

  const toggleGroup = (color: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(color)) next.delete(color);
      else next.add(color);
      return next;
    });
  };

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
        <div className="p-2 space-y-1">
          {filteredGroups.map((group) => (
            <div key={group.color}>
              <button
                className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => toggleGroup(group.color)}
              >
                {expanded.has(group.color) ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <span>{group.color}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {group.items.length}
                </span>
              </button>

              {expanded.has(group.color) && (
                <div className="ml-4 space-y-0.5">
                  {group.items.map((item) => {
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
                        onClick={() => isSelected ? onDeselect(item._id) : onSelect(item)}
                      >
                        {isSelected ? (
                          <X className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <Plus className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <div className="flex-1 text-left truncate">
                          <span className="font-medium">
                            {item.item} {item.inches}&quot; - {item.quality} {item.style}
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
          ))}

          {filteredGroups.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Không tìm thấy sản phẩm
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
