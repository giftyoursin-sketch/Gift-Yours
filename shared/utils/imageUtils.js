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

/**
 * Client-side image optimization (resizes and compresses to WebP).
 * This ensures high quality while keeping file size well under 1MB.
 */
export function optimizeImage(file, maxWidth = 1000, maxHeight = 1250, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Draw with white background (in case of transparent PNG)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress as WebP
        const dataUrl = canvas.toDataURL('image/webp', quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
