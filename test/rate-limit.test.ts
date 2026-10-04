import { describe, it, expect } from "vitest";
import { MemoryStore } from "../src/rate-limit";

describe("Rate Limiting", () => {
  it("should enforce limits correctly with MemoryStore", async () => {
    const store = new MemoryStore();
    const key = "user_123";

    // 1st request
    const res1 = await store.limit(key, 2, 1000);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(1);

    // 2nd request
    const res2 = await store.limit(key, 2, 1000);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(0);

    // 3rd request (should block)
    const res3 = await store.limit(key, 2, 1000);
    expect(res3.allowed).toBe(false);
    expect(res3.remaining).toBe(0);
  });
});
