
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

/**
 * Validates if a bid amount is within the allowed range
 * @param amount The bid amount to validate
 * @returns Boolean indicating if the amount is valid
 */
export function isValidBidAmount(amount: number): boolean {
  return amount > 0 && amount <= MAX_BID_AMOUNT;
}

/**
 * Formats a date with time remaining in a human-readable format
 * @param date The date to format
 * @returns Formatted string showing days, hours or minutes remaining
 */
export function formatTimeRemaining(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff <= 0) return "Finalizada";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} día${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hora${hours > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
  }
}
