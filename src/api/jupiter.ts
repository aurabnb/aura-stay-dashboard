import { apiFetch } from "./_client";
import { JUPITER_API } from "@/config";
import type { JupiterPriceResp } from "@/types";

/** Batch price lookup */
export const fetchJupiterPrices = (mints: string[]): Promise<JupiterPriceResp> =>
  mints.length === 0
    ? Promise.resolve({})
    : apiFetch<{ data: JupiterPriceResp }>(`${JUPITER_API}?ids=${mints.join(",")}`)
        .then(r => r.data ?? {});
