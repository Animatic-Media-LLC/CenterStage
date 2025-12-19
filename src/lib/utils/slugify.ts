/**
 * Generates a URL-safe slug from a string
 *
 * @param text - The text to convert to a slug
 * @param existingSlugs - Optional array of existing slugs to ensure uniqueness
 * @returns A URL-safe slug
 *
 * @example
 * ```ts
 * slugify('America 2025') // 'america-2025'
 * slugify('Test & Project!') // 'test-project'
 * slugify('test', ['test']) // 'test-1'
 * slugify('test', ['test', 'test-1']) // 'test-2'
 * ```
 */
export function slugify(text: string, existingSlugs: string[] = []): string {
  // Convert to lowercase and remove special characters
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // If slug is empty, use a default
  if (!slug) {
    slug = 'project';
  }

  // Check for uniqueness
  if (!existingSlugs.includes(slug)) {
    return slug;
  }

  // If slug exists, append a number
  let counter = 1;
  let uniqueSlug = `${slug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Validates if a slug is in the correct format
 *
 * @param slug - The slug to validate
 * @returns True if the slug is valid
 *
 * @example
 * ```ts
 * isValidSlug('my-project') // true
 * isValidSlug('My Project') // false
 * isValidSlug('project_123') // false
 * ```
 */
export function isValidSlug(slug: string): boolean {
  // Slug must be lowercase, alphanumeric, and hyphens only
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}
