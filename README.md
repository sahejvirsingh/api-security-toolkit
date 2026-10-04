# 🛡️ API Security Toolkit

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)]()

> Framework-agnostic, production-grade security utilities for Node.js & Edge HTTP APIs: dual-tier sliding-window rate limiting, multi-layer XSS sanitization, and cryptographic magic-byte file signature validation.

---

## 🎯 Executive Summary & Problem Space

Modern web APIs are constantly vulnerable to automated scraping, Denial of Service (DoS), Cross-Site Scripting (XSS), and malicious file uploads:
1. **Fixed-Window Rate Limit Edge Spikes**: Traditional in-memory fixed-window counters allow 2x traffic bursts across boundary resets (e.g., 100 requests at second 59, and another 100 at second 01).
2. **MIME-Type Disguise Attacks**: Attackers rename malicious binaries (e.g. .exe, .sh, .php) to innocent extensions like vatar.png or document.pdf. Naive servers trusting eq.headers['content-type'] or file extensions are easily compromised.
3. **Reflected & Stored XSS**: Rendering user text or raw HTML without sanitizing script tags, inline onload handlers, or javascript: URI schemas leads to session hijacking and account takeovers.

**API Security Toolkit** provides a defensive security layer that enforces sliding-window rate limiting (via Redis or memory), sanitizes user strings against injection, and cryptographically inspects **file magic bytes** before files ever touch storage.

---

## ⚡ Core Defense Features

- **Sliding-Window Rate Limiter**: 
  - Distributed Redis implementation via @upstash/ratelimit (ideal for Serverless / Edge functions).
  - High-performance MemoryStore fallback for single-instance Node.js microservices.
- **Magic-Byte Signature Verification**: 
  - Reads the first 8 raw binary bytes of an ArrayBuffer to check against canonical magic number signatures (JPEG, PNG, GIF, PDF).
  - Immediately rejects file extension spoofing regardless of client-declared headers.
- **Entropy-Based Secure Filenames**:
  - Replaces user-provided filenames with cryptographically unpredictable unique names ({timestamp}-{hash}.{ext}) to defend against Directory Traversal attacks (../../etc/passwd).
- **Multi-Layer XSS Defense**:
  - sanitizeText: Aggressively strips <>, javascript:, data:, bscript:, and inline DOM event listeners (onerror=, onclick=).
  - sanitizeHtml: Allows safe markup (<b>, <em>, <a>, <p>) while removing executable vectors.

---

## 🔒 Magic Byte Detection Matrix

| Declared MIME Type | Expected Magic Signature (Hex) | Attack Vector Blocked |
| :--- | :--- | :--- |
| image/png | 89 50 4E 47 (.PNG) | Executables disguised as PNGs |
| image/jpeg | FF D8 FF E0 / E1 / E2 (ÿØÿà) | Malicious scripts saved as JPEGs |
| image/gif | 47 49 46 38 (GIF8) | Polyglot PHP/GIF exploits |
| pplication/pdf | 25 50 44 46 (%PDF) | Fake PDFs carrying executable payloads |

---

## 📊 Security Architecture

`mermaid
flowchart TD
    Req[Incoming HTTP Request] --> RateCheck{Rate Limit Store}
    
    RateCheck -->|Limit Exceeded| Reject429[HTTP 429 Too Many Requests]
    RateCheck -->|Allowed| Sanitize[XSS Input Sanitization]
    
    Sanitize --> HasFile{File Upload Included?}
    HasFile -->|No| Handler[Safe Route Handler Execution]
    
    HasFile -->|Yes| MagicCheck[Inspect First 8 Bytes ArrayBuffer]
    MagicCheck -->|Signature Mismatch| Reject400[HTTP 400 Invalid File Signature]
    MagicCheck -->|Signature Verified| Rename[Cryptographic Random Filename]
    Rename --> Handler
`

---

## 🚀 Installation & Quick Start

`ash
git clone https://github.com/sahejvirsingh/api-security-toolkit.git
cd api-security-toolkit
npm install
npm test
`

### Usage Examples

#### 1. Rate Limiting (In-Memory or Distributed Redis)
`	ypescript
import { MemoryStore, RedisStore } from "api-security-toolkit";

// In-Memory store for microservices
const limiter = new MemoryStore();
const result = await limiter.limit("user_ip_192.168.1.1", 10, 60_000); // 10 reqs / min

if (!result.allowed) {
  throw new Error(Rate limit exceeded. Try again in ms);
}
`

#### 2. Inspecting File Magic Bytes
`	ypescript
import { validateFileUpload, generateSecureFilename } from "api-security-toolkit";

// Obtain raw buffer from your web framework (Express, Next.js, Fastify)
const buffer = await file.arrayBuffer();

const validation = validateFileUpload(
  buffer, 
  "invoice.pdf", 
  "application/pdf", 
  10 * 1024 * 1024 // 10 MB Max
);

if (!validation.valid) {
  console.error("Upload rejected:", validation.error);
  return;
}

// Generate collision-safe, directory-traversal-proof filename
const safeStorageName = generateSecureFilename("invoice.pdf");
console.log("Safe storage key:", safeStorageName); // e.g. "1710508800000-k8f9a2b.pdf"
`

#### 3. XSS Sanitization
`	ypescript
import { sanitizeHtml, sanitizeText } from "api-security-toolkit";

// Plain text input (forms, comments, user bios)
const cleanUserComment = sanitizeText(
  "Hello <script>alert('xss')</script> javascript:void(0)"
);
console.log(cleanUserComment); // "Hello alert('xss') void(0)"

// Rich text input (markdown previews, blog posts)
const safeHtml = sanitizeHtml(
  "<p>Safe text</p><img src=x onerror=alert(1)>"
);
console.log(safeHtml); // "<p>Safe text</p>"
`

---

## 🧪 Testing & Verification

Comprehensive Vitest tests cover:
- **Rate Limit Window Resets**: Confirms allowance refills precisely after duration expires.
- **Magic Byte Mismatch**: Verifies that text files renamed to .png are detected and rejected.
- **Sanitizer Fuzzing**: Validates removal of nested script tags, hex-encoded payloads, and event attributes.

---

## 📄 License
MIT © [Sahejvir Singh](https://github.com/sahejvirsingh)
