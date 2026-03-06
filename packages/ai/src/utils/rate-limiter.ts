/**
 * Simple sliding window rate limiter.
 * Tracks request timestamps and waits if the limit is reached.
 */
export class RateLimiter {
  private timestamps: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number,
  ) {}

  /**
   * Acquire a slot in the rate limiter.
   * If the limit is reached, waits until a slot becomes available.
   */
  async acquire(): Promise<void> {
    while (true) {
      const now = Date.now();
      this.cleanup(now);

      if (this.timestamps.length < this.maxRequests) {
        this.timestamps.push(now);
        return;
      }

      const oldestTimestamp = this.timestamps[0]!;
      const waitTime = oldestTimestamp + this.windowMs - now;

      if (waitTime > 0) {
        await this.sleep(waitTime);
      }

      this.cleanup(Date.now());
    }
  }

  /**
   * Get the number of remaining requests in the current window.
   */
  remaining(): number {
    this.cleanup(Date.now());
    return Math.max(0, this.maxRequests - this.timestamps.length);
  }

  /**
   * Reset the rate limiter, clearing all tracked requests.
   */
  reset(): void {
    this.timestamps = [];
  }

  private cleanup(now: number): void {
    const windowStart = now - this.windowMs;
    this.timestamps = this.timestamps.filter((t) => t > windowStart);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
