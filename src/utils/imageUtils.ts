/**
 * Utility functions for image manipulation and optimization.
 */

/**
 * Compresses an image file and converts it to WebP format.
 *
 * @param file The original image File object.
 * @param maxWidth The maximum width of the resulting image. Defaults to 800.
 * @param quality The quality of the WebP compression (0 to 1). Defaults to 0.8.
 * @returns A promise that resolves to a new File object in WebP format.
 */
export const compressAndConvertToWebP = (
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Check if it's already a webp matching our specifications (optional optimization)
    // For now we recompile to ensure size limits.
    
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // Use canvas to draw and resize the image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas 2D context is not available'));
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas to Blob conversion failed'));
            }

            // Create a new File from the Blob
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + '.webp';
            const optimizedFile = new File([blob], newFileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            resolve(optimizedFile);
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};
