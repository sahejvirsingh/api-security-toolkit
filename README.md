# API Security Toolkit

Framework-agnostic security helpers for Node.js / HTTP APIs. Includes rate limiting (memory and Redis), XSS sanitization, and safe file uploads.

## Installation

```bash
npm install api-security-toolkit
```

## Features

- **Rate Limiting:** Sliding-window rate limiter powered by `@upstash/ratelimit` for Redis, or a lightweight fixed-window in-memory fallback.
- **XSS Protection:** Wrapper around `sanitize-html` to safely render user content while removing malicious payloads.
- **Secure File Uploads:** Validates file magic bytes (signatures) against declared MIME types to prevent disguise attacks (e.g., an EXE disguised as a PNG).

## Quick Start

```typescript
import { MemoryStore, sanitizeHtml, validateFileUpload } from "api-security-toolkit";

// 1. Rate Limiting
const rateLimiter = new MemoryStore();
const result = await rateLimiter.limit("user_123", 10, 60_000); // 10 req / minute
if (!result.allowed) {
  throw new Error("Rate limit exceeded");
}

// 2. XSS Sanitization
const cleanHtml = sanitizeHtml(`<p>Safe</p><script>alert("hacked")</script>`);
// Result: "<p>Safe</p>"

// 3. File Upload Validation
const buffer = await req.file.arrayBuffer(); // Get buffer from your framework
const uploadResult = validateFileUpload(buffer, "avatar.png", "image/png");
if (!uploadResult.valid) {
  throw new Error(uploadResult.error);
}
```

## License
MIT

