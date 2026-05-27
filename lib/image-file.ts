const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

/** Windows and some browsers leave `file.type` empty for valid images. */
export function isAcceptedImageFile(file: File): boolean {
  if (file.type && IMAGE_MIME_TYPES.has(file.type.toLowerCase())) {
    return true;
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  return Boolean(ext && IMAGE_EXTENSIONS.has(ext));
}

export function imageFileTypeHint(): string {
  return "PNG, JPG, or WEBP";
}
