export const round2 = (value: number) =>
  Math.round(value * 100) / 100;

// Format number with comma for thousands and dot for decimals
const formatNumberWithSeparators = (value: number, decimals: number = 2): string => {
  const rounded = round2(value);
  return rounded.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatUSD = (value: number) =>
  `$${formatNumberWithSeparators(value, 2)}`;

export const formatNGN = (value: number) =>
  `₦ ${formatNumberWithSeparators(value, 2)}`;

export const formatNumber = (value: number) =>
  formatNumberWithSeparators(value, 2);
