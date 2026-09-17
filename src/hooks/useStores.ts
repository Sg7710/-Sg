"use client";

import useSWR from "swr";
import type { Store } from "@/types/store";
import type { Coords } from "./useLocation";
import { isDevMode } from "@/lib/meshi/dev-mode";
import { MOCK_STORES } from "@/lib/meshi/mock-stores";

export type StoresStatus = "idle" | "loading" | "success" | "error";

async function fetchStoresFromApi(lat: number, lng: number): Promise<Store[]> {
  const res = await fetch("/api/stores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng }),
  });
  if (!res.ok) throw new Error(`status ${res.status}`);
  const data = (await res.json()) as { stores: Store[] };
  return data.stores;
}

/** Fetches nearby stores for the given coords via SWR. In dev mode, returns
 * mock data instead of calling the paid Places/Routes APIs — see isDevMode(). */
export function useStores(coords: Coords | null) {
  const devMode = isDevMode();
  const key = devMode ? "dev-mock-stores" : coords ? `stores:${coords.lat}:${coords.lng}` : null;

  const { data, error, isLoading, mutate } = useSWR(key, () =>
    devMode ? Promise.resolve(MOCK_STORES) : fetchStoresFromApi(coords!.lat, coords!.lng),
  );

  const status: StoresStatus = !key
    ? "idle"
    : error
      ? "error"
      : isLoading || !data
        ? "loading"
        : "success";

  return { status, stores: data ?? [], retry: () => mutate() };
}
