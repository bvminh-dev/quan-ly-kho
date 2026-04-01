"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { quickSearchFilter, normalizeText } from "@/utils/search";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useMemo, useRef, useState } from "react";

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ _id: string; name: string }>;
  placeholder: string;
  isLoading?: boolean;
  disabled?: boolean;
  onAddNew?: (searchText: string) => void;
  className?: string;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  isLoading = false,
  disabled = false,
  onAddNew,
  className,
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
    <div className={cn("flex gap-2", className)}>
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
              className="h-9 pr-8"
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
          <div className="py-1 max-h-[200px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Không tìm thấy kết quả
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
          className="h-9 w-9 shrink-0"
          onClick={handleAddNew}
          title={`Thêm mới "${inputValue}"`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
