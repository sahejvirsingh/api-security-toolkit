export interface FileValidationResult {
  valid: boolean;
  error?: string;
  metadata?: {
    actualType: string;
    size: number;
    isImage: boolean;
    isPDF: boolean;
  };
}

const MAGIC_BYTES: Record<string, string[]> = {
  "image/jpeg": ["ffd8ffe0", "ffd8ffe1", "ffd8ffe2", "ffd8ffe3", "ffd8ffe8"],
  "image/png": ["89504e47"],
  "image/gif": ["47494638"],
  "application/pdf": ["25504446"]
};

export function getActualFileType(magic: string): string {
  for (const [mime, signatures] of Object.entries(MAGIC_BYTES)) {
    if (signatures.some((sig) => magic.startsWith(sig))) {
      return mime;
    }
  }
  return "application/octet-stream";
}

export function validateFileSignature(magicBytes: string, expectedMime: string): boolean {
  const actualType = getActualFileType(magicBytes);
  if (actualType === "application/octet-stream" && !MAGIC_BYTES[expectedMime]) {
    return true; // Unknown/unregistered type
  }
  return actualType === expectedMime;
}

export function validateFileUpload(
  buffer: ArrayBuffer,
  fileName: string,
  mimeType: string,
  maxSize: number = 5 * 1024 * 1024
): FileValidationResult {
  const size = buffer.byteLength;
  if (size > maxSize) {
    return { valid: false, error: "File exceeds maximum allowed size" };
  }

  const uint8Array = new Uint8Array(buffer);
  const magicBytes = Array.from(uint8Array.slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Only validate signature for types we know
  if (MAGIC_BYTES[mimeType] && !validateFileSignature(magicBytes, mimeType)) {
    return { valid: false, error: "File signature does not match declared MIME type" };
  }

  return {
    valid: true,
    metadata: {
      actualType: getActualFileType(magicBytes) || mimeType,
      size,
      isImage: mimeType.startsWith("image/"),
      isPDF: mimeType === "application/pdf"
    }
  };
}

export function generateSecureFilename(originalName: string): string {
  const ext = originalName.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "tmp";
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${Date.now()}-${randomStr}.${ext}`;
}
