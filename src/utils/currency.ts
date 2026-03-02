export const round2 = (value: number) =>
  Math.round(value * 100) / 100;

// Format number with comma for thousands and dot for decimals
// For money: always show 2 decimal places
const formatNumberWithSeparators = (value: number, decimals: number = 2): string => {
  const rounded = round2(value);
  return rounded.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Format number: show integer if integer, otherwise show decimals rounded to 2 places
const formatNumberSmart = (value: number): string => {
  const rounded = round2(value);
  // Check if rounded value is an integer
  if (Number.isInteger(rounded)) {
    return rounded.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  // Show decimals rounded to 2 places
  return rounded.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

export const formatUSD = (value: number) =>
  `$${formatNumberWithSeparators(value, 2)}`;

export const formatNGN = (value: number) =>
  `₦ ${formatNumberWithSeparators(value, 2)}`;

// Format money value without currency symbol (always 2 decimal places)
export const formatMoneyValue = (value: number): string =>
  formatNumberWithSeparators(value, 2);

export const formatNumber = (value: number) => formatNumberSmart(value);
