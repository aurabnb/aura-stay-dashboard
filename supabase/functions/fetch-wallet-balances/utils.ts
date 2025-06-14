
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export async function rateLimitedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const key = `${minute}`;
  
  const current = requestCounts.get(key) || { count: 0, resetTime: now + 60000 };
  
  if (current.count >= 30) {
    const waitTime = current.resetTime - now;
    if (waitTime > 0) {
      console.log(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  current.count++;
  requestCounts.set(key, current);
  
  // Clean up old entries
  for (const [oldKey, data] of requestCounts.entries()) {
    if (data.resetTime < now) {
      requestCounts.delete(oldKey);
    }
  }
  
  return fetch(url, {
    ...options,
    signal: options.signal || AbortSignal.timeout(10000)
  });
}
