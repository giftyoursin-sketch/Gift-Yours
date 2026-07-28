/**
 * Shared utility functions for images.
 */

/**
 * Converts a string into a URL-friendly slug.
 * Example: "Photo Frames" -> "photo-frames"
 */
export function toSlug(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');    // Replace multiple - with single -
}

/**
 * Generates the local dynamic image path based on category and product name.
 * The folder structure is: /products/[category-slug]/[product-slug]/[imageName]
 * 
 * @param {string} category The product category (e.g., "Frames")
 * @param {string} productName The product name (e.g., "4x6 Frame")
 * @param {string} imageName The image file name (e.g., "cover.webp", "gallery-1.webp")
 * @returns {string} The public image path.
 */
export function getProductImagePath(category, productName, imageName = 'cover.jpg') {
  if (!category || !productName) {
    return '/placeholder-image.webp'; // Fallback
  }
  
  const categorySlug = toSlug(category);
  const productSlug = toSlug(productName);
  
  return `/products/${categorySlug}/${productSlug}/${imageName}`;
}

/**
 * A fallback image URL in case the dynamic image fails to load.
 */
export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop';
