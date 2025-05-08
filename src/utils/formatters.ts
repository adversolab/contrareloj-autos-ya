
/**
 * Formats a number as currency with proper abbreviation for large numbers
 * @param value The number to format
 * @returns Formatted string
 */
export function formatCurrency(value: number): string {
  if (isNaN(value)) return "$0";
  
  // Handle very large numbers by abbreviating them
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  
  // Normal formatting for smaller numbers
  return `$${value.toLocaleString('es-CL')}`;
}

/**
 * Formats input text as currency for display
 * @param value String value from input
 * @returns Formatted string with separators
 */
export function formatInputCurrency(value: string): string {
  // Remove non-numeric characters
  const numericValue = value.replace(/\D/g, '');
  
  // If empty, return empty string
  if (!numericValue) return '';
  
  // Format with thousand separators
  return Number(numericValue).toLocaleString('es-CL');
}

/**
 * Extracts the numeric value from a formatted currency string
 * @param value Formatted currency string
 * @returns Numeric value
 */
export function parseCurrencyValue(value: string): number {
  // Remove all non-numeric characters
  const numericValue = value.replace(/\D/g, '');
  
  // Parse to number or return 0 if invalid
  return numericValue ? Number(numericValue) : 0;
}

// Maximum allowed bid in CLP
export const MAX_BID_AMOUNT = 1_000_000_000; // 1 billion CLP
