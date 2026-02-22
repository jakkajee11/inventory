/**
 * Date formatting utilities
 */

/**
 * Date format options
 */
export type DateFormat = 
  | 'short'        // 01/01/2024
  | 'medium'       // 01 Jan 2024
  | 'long'         // 01 January 2024
  | 'iso'          // 2024-01-01
  | 'thai'         // 01/01/2567 (Thai Buddhist year)
  | 'thaiFull'     // 1 มกราคม 2567
  | 'dateTime'     // 01/01/2024 10:30
  | 'dateTimeFull' // 01/01/2024 10:30:00
  | 'time'         // 10:30
  | 'timeFull';    // 10:30:00

/**
 * Thai month names
 */
const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

/**
 * Format date according to specified format
 * @param date - Date to format
 * @param format - Format type
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: DateFormat = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  const thaiYear = year + 543;
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  switch (format) {
    case 'short':
      return `${pad(day)}/${pad(month + 1)}/${year}`;
      
    case 'medium':
      const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                               'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${pad(day)} ${monthNamesShort[month]} ${year}`;
      
    case 'long':
      const monthNamesFull = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
      return `${day} ${monthNamesFull[month]} ${year}`;
      
    case 'iso':
      return d.toISOString().split('T')[0];
      
    case 'thai':
      return `${pad(day)}/${pad(month + 1)}/${thaiYear}`;
      
    case 'thaiFull':
      return `${day} ${THAI_MONTHS_FULL[month]} ${thaiYear}`;
      
    case 'dateTime':
      return `${pad(day)}/${pad(month + 1)}/${year} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      
    case 'dateTimeFull':
      return `${pad(day)}/${pad(month + 1)}/${year} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      
    case 'time':
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      
    case 'timeFull':
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      
    default:
      return d.toISOString();
  }
}

/**
 * Format date for display in Thai locale
 * @param date - Date to format
 * @param includeTime - Whether to include time
 * @returns Formatted Thai date string
 */
export function formatThaiDate(date: Date | string, includeTime: boolean = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const day = d.getDate();
  const month = d.getMonth();
  const thaiYear = d.getFullYear() + 543;
  
  let result = `${day} ${THAI_MONTHS_FULL[month]} ${thaiYear}`;
  
  if (includeTime) {
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    result += ` ${hours}:${minutes} น.`;
  }
  
  return result;
}

/**
 * Format date for document header
 * @param date - Date to format
 * @returns Formatted document date string
 */
export function formatDocumentDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const day = d.getDate();
  const month = d.getMonth();
  const thaiYear = d.getFullYear() + 543;
  
  return `วันที่ ${day} ${THAI_MONTHS_FULL[month]} พ.ศ. ${thaiYear}`;
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 * @param date - Date to compare
 * @param locale - Locale for output ('en' or 'th')
 * @returns Relative time string
 */
export function getRelativeTime(date: Date | string, locale: 'en' | 'th' = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const absDiff = Math.abs(diff);
  
  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  const isPast = diff < 0;
  
  if (locale === 'th') {
    if (years > 0) return isPast ? `${years} ปีที่แล้ว` : `อีก ${years} ปี`;
    if (months > 0) return isPast ? `${months} เดือนที่แล้ว` : `อีก ${months} เดือน`;
    if (days > 0) return isPast ? `${days} วันที่แล้ว` : `อีก ${days} วัน`;
    if (hours > 0) return isPast ? `${hours} ชั่วโมงที่แล้ว` : `อีก ${hours} ชั่วโมง`;
    if (minutes > 0) return isPast ? `${minutes} นาทีที่แล้ว` : `อีก ${minutes} นาที`;
    return isPast ? 'เมื่อสักครู่' : 'อีกสักครู่';
  }
  
  if (years > 0) return isPast ? `${years} year${years > 1 ? 's' : ''} ago` : `in ${years} year${years > 1 ? 's' : ''}`;
  if (months > 0) return isPast ? `${months} month${months > 1 ? 's' : ''} ago` : `in ${months} month${months > 1 ? 's' : ''}`;
  if (days > 0) return isPast ? `${days} day${days > 1 ? 's' : ''} ago` : `in ${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return isPast ? `${hours} hour${hours > 1 ? 's' : ''} ago` : `in ${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return isPast ? `${minutes} minute${minutes > 1 ? 's' : ''} ago` : `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  return isPast ? 'just now' : 'soon';
}

/**
 * Get start of day
 * @param date - Input date
 * @returns Date set to start of day (00:00:00)
 */
export function startOfDay(date: Date | string = new Date()): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day
 * @param date - Input date
 * @returns Date set to end of day (23:59:59.999)
 */
export function endOfDay(date: Date | string = new Date()): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get start of month
 * @param date - Input date
 * @returns Date set to first day of month
 */
export function startOfMonth(date: Date | string = new Date()): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of month
 * @param date - Input date
 * @returns Date set to last day of month
 */
export function endOfMonth(date: Date | string = new Date()): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Add days to date
 * @param date - Input date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 */
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Add months to date
 * @param date - Input date
 * @param months - Number of months to add (can be negative)
 * @returns New date with months added
 */
export function addMonths(date: Date | string, months: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Check if date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Check if date is in the past
 * @param date - Date to check
 * @returns True if date is in the past
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < Date.now();
}

/**
 * Check if date is in the future
 * @param date - Date to check
 * @returns True if date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() > Date.now();
}

/**
 * Parse date string in various formats
 * @param dateStr - Date string to parse
 * @returns Parsed Date object or null if invalid
 */
export function parseDate(dateStr: string): Date | null {
  // Try ISO format first
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }
  
  // Try DD/MM/YYYY format
  const dmyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const dmyMatch = dateStr.match(dmyRegex);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return null;
}

/**
 * Get current timestamp in ISO format
 * @returns Current timestamp string
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Constants for date formatting
 */
export const DATE_CONSTANTS = {
  THAI_BUDDHIST_YEAR_OFFSET: 543,
  THAI_MONTHS_SHORT: THAI_MONTHS_SHORT,
  THAI_MONTHS_FULL: THAI_MONTHS_FULL,
} as const;
