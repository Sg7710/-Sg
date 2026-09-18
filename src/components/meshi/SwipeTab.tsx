"use client";

import { useMemo, useRef } from "react";
import type { Store } from "@/types/store";
import { StoreCard, type StoreCardHandle } from "./StoreCard";

interface SwipeTabProps {
  stores: Store[];
  idx: number;
  onAdvance: () => void;
  onLike: (placeId: string) => void;
  onResetIdx: () => void;
}

export function SwipeTab({ stores, idx, onAdvance, onLike, onResetIdx }: SwipeTabProps) {
  const topRef = useRef<StoreCardHandle>(null);
  const stack = useMemo(() => stores.slice(idx, idx + 3), [stores, idx]);
  const total = stores.length;
  const current = Math.min(idx + 1, total);
  const topStore = stack[0];

  function handleCommit(direction: "like" | "pass") {
    if (!topStore) return;
    if (direction === "like") onLike(topStore.placeId);
  }

  if (stack.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
        <h2 className="text-lg font-bold text-text-primary">この辺りは全部見ました</h2>
        <p className="text-sm text-text-secondary">食べたいリストから決めるか、もう一度見返せます。</p>
        <button
          type="button"
          onClick={onResetIdx}
          className="mt-4 h-12 rounded-full bg-accent px-6 text-sm font-bold text-text-primary"
        >
          もう一度見る
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-5 pt-4">
      <div className="relative flex-1">
        {stack.map((store, i) => (
          <StoreCard
            key={store.placeId}
            ref={i === 0 ? topRef : undefined}
            store={store}
            position={i}
            onCommit={handleCommit}
            onAdvance={onAdvance}
          />
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 py-5">
        <button
          type="button"
          aria-label="パスする"
          data-onboarding-target="pass"
          onClick={() => topRef.current?.commit("pass")}
          className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full border border-card-border bg-white text-2xl shadow-card"
        >
          ❌
        </button>
        <button
          type="button"
          aria-label="食べたいリストに追加"
          data-onboarding-target="like"
          onClick={() => topRef.current?.commit("like")}
          className="flex h-[62px] flex-1 items-center justify-center gap-2 rounded-full bg-accent text-base font-bold text-text-primary shadow-card"
        >
          👍 食べたい
        </button>
      </div>
      <p className="pb-4 text-center font-mono text-xs text-text-tertiary">
        {current}/{total}
      </p>
    </div>
  );
}
