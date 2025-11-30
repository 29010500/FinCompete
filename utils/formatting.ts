export const formatCurrency = (value: string | number): string => {
  if (!value) return '-';
  const strVal = String(value);
  // Check if it's already formatted
  if (strVal.includes('$') || strVal.includes('€')) return strVal;
  
  const num = parseFloat(strVal.replace(/[^0-9.-]+/g, ""));
  if (isNaN(num)) return strVal;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const cleanPercentage = (value: string): string => {
  if (!value) return '-';
  if (value.includes('%')) return value;
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return `${num.toFixed(2)}%`;
};