# 🛡️ API Security Toolkit

Framework-agnostic, edge-ready security middleware for Node.js / HTTP APIs. Defends against XSS, brute force attacks, and disguised malicious file uploads.

## ✨ Features

- **Distributed Rate Limiting**: Sliding-window rate limiter powered by @upstash/ratelimit for Redis, alongside a zero-dependency in-memory fallback.
- **XSS Protection**: Dual-layer sanitization (strict regex for plain text and sanitize-html for rich text).
- **Magic Bytes File Validation**: Inspects the first 8 bytes (hex signature) of an ArrayBuffer to verify a file's true MIME type, preventing executable disguise attacks.

## 🚀 Quick Start

`ash
npm install
npm test
`

## 📄 License
MIT
