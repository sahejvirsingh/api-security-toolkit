import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export interface RateLimiterStore {
  limit(key: string, max: number, windowMs: number): Promise<RateResult>;
}

export class MemoryStore implements RateLimiterStore {
  private store = new Map<string, { count: number; resetAt: number }>();

  async limit(key: string, max: number, windowMs: number): Promise<RateResult> {
    const now = Date.now();
    const current = this.store.get(key);

    if (!current || now >= current.resetAt) {
      const resetAt = now + windowMs;
      this.store.set(key, { count: 1, resetAt });
      return { allowed: true, limit: max, remaining: max - 1, resetAt };
    }

    if (current.count >= max) {
      return { allowed: false, limit: max, remaining: 0, resetAt: current.resetAt };
    }

    current.count++;
    return { allowed: true, limit: max, remaining: max - current.count, resetAt: current.resetAt };
  }
}

export class RedisStore implements RateLimiterStore {
  private redis: Redis;

  constructor(url: string, token: string) {
    this.redis = new Redis({ url, token });
  }

  async limit(key: string, max: number, windowMs: number): Promise<RateResult> {
    const windowStr = `${Math.ceil(windowMs / 1000)} s`;
    // @ts-ignore
    const limiter = new Ratelimit({
      redis: this.redis,
      limiter: Ratelimit.slidingWindow(max, windowStr as any),
      ephemeralCache: new Map(),
    });

    const { success, limit, remaining, reset } = await limiter.limit(key);
    return {
      allowed: success,
      limit,
      remaining,
      resetAt: reset,
    };
  }
}
