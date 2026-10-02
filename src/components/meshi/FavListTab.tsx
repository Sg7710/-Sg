"use client";

import { useMemo, useState } from "react";
import type { Store } from "@/types/store";
import type { LikeEntry } from "@/types/social";
import type { FavoriteEntry } from "@/hooks/useFavorites";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { MOCK_PEOPLE } from "@/lib/meshi/mock-people";
import { FavListHeader, type FavView } from "./FavListHeader";
import { FavListMineView } from "./FavListMineView";
import { FavListEveryoneView } from "./FavListEveryoneView";
import { FavListHistoryView } from "./FavListHistoryView";
import { ProfilePopup } from "./ProfilePopup";

interface FavListTabProps {
  favorites: FavoriteEntry[];
  stores: Store[];
  likeHistory: LikeEntry[];
  onRemove: (placeId: string) => void;
  onToggleFavorite: (placeId: string) => void;
  onAddMany: (placeIds: string[]) => void;
}

export function FavListTab({
  favorites,
  stores,
  likeHistory,
  onRemove,
  onToggleFavorite,
  onAddMany,
}: FavListTabProps) {
  const [view, setView] = useState<FavView>("mine");
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useCurrentUser();

  const myFavoritePlaceIds = useMemo(
    () => new Set(favorites.map((f) => f.placeId)),
    [favorites],
  );

  const othersCount = useMemo(() => {
    const ids = new Set<string>();
    for (const person of MOCK_PEOPLE) {
      for (const id of person.wantIds) ids.add(id);
    }
    return ids.size;
  }, []);

  function changeView(next: FavView) {
    setView(next);
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <FavListHeader
        view={view}
        onChangeView={changeView}
        userName={user.name}
        mineCount={favorites.length}
        othersCount={othersCount}
        historyCount={likeHistory.length}
        onOpenMenu={() => setMenuOpen(true)}
      />

      {view === "mine" && (
        <FavListMineView
          favorites={favorites}
          stores={stores}
          people={MOCK_PEOPLE}
          onRemove={onRemove}
        />
      )}
      {view === "others" && (
        <FavListEveryoneView
          stores={stores}
          people={MOCK_PEOPLE}
          myFavoritePlaceIds={myFavoritePlaceIds}
          onToggleMine={onToggleFavorite}
        />
      )}
      {view === "history" && (
        <FavListHistoryView
          history={likeHistory}
          stores={stores}
          myFavoritePlaceIds={myFavoritePlaceIds}
          onToggleMine={onToggleFavorite}
          onBulkAdd={(placeIds) => {
            onAddMany(placeIds);
            setView("mine");
          }}
        />
      )}

      {menuOpen && (
        <ProfilePopup
          name={user.name}
          favCount={favorites.length}
          likeCount={likeHistory.length}
          peopleCount={MOCK_PEOPLE.length}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
