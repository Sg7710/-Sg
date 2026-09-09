"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { Store } from "@/types/store";
import { walkText } from "@/lib/meshi/derived";

export interface StoreCardHandle {
  commit: (direction: "like" | "pass") => void;
}

interface StoreCardProps {
  store: Store;
  position: number;
  onCommit?: (direction: "like" | "pass") => void;
  onAdvance?: () => void;
}

const SWIPE_THRESHOLD = 88;
const FLY_DISTANCE = 520;
const SETTLE_MS = 260;

export const StoreCard = forwardRef<StoreCardHandle, StoreCardProps>(function StoreCard(
  { store, position, onCommit, onAdvance },
  ref,
) {
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [flying, setFlying] = useState<"like" | "pass" | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const dxRef = useRef(0);

  const isTop = position === 0;

  function commit(direction: "like" | "pass") {
    if (flying) return;
    setDragging(false);
    setFlying(direction);
    setDx(direction === "like" ? FLY_DISTANCE : -FLY_DISTANCE);
    onCommit?.(direction);
    window.setTimeout(() => {
      onAdvance?.();
    }, SETTLE_MS);
  }

  useImperativeHandle(ref, () => ({ commit }));

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!isTop || flying) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isTop || !startRef.current || flying) return;
    const nextDx = e.clientX - startRef.current.x;
    const nextDy = (e.clientY - startRef.current.y) * 0.4;
    dxRef.current = nextDx;
    setDx(nextDx);
    setDy(nextDy);
  }

  function handlePointerUp() {
    if (!isTop || !startRef.current || flying) return;
    startRef.current = null;
    if (Math.abs(dxRef.current) > SWIPE_THRESHOLD) {
      commit(dxRef.current > 0 ? "like" : "pass");
    } else {
      setDragging(false);
      setDx(0);
      setDy(0);
    }
  }

  const transform = isTop
    ? `translate(${dx}px, ${dy}px) rotate(${dx / 24}deg)`
    : `translateY(${14 * position}px) scale(${1 - 0.04 * position})`;

  const likeOpacity = isTop ? Math.min(Math.max(dx / 100, 0), 1) : 0;
  const passOpacity = isTop ? Math.min(Math.max(-dx / 100, 0), 1) : 0;

  return (
    <div
      className="absolute inset-0 flex touch-none flex-col overflow-hidden rounded-[26px] border border-card-border bg-white shadow-card"
      style={{
        transform,
        transition: isTop && !dragging ? "transform .26s cubic-bezier(.22,.68,.36,1)" : "none",
        opacity: position === 2 ? 0.6 : 1,
        zIndex: 10 - position,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="relative flex-1 bg-tab-active">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={store.photoUrl}
          alt={store.name}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <span className="absolute left-3 top-3 rounded-[11px] bg-black/55 px-2.5 py-1 text-xs font-bold text-white">
          {store.genre}
        </span>
        {store.price && (
          <span className="absolute right-3 top-3 rounded-[11px] bg-black/55 px-2.5 py-1 text-xs font-bold text-white">
            {store.price}
          </span>
        )}
        <span className="absolute bottom-2 right-3 text-[10px] text-white/80 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
          写真: {store.photoAttribution}
        </span>
        {isTop && (
          <>
            <div
              className="pointer-events-none absolute right-6 top-6 rounded-lg border-4 border-accent px-3 py-1 text-lg font-black text-accent"
              style={{ opacity: likeOpacity, transform: "rotate(-12deg)" }}
            >
              👍 食べたい
            </div>
            <div
              className="pointer-events-none absolute left-6 top-6 rounded-lg border-4 border-text-secondary px-3 py-1 text-lg font-black text-text-secondary"
              style={{ opacity: passOpacity, transform: "rotate(12deg)" }}
            >
              ❌ パス
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col gap-1 px-5 py-4">
        <h2 className="text-[26px] font-black leading-tight text-text-primary">{store.name}</h2>
        <p className="font-mono text-sm text-text-secondary">
          {walkText(store.walkMinutes)}
          {store.price ? ` / ${store.price}` : ""}
        </p>
      </div>
    </div>
  );
});
