"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "meshi:onboardingSeen";
const listeners = new Set<() => void>();
let cache = false;

function subscribe(callback: () => void) {
  try {
    cache = window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    cache = false;
  }
  callback();
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): boolean {
  return cache;
}

/** `undefined` until the real localStorage value has been read (SSR/hydration-safe). */
function getServerSnapshot(): boolean | undefined {
  return undefined;
}

/**
 * Whether the first-run explanation/onboarding screens have already been shown
 * on this device — see 設計書 §4.2 (`meshi:onboardingSeen`).
 */
export function useOnboarding() {
  const seen = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const markSeen = useCallback(() => {
    if (cache) return;
    cache = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // localStorage unavailable — onboarding will just show again next time.
    }
    listeners.forEach((listener) => listener());
  }, []);

  return { seen, markSeen };
}
