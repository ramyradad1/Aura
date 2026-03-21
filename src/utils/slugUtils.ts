/**
 * Utility functions for SEO-friendly URLs
 */

// Generate a slug from a product name and id
export const generateProductSlug = (name: string, id: string): string => {
  if (!name) return id;
  const slug = name
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '') // Keep alphanumeric, Arabic characters, spaces, and hyphens
    .replace(/\s+/g, '-')                  // Replace one or more spaces with a single hyphen
    .replace(/-+/g, '-')                   // Replace consecutive hyphens with a single hyphen
    .replace(/^-+|-+$/g, '')               // Trim hyphens from start and end
    .trim();
  
  return slug ? `${slug}--${id}` : id;
};

// Extract the id from a slug (e.g., "velvet-crimson--123" -> "123")
export const extractIdFromSlug = (slug: string | undefined): string => {
  if (!slug) return '';
  const parts = slug.split('--');
  return parts.length > 1 ? parts[parts.length - 1] : slug;
};
