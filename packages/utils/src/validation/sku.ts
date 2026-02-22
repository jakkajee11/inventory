/**
 * SKU (Stock Keeping Unit) validation utilities
 */

/**
 * SKU validation result
 */
export interface SkuValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * SKU format configuration
 */
export interface SkuFormatConfig {
  prefix?: string;
  separator?: string;
  length?: { min: number; max: number };
  allowLetters?: boolean;
  allowNumbers?: boolean;
  allowSpecialChars?: boolean;
  caseSensitive?: boolean;
}

/**
 * Default SKU format configuration
 */
const DEFAULT_SKU_CONFIG: SkuFormatConfig = {
  separator: '-',
  length: { min: 3, max: 50 },
  allowLetters: true,
  allowNumbers: true,
  allowSpecialChars: false,
  caseSensitive: false,
};

/**
 * Validate SKU format
 * @param sku - SKU to validate
 * @param config - Validation configuration
 * @returns Validation result
 */
export function validateSku(
  sku: string,
  config: SkuFormatConfig = DEFAULT_SKU_CONFIG
): SkuValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const cfg = { ...DEFAULT_SKU_CONFIG, ...config };
  
  // Check if SKU is provided
  if (!sku || typeof sku !== 'string') {
    errors.push('SKU is required');
    return { isValid: false, errors, warnings };
  }
  
  const trimmedSku = sku.trim();
  
  // Check length
  if (cfg.length) {
    if (trimmedSku.length < cfg.length.min) {
      errors.push(`SKU must be at least ${cfg.length.min} characters long`);
    }
    if (trimmedSku.length > cfg.length.max) {
      errors.push(`SKU must not exceed ${cfg.length.max} characters`);
    }
  }
  
  // Check for whitespace
  if (trimmedSku !== sku) {
    warnings.push('SKU contains leading or trailing whitespace');
  }
  
  if (sku.includes(' ')) {
    errors.push('SKU cannot contain spaces');
  }
  
  // Check allowed characters
  let pattern = '^[';
  if (cfg.allowLetters) pattern += 'a-zA-Z';
  if (cfg.allowNumbers) pattern += '0-9';
  if (cfg.allowSpecialChars) pattern += cfg.separator ? `\\${cfg.separator}` : '';
  if (cfg.allowSpecialChars) pattern += '_-';
  pattern += ']+$';
  
  const regex = new RegExp(pattern);
  if (!regex.test(trimmedSku)) {
    errors.push('SKU contains invalid characters');
  }
  
  // Check prefix if specified
  if (cfg.prefix && !trimmedSku.startsWith(cfg.prefix)) {
    warnings.push(`SKU should start with prefix "${cfg.prefix}"`);
  }
  
  // Check for common issues
  if (/^[0-9]+$/.test(trimmedSku)) {
    warnings.push('SKU contains only numbers; consider adding letters for better identification');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Normalize SKU to standard format
 * @param sku - SKU to normalize
 * @param config - Normalization configuration
 * @returns Normalized SKU
 */
export function normalizeSku(
  sku: string,
  config: SkuFormatConfig = DEFAULT_SKU_CONFIG
): string {
  const cfg = { ...DEFAULT_SKU_CONFIG, ...config };
  
  let normalized = sku.trim();
  
  // Convert case if not case sensitive
  if (!cfg.caseSensitive) {
    normalized = normalized.toUpperCase();
  }
  
  // Replace spaces with separator if configured
  if (cfg.separator) {
    normalized = normalized.replace(/\s+/g, cfg.separator);
  }
  
  // Remove consecutive separators
  if (cfg.separator) {
    const escapedSep = cfg.separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    normalized = normalized.replace(new RegExp(`${escapedSep}+`, 'g'), cfg.separator);
  }
  
  // Remove leading/trailing separators
  if (cfg.separator) {
    normalized = normalized.replace(new RegExp(`^\\${cfg.separator}+|\\${cfg.separator}+$`, 'g'), '');
  }
  
  return normalized;
}

/**
 * Generate SKU from product information
 * @param options - SKU generation options
 * @returns Generated SKU
 */
export function generateSku(options: {
  categoryCode?: string;
  productName: string;
  variant?: string;
  separator?: string;
}): string {
  const { categoryCode, productName, variant, separator = '-' } = options;
  
  const parts: string[] = [];
  
  // Add category code
  if (categoryCode) {
    parts.push(categoryCode.toUpperCase().replace(/[^A-Z0-9]/g, ''));
  }
  
  // Add product name abbreviation
  const nameAbbr = productName
    .split(/[\s-]+/)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 3);
  parts.push(nameAbbr || 'PRD');
  
  // Add variant if provided
  if (variant) {
    parts.push(variant.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4));
  }
  
  // Add unique suffix (timestamp-based)
  const suffix = Date.now().toString(36).toUpperCase().slice(-4);
  parts.push(suffix);
  
  return parts.join(separator);
}

