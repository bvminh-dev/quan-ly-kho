"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vi } from "react-day-picker/locale";
import { format } from "date-fns";
import { vi as viFns } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { ReportPeriod } from "@/types/api";

const pad2 = (n: number) => String(n).padStart(2, "0");

const MONTHS_VI = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 31 }, (_, i) => CURRENT_YEAR - 15 + i);

interface ReportDatePickerProps {
  period: ReportPeriod;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ReportDatePicker({
  period,
  value,
  onChange,
  placeholder,
  disabled,
}: ReportDatePickerProps) {
  if (period === "year") {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const next = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
          onChange(next);
        }}
        placeholder={placeholder}
        disabled={disabled}
        min={2000}
        max={3000}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
    );
  }

  if (period === "month") {
    const [y, m] = value.split("-");
    const monthVal = m ? `${Number(m)}` : "";
    const yearVal = y || String(CURRENT_YEAR);

    return (
      <div className="flex gap-2">
        <Select
          value={monthVal}
          onValueChange={(m) => {
            const month = m ? pad2(Number(m)) : "01";
            onChange(`${yearVal}-${month}`);
          }}
          disabled={disabled}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Chọn tháng" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS_VI.map((label, i) => (
              <SelectItem key={i} value={String(i + 1)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={yearVal}
          onValueChange={(y) => {
            const month = monthVal ? pad2(Number(monthVal)) : "01";
            onChange(`${y}-${month}`);
          }}
          disabled={disabled}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Năm" />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  const dateObj = value
    ? (() => {
        const [y, m, d] = value.split("-").map(Number);
        if (y && m && d) return new Date(y, m - 1, d);
        return undefined;
      })()
    : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateObj ? (
            format(dateObj, "dd/MM/yyyy", { locale: viFns })
          ) : (
            <span className="text-muted-foreground">{placeholder ?? "Chọn ngày"}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={vi}
          selected={dateObj}
          onSelect={(d) => {
            if (d) {
              const y = d.getFullYear();
              const m = pad2(d.getMonth() + 1);
              const day = pad2(d.getDate());
              onChange(`${y}-${m}-${day}`);
            }
          }}
          captionLayout="dropdown"
          defaultMonth={dateObj}
        />
      </PopoverContent>
    </Popover>
  );
}
