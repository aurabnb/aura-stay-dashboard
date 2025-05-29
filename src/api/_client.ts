/*--------------------------------------------------------------------
  Shared fetch wrapper with:
  • automatic JSON parsing + typed return
  • 3-try exponential back-off
  • 30-second in-memory cache
  • optional abort via AbortSignal / AbortController
--------------------------------------------------------------------*/
type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: Method;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  /** milliseconds; default 30 000 */
  cacheTTL?: number;
  /** External AbortSignal (e.g. from a React cleanup) */
  signal?: AbortSignal;
  /** External AbortController if you want to cancel retries manually */
  controller?: AbortController;
}

const CACHE = new Map<string, { ts: number; data: unknown }>();

export async function apiFetch<T>(
  url: string,
  {
    method = "GET",
    headers = {},
    body,
    cacheTTL = 30_000,
    signal,
    controller,
  }: RequestOptions = {},
): Promise<T> {
  const cacheKey = method + url + (body ? JSON.stringify(body) : "");
  const now = Date.now();

  /* ---- serve from cache if fresh ---- */
  const cached = CACHE.get(cacheKey);
  if (cached && now - cached.ts < cacheTTL) {
    return cached.data as T;
  }

  /* ------------------------------------------------------------------ */
  /*                     choose a single AbortSignal                     */
  /* ------------------------------------------------------------------ */
  const internalCtrl = controller ?? new AbortController();
  const fetchSignal = signal ?? internalCtrl.signal;

  /* ---- retry logic ---- */
  const doFetch = async (attempt: number): Promise<Response> => {
    const res = await fetch(url, { method, headers, body, signal: fetchSignal });
    if (!res.ok && attempt < 3) {
      await new Promise(r => setTimeout(r, 2 ** attempt * 400)); // 0.4 s, 0.8 s
      return doFetch(attempt + 1);
    }
    return res;
  };

  const response = await doFetch(1);

  if (!response.ok) {
    throw new Error(`${method} ${url} → ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as T;
  CACHE.set(cacheKey, { ts: now, data });
  return data;
}
