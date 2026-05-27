import { BrowserMultiFormatReader } from "@zxing/browser";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

export const BARCODE_PHOTO_MAX_BYTES = 10 * 1024 * 1024;

export function validateBarcodePhoto(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Please upload a PNG, JPG, or WEBP image.";
  }
  if (file.size > BARCODE_PHOTO_MAX_BYTES) {
    return "Image is too large. Please use a file under 10 MB.";
  }
  return null;
}

export async function scanBarcodeFromImage(file: File): Promise<string> {
  const reader = new BrowserMultiFormatReader();
  const url = URL.createObjectURL(file);

  try {
    const result = await reader.decodeFromImageUrl(url);
    const text = result.getText()?.trim();
    if (!text) {
      throw new Error("No barcode found in image.");
    }
    return text;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function readImageAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read image file."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}
