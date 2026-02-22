import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper precedence.
 * Uses clsx for conditional classes and tailwind-merge to handle conflicts.
 * 
 * @param inputs - Class names or conditional class objects
 * @returns Merged class string
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // Returns 'py-1 px-4' (px-4 overrides px-2)
 * cn('text-red-500', isLarge && 'text-lg') // Conditionally applies text-lg
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
