"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "meshi:passHistory";
const listeners = new Set<() => void>();

interface PassHistoryState {
  date: string;
  counts: Record<string, number>;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function emptyState(): PassHistoryState {
  return { date: todayKey(), counts: {} };
}

// Never matches a real todayKey(), so it's only ever visible before hydration.
const SERVER_SNAPSHOT: PassHistoryState = { date: "", counts: {} };

let cache: PassHistoryState = SERVER_SNAPSHOT;

/** 日付が変わっていたら記録を全消去する(設計書 ST-5)。 */
function normalize(state: PassHistoryState): PassHistoryState {
  return state.date === todayKey() ? state : emptyState();
}

function parse(raw: string | null): PassHistoryState {
  if (!raw) return emptyState();
  try {
    const parsed = JSON.parse(raw) as Partial<PassHistoryState>;
    if (typeof parsed.date !== "string" || typeof parsed.counts !== "object" || !parsed.counts) {
      return emptyState();
    }
    return normalize({ date: parsed.date, counts: parsed.counts });
  } catch {
    return emptyState();
  }
}

function persist(next: PassHistoryState) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable — pass counts just won't persist across reloads.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  cache = parse(window.localStorage.getItem(STORAGE_KEY));
  callback();

  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) {
      cache = parse(event.newValue);
      callback();
    }
  }

  window.addEventListener("storage", onStorage);
  listeners.add(callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    listeners.delete(callback);
  };
}

function getSnapshot() {
  return cache;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

/** その日のパス回数(placeIdごと)。日付が変わると自動でリセットされる(設計書 ST-5 §4.2)。 */
export function usePassHistory() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const getPassCount = useCallback(
    (placeId: string) => normalize(state).counts[placeId] ?? 0,
    [state],
  );

  const recordPass = useCallback((placeId: string) => {
    const base = normalize(cache);
    const nextCount = (base.counts[placeId] ?? 0) + 1;
    persist({ date: base.date, counts: { ...base.counts, [placeId]: nextCount } });
  }, []);

  return { getPassCount, recordPass };
}
