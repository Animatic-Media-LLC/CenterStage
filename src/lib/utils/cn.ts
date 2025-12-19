import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with proper precedence
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 *
 * @param inputs - Class names to merge
 * @returns Merged class string
 *
 * @example
 * ```ts
 * cn('px-4 py-2', 'bg-blue-500', isActive && 'bg-green-500')
 * // 'px-4 py-2 bg-green-500' (bg-green-500 takes precedence when isActive is true)
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
