"use client";

import type { Store } from "@/types/store";
import type { FavoriteEntry } from "@/hooks/useFavorites";
import { walkText } from "@/lib/meshi/derived";

interface FavListTabProps {
  favorites: FavoriteEntry[];
  stores: Store[];
  onRemove: (placeId: string) => void;
}

export function FavListTab({ favorites, stores, onRemove }: FavListTabProps) {
  const favStores = favorites
    .map((f) => stores.find((s) => s.placeId === f.placeId))
    .filter((s): s is Store => Boolean(s));

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 pt-4">
      <div className="flex items-baseline gap-2 pb-3">
        <h1 className="text-lg font-black text-text-primary">食べたいリスト</h1>
        <span className="font-mono text-sm text-text-tertiary">{favorites.length}件</span>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          <h2 className="text-base font-bold text-text-primary">まだ空です</h2>
          <p className="text-sm text-text-secondary">
            気になった写真を右にスワイプすると
            <br />
            ここに溜まっていきます
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 pb-6">
          {favStores.map((store) => (
            <li
              key={store.placeId}
              className="flex items-center gap-3 rounded-2xl border border-card-border bg-white p-3 shadow-card"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={store.photoUrl}
                alt={store.name}
                className="h-[68px] w-[68px] shrink-0 rounded-xl object-cover"
              />
              <div className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
                <span className="truncate text-base font-bold text-text-primary">{store.name}</span>
                <span className="font-mono text-xs text-text-secondary">
                  {walkText(store.walkMinutes)}
                  {store.price ? ` / ${store.price}` : ""} / {store.genre}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(store.placeId)}
                className="h-11 shrink-0 rounded-full border border-card-border px-4 text-xs font-bold text-text-secondary"
              >
                はずす
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
