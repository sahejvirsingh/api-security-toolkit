import { describe, it, expect } from "vitest";
import { sanitizeHtml, sanitizeText } from "../src/xss";

describe("XSS Protection", () => {
  it("should sanitize malicious HTML", () => {
    const dirty = "<p>Safe</p><script>alert(\"xss\")</script><img src=\"x\" onerror=\"alert(1)\">";
    const clean = sanitizeHtml(dirty);
    expect(clean).toBe("<p>Safe</p>");
  });

  it("should sanitize plain text", () => {
    const input = "Hello <script> javascript:alert(1) onmouseover=test data:base64";
    const clean = sanitizeText(input);
    expect(clean).toBe("Hello  alert(1) =test base64");
  });
});