/**
 * Check if two SKUs are equivalent (accounting for case sensitivity)
 * @param sku1 - First SKU
 * @param sku2 - Second SKU
 * @param caseSensitive - Whether comparison is case sensitive
 * @returns True if SKUs are equivalent
 */
export function skuEquals(sku1: string, sku2: string, caseSensitive: boolean = false): boolean {
  if (caseSensitive) {
    return sku1 === sku2;
  }
  return sku1.toUpperCase() === sku2.toUpperCase();
}

/**
 * Extract information from SKU
 * @param sku - SKU to parse
 * @param separator - Separator character
 * @returns Parsed SKU components
 */
export function parseSku(sku: string, separator: string = '-'): {
  parts: string[];
  categoryCode?: string;
  productCode?: string;
  variantCode?: string;
} {
  const parts = sku.split(separator);
  
  return {
    parts,
    categoryCode: parts.length > 0 ? parts[0] : undefined,
    productCode: parts.length > 1 ? parts[1] : undefined,
    variantCode: parts.length > 2 ? parts[2] : undefined,
  };
}

/**
 * Check if SKU matches pattern
 * @param sku - SKU to check
 * @param pattern - Pattern to match (supports * wildcard)
 * @returns True if SKU matches pattern
 */
export function skuMatchesPattern(sku: string, pattern: string): boolean {
  // Convert wildcard pattern to regex
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  
  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(sku);
}

/**
 * SKU regex patterns for common formats
 */
export const SKU_PATTERNS = {
  // Standard format: ABC-123-XYZ
  STANDARD: /^[A-Z]{2,4}-[A-Z0-9]{2,6}-[A-Z0-9]{2,4}$/i,
  
  // Numeric format: 12345
  NUMERIC: /^[0-9]{4,10}$/,
  
  // Alphanumeric format: ABC123XYZ
  ALPHANUMERIC: /^[A-Z0-9]{4,20}$/i,
  
  // Category-based: CAT-SUB-PROD-001
  CATEGORY_BASED: /^[A-Z]{2,3}-[A-Z]{2,3}-[A-Z0-9]{2,4}-[0-9]{3,4}$/i,
  
  // Barcode format (EAN-13)
  EAN13: /^[0-9]{13}$/,
  
  // UPC format
  UPC: /^[0-9]{12}$/,
} as const;

/**
 * Validate SKU against common patterns
 * @param sku - SKU to validate
 * @returns Object with pattern match results
 */
export function checkSkuPatterns(sku: string): Record<string, boolean> {
  return {
    isStandard: SKU_PATTERNS.STANDARD.test(sku),
    isNumeric: SKU_PATTERNS.NUMERIC.test(sku),
    isAlphanumeric: SKU_PATTERNS.ALPHANUMERIC.test(sku),
    isCategoryBased: SKU_PATTERNS.CATEGORY_BASED.test(sku),
    isEan13: SKU_PATTERNS.EAN13.test(sku),
    isUpc: SKU_PATTERNS.UPC.test(sku),
  };
}
