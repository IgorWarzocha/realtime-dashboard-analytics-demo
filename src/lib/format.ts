export const formatNumber = (value: number | undefined): string => {
  if (value === undefined) return "...";
  return value.toLocaleString();
};

export const formatPercent = (value: number | undefined): string => {
  if (value === undefined) return "...";
  return `${(value * 100).toFixed(2)}%`;
};

export const formatCurrency = (value: number | undefined): string => {
  if (value === undefined) return "...";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};
