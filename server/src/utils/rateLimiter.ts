/**
 * Per-key sliding-window rate limiter (e.g. one key per socket connection). Used to bound
 * cheap-to-retry, guessable actions — room-code brute forcing via repeated join attempts,
 * unbounded room creation — since neither is otherwise throttled at the socket layer.
 */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly maxAttempts: number,
    private readonly windowMs: number,
  ) {}

  /** Records an attempt for `key` and returns whether it's allowed under the limit. */
  attempt(key: string): boolean {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((timestamp) => now - timestamp < this.windowMs);
    if (recent.length >= this.maxAttempts) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }

  /** Drops tracking for a key (call on socket disconnect) so the map doesn't grow unbounded. */
  clear(key: string): void {
    this.hits.delete(key);
  }
}
