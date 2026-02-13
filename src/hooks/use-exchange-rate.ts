"use client";

import { useQuery } from "@tanstack/react-query";

const FALLBACK_RATE = 1550;

interface ExchangeRateResponse {
  rates: Record<string, number>;
}

async function fetchUsdToNgn(): Promise<number> {
  const res = await fetch(
    "https://open.er-api.com/v6/latest/USD"
  );
  if (!res.ok) throw new Error("Failed to fetch exchange rate");
  const data: ExchangeRateResponse = await res.json();
  return data.rates?.NGN ?? FALLBACK_RATE;
}

export function useExchangeRate() {
  return useQuery({
    queryKey: ["exchange-rate", "USD", "NGN"],
    queryFn: fetchUsdToNgn,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    retry: 2,
    placeholderData: FALLBACK_RATE,
  });
}
