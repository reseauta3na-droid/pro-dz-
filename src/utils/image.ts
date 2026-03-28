/**
 * Resizes and compresses an image to ensure it doesn't exceed Firestore limits.
 * @param dataUrl The original image as a data URL.
 * @param maxWidth The maximum width for the resized image.
 * @param maxHeight The maximum height for the resized image.
 * @param quality The quality of the compressed image (0 to 1).
 * @returns A promise that resolves to the resized and compressed data URL.
 */
export const compressImage = (
  dataUrl: string,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      // Use image/jpeg for better compression than png
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = (err) => reject(err);
  });
};
