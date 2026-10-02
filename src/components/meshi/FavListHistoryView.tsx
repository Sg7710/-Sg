"use client";

import { useState } from "react";
import type { Store } from "@/types/store";
import type { LikeEntry } from "@/types/social";

interface FavListHistoryViewProps {
  history: LikeEntry[];
  stores: Store[];
  myFavoritePlaceIds: Set<string>;
  onToggleMine: (placeId: string) => void;
  onBulkAdd: (placeIds: string[]) => void;
}

interface HistoryRow {
  entry: LikeEntry;
  store: Store;
}

function dayLabel(date: Date, today: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const diffDays = Math.round((t - d) / 86_400_000);
  if (diffDays === 0) return "今日";
  if (diffDays === 1) return "昨日";
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function FavListHistoryView({
  history,
  stores,
  myFavoritePlaceIds,
  onToggleMine,
  onBulkAdd,
}: FavListHistoryViewProps) {
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const rows: HistoryRow[] = history
    .map((entry) => {
      const store = stores.find((s) => s.placeId === entry.placeId);
      return store ? { entry, store } : null;
    })
    .filter((r): r is HistoryRow => r !== null);

  const now = new Date();
  const groups = new Map<string, HistoryRow[]>();
  for (const row of rows) {
    const label = dayLabel(new Date(row.entry.likedAt), now);
    const list = groups.get(label) ?? [];
    list.push(row);
    groups.set(label, list);
  }

  function toggleSelecting() {
    setSelecting((s) => !s);
    setPicked(new Set());
  }

  function toggleRowPicked(placeId: string) {
    if (myFavoritePlaceIds.has(placeId)) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) next.delete(placeId);
      else next.add(placeId);
      return next;
    });
  }

  function handleConfirm() {
    if (picked.size === 0) return;
    onBulkAdd(Array.from(picked));
    setSelecting(false);
    setPicked(new Set());
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between px-5 pb-3">
        <p className="text-[11px] text-text-secondary">右スワイプした店は自動で残ります</p>
        <button
          type="button"
          onClick={toggleSelecting}
          className={`flex h-9 shrink-0 items-center rounded-[18px] px-3.5 text-xs font-bold ${
            selecting
              ? "border border-text-primary bg-text-primary text-app"
              : "border border-[rgba(26,24,19,0.12)] bg-white text-text-primary"
          }`}
        >
          {selecting ? "やめる" : "選んで追加"}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-5">
        {rows.length === 0 ? (
          <p className="pt-10 text-center text-sm text-text-secondary">まだ履歴がありません</p>
        ) : (
          Array.from(groups.entries()).map(([label, groupRows]) => (
            <div key={label} className="flex flex-col gap-2.5">
              <div className="flex items-baseline gap-2">
                <p className="text-[13px] font-bold text-text-primary">{label}</p>
                <p className="font-mono text-[10px] text-text-tertiary">
                  {new Date(groupRows[0].entry.likedAt).getMonth() + 1}/
                  {new Date(groupRows[0].entry.likedAt).getDate()}
                </p>
              </div>
              {groupRows.map(({ entry, store }) => {
                const alreadyMine = myFavoritePlaceIds.has(store.placeId);
                const isPicked = picked.has(store.placeId);
                return (
                  <div
                    key={`${store.placeId}-${entry.likedAt}`}
                    role={selecting ? "button" : undefined}
                    tabIndex={selecting ? 0 : undefined}
                    onClick={selecting ? () => toggleRowPicked(store.placeId) : undefined}
                    className="flex items-center gap-3 rounded-[18px] border bg-white p-2.5"
                    style={{
                      borderColor: isPicked ? "var(--accent)" : "rgba(26,24,19,0.07)",
                      cursor: selecting && !alreadyMine ? "pointer" : undefined,
                    }}
                  >
                    {selecting && (
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
                        style={
                          alreadyMine
                            ? { backgroundColor: "#F1EEE7" }
                            : isPicked
                              ? { backgroundColor: "var(--accent)", color: "#fff" }
                              : { border: "1.5px solid rgba(26,24,19,0.2)", backgroundColor: "#fff" }
                        }
                      >
                        {alreadyMine ? (
                          <span className="text-[9px] font-bold text-text-tertiary">済</span>
                        ) : isPicked ? (
                          "✓"
                        ) : null}
                      </span>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={store.photoUrl}
                      alt={store.name}
                      className="h-[52px] w-[52px] shrink-0 rounded-[13px] object-cover"
                      style={{ opacity: selecting && alreadyMine ? 0.45 : 1 }}
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="truncate text-sm font-bold text-text-primary">{store.name}</p>
                      <p className="font-mono text-[11px] text-text-secondary">
                        {formatTime(new Date(entry.likedAt))} / {store.genre} / {store.price ?? "?"}
                      </p>
                    </div>
                    {!selecting && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMine(store.placeId);
                        }}
                        className={`h-10 shrink-0 rounded-[20px] px-3.5 text-[11px] font-bold ${
                          alreadyMine
                            ? "bg-tab-active text-[#8A8474]"
                            : "border bg-white text-[#8F5E10]"
                        }`}
                        style={!alreadyMine ? { borderColor: "var(--accent)" } : undefined}
                      >
                        {alreadyMine ? "リスト済み" : "＋ リストへ"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {selecting && (
        <div className="shrink-0 border-t border-card-border bg-app px-5 py-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={picked.size === 0}
            className={`h-[52px] w-full rounded-[26px] text-sm font-bold ${
              picked.size > 0 ? "bg-accent text-white" : "bg-tab-active text-text-tertiary"
            }`}
          >
            {picked.size > 0 ? `${picked.size}件を食べたいリストに追加` : "店を選んでください"}
          </button>
        </div>
      )}
    </div>
  );
}
