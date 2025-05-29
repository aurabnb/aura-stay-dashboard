import { apiFetch } from "./_client";
import { METEORA_API } from "@/config";

/** DLMM pool info (kept as `unknown` until you add a concrete type) */
export const fetchMeteoraPool = (addr: string) =>
  apiFetch<unknown>(`${METEORA_API}/${addr}`);
