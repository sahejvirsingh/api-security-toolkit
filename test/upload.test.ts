import { describe, it, expect } from "vitest";
import { validateFileUpload, generateSecureFilename } from "../src/upload";

describe("File Uploads", () => {
  it("should validate magic bytes of a PDF", () => {
    // PDF Magic Bytes: %PDF-
    const buffer = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x35]).buffer;
    const result = validateFileUpload(buffer, "test.pdf", "application/pdf");
    expect(result.valid).toBe(true);
    expect(result.metadata?.isPDF).toBe(true);
  });

  it("should reject mismatched magic bytes", () => {
    // Fake PNG (actually text)
    const buffer = new Uint8Array([0x68, 0x65, 0x6C, 0x6C, 0x6F]).buffer;
    const result = validateFileUpload(buffer, "fake.png", "image/png");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("signature does not match");
  });

  it("should generate secure filenames", () => {
    const name = generateSecureFilename("my_file.image.png");
    expect(name).not.toContain("my_file");
    expect(name).toMatch(/^\d+-[a-z0-9]+\.png$/);
  });
});
