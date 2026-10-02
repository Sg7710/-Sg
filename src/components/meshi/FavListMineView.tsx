"use client";

import type { Store } from "@/types/store";
import type { Person } from "@/types/social";
import type { FavoriteEntry } from "@/hooks/useFavorites";
import { walkText } from "@/lib/meshi/derived";
import { Avatar } from "./Avatar";

interface FavListMineViewProps {
  favorites: FavoriteEntry[];
  stores: Store[];
  people: Person[];
  onRemove: (placeId: string) => void;
}

export function FavListMineView({ favorites, stores, people, onRemove }: FavListMineViewProps) {
  const favStores = favorites
    .map((f) => stores.find((s) => s.placeId === f.placeId))
    .filter((s): s is Store => Boolean(s));

  if (favStores.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-5 pb-5 pt-1">
        <div
          className="flex flex-col items-center gap-1.5 rounded-[22px] px-6 py-20 text-center"
          style={{ border: "1px dashed rgba(26,24,19,0.16)" }}
        >
          <p className="text-sm font-bold text-text-primary">まだ空です</p>
          <p className="text-xs leading-[1.8] text-text-secondary">
            「みんな」から気になる店を追加できます
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5 pt-1">
      {favStores.map((store) => {
        const wanters = people.filter((p) => p.wantIds.includes(store.placeId));
        return (
          <li
            key={store.placeId}
            className="flex items-center gap-[14px] rounded-[20px] border border-card-border bg-white p-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={store.photoUrl}
              alt={store.name}
              className="h-16 w-16 shrink-0 rounded-[15px] object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
              <p className="truncate text-[15px] font-bold text-text-primary">{store.name}</p>
              <p className="flex items-center gap-2 font-mono text-[11px] text-text-secondary">
                <span>{walkText(store.walkMinutes)}</span>
                <span className="text-[#D6D0C4]">/</span>
                <span>{store.price ?? "?"}</span>
                <span className="text-[#D6D0C4]">/</span>
                <span>{store.genre}</span>
              </p>
              {wanters.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5">
                    {wanters.map((p) => (
                      <Avatar key={p.id} name={p.name} color={p.color} size={22} />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-[#8F5E10]">
                    {wanters.map((p) => p.name).join("・")}も食べたい
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => onRemove(store.placeId)}
              className="h-11 min-w-[56px] shrink-0 rounded-[22px] border border-[rgba(26,24,19,0.12)] px-3 text-[11px] font-bold text-[#8A8474]"
            >
              はずす
            </button>
          </li>
        );
      })}
    </ul>
  );
}
