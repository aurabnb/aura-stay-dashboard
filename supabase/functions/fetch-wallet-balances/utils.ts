
let lastRequestTime = 0;
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 5;
const BASE_DELAY = 2000;

export async function rateLimitedFetch(url: string, options?: RequestInit, retries = 2): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest > 60000) {
    requestCount = 0;
  }
  
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    const delay = BASE_DELAY * Math.pow(2, Math.min(requestCount - MAX_REQUESTS_PER_MINUTE, 5));
    console.log(`Rate limit reached, waiting ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  const minDelay = BASE_DELAY + (requestCount * 500);
  if (timeSinceLastRequest < minDelay) {
    await new Promise(resolve => setTimeout(resolve, minDelay - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  requestCount++;
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.status === 429 && retries > 0) {
      console.log(`Rate limited, retrying in ${BASE_DELAY * 3}ms...`);
      await new Promise(resolve => setTimeout(resolve, BASE_DELAY * 3));
      return rateLimitedFetch(url, options, retries - 1);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Request failed, retrying in ${BASE_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, BASE_DELAY));
      return rateLimitedFetch(url, options, retries - 1);
    }
    throw error;
  }
}
