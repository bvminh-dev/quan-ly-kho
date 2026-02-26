export const round2 = (value: number) =>
  Math.round(value * 100) / 100;

export const formatUSD = (value: number) =>
  `$${round2(value).toFixed(2)}`;

export const formatNGN = (value: number) =>
  `₦ ${round2(value).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatNumber = (value: number) =>
  round2(value).toFixed(2);
