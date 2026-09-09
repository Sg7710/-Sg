"use client";

import useSWR from "swr";
import type { Store } from "@/types/store";
import type { Coords } from "./useLocation";

export type StoresStatus = "idle" | "loading" | "success" | "error";

async function fetchStores([, lat, lng]: readonly [string, number, number]): Promise<Store[]> {
  const res = await fetch("/api/stores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng }),
  });
  if (!res.ok) throw new Error(`status ${res.status}`);
  const data = (await res.json()) as { stores: Store[] };
  return data.stores;
}

/** Fetches nearby stores for the given coords via SWR (Next.js's recommended
 * client-fetching pattern) — avoids hand-rolling loading/error state in a
 * useEffect. */
export function useStores(coords: Coords | null) {
  const key = coords ? (["stores", coords.lat, coords.lng] as const) : null;
  const { data, error, isLoading, mutate } = useSWR(key, fetchStores);

  const status: StoresStatus = !coords
    ? "idle"
    : error
      ? "error"
      : isLoading || !data
        ? "loading"
        : "success";

  return { status, stores: data ?? [], retry: () => mutate() };
}
