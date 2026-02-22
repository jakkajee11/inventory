/**
 * Currency formatting utilities for Thai Baht (THB)
 */

/**
 * Format number as Thai Baht currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatThaiBaht(
  amount: number,
  options: {
    includeSymbol?: boolean;
    decimalPlaces?: number;
    useThaiSymbol?: boolean;
  } = {}
): string {
  const {
    includeSymbol = true,
    decimalPlaces = 2,
    useThaiSymbol = false,
  } = options;

  // Format the number with thousand separators
  const formatted = amount.toLocaleString('th-TH', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  if (!includeSymbol) {
    return formatted;
  }

  // Use Thai symbol (บาท) or international symbol (฿)
  const symbol = useThaiSymbol ? 'บาท' : '฿';
  
  // For Thai format, symbol goes after the number
  return useThaiSymbol ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}

/**
 * Format number as compact Thai Baht (e.g., 1.5M)
 * @param amount - The amount to format
 * @returns Compact formatted string
 */
export function formatCompactThaiBaht(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 1e9) {
    return `${sign}฿${(absAmount / 1e9).toFixed(1)}B`;
  }
  if (absAmount >= 1e6) {
    return `${sign}฿${(absAmount / 1e6).toFixed(1)}M`;
  }
  if (absAmount >= 1e3) {
    return `${sign}฿${(absAmount / 1e3).toFixed(1)}K`;
  }
  
  return `${sign}฿${absAmount.toFixed(2)}`;
}

/**
 * Parse Thai Baht string to number
 * @param value - The string to parse
 * @returns Parsed number or NaN
 */
export function parseThaiBaht(value: string): number {
  // Remove currency symbols and whitespace
  const cleaned = value
    .replace(/[฿บาท,]/g, '')
    .replace(/\s/g, '')
    .trim();
  
  return parseFloat(cleaned);
}

/**
 * Format number with thousand separators (no currency symbol)
 * @param value - The number to format
 * @param decimalPlaces - Number of decimal places
 * @returns Formatted number string
 */
export function formatNumber(value: number, decimalPlaces: number = 2): string {
  return value.toLocaleString('th-TH', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

/**
 * Convert number to Thai words (for check printing, etc.)
 * @param amount - The amount to convert
 * @returns Amount in Thai words
 */
export function numberToThaiWords(amount: number): string {
  if (amount === 0) return 'ศูนย์บาทถ้วน';

  const digits = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const convertGroup = (num: number): string => {
    if (num === 0) return '';
    
    let result = '';
    let position = 0;
    
    while (num > 0) {
      const digit = num % 10;
      
      if (digit !== 0) {
        let digitWord = digits[digit];
        
        // Special cases for Thai
        if (position === 0 && digit === 1) {
          digitWord = 'เอ็ด';
        } else if (position === 1 && digit === 1) {
          digitWord = ''; // "สิบ" already implies "one ten"
        } else if (position === 1 && digit === 2) {
          digitWord = 'ยี่';
        }
        
        result = digitWord + units[position] + result;
      }
      
      num = Math.floor(num / 10);
      position++;
    }
    
    return result;
  };

  const isNegative = amount < 0;
  amount = Math.abs(amount);
  
  const baht = Math.floor(amount);
  const satang = Math.round((amount - baht) * 100);
  
  let result = '';
  
  if (baht > 0) {
    const millionGroups: number[] = [];
    let tempBaht = baht;
    
    while (tempBaht > 0) {
      millionGroups.push(tempBaht % 1000000);
      tempBaht = Math.floor(tempBaht / 1000000);
    }
    
    for (let i = millionGroups.length - 1; i >= 0; i--) {
      result += convertGroup(millionGroups[i]);
      if (i > 0) result += 'ล้าน';
    }
    
    result += 'บาท';
  }
  
  if (satang > 0) {
    result += convertGroup(satang) + 'สตางค์';
  } else {
    result += 'ถ้วน';
  }
  
  return (isNegative ? 'ลบ' : '') + result;
}

/**
 * Calculate percentage of amount
 * @param amount - Base amount
 * @param percentage - Percentage value
 * @returns Calculated percentage amount
 */
export function calculatePercentage(amount: number, percentage: number): number {
  return (amount * percentage) / 100;
}

/**
 * Round to specified decimal places
 * @param value - Value to round
 * @param decimals - Number of decimal places
 * @returns Rounded value
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Constants for Thai Baht
 */
export const THAI_BAHT = {
  CURRENCY_CODE: 'THB',
  SYMBOL: '฿',
  THAI_SYMBOL: 'บาท',
  DECIMAL_PLACES: 2,
  THOUSAND_SEPARATOR: ',',
  DECIMAL_SEPARATOR: '.',
} as const;
