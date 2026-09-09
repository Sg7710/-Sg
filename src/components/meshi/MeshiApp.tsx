"use client";

import { useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocation } from "@/hooks/useLocation";
import { useStores } from "@/hooks/useStores";
import { Header } from "./Header";
import { SwipeTab } from "./SwipeTab";
import { FavListTab } from "./FavListTab";
import { BottomTabBar } from "./BottomTabBar";

type Tab = "swipe" | "fav";

const FRAME_CLASS =
  "relative flex h-dvh w-full max-w-[402px] flex-col overflow-hidden bg-app sm:my-8 sm:h-[874px] sm:rounded-[32px] sm:border sm:border-card-border sm:shadow-card";

function CenteredMessage({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className={FRAME_CLASS}>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
        {body && <p className="text-sm text-text-secondary">{body}</p>}
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-4 h-12 rounded-full bg-accent px-6 text-sm font-bold text-text-primary"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export function MeshiApp() {
  const [tab, setTab] = useState<Tab>("swipe");
  const [idx, setIdx] = useState(0);

  const { status: locationStatus, coords, request } = useLocation();
  const {
    status: storesStatus,
    stores,
    retry: retryStores,
  } = useStores(locationStatus === "granted" ? coords : null);
  const { favorites, addFavorite, removeFavorite } = useFavorites();

  if (locationStatus === "idle") {
    return (
      <CenteredMessage
        title="近くのお店を探すために現在地を使います"
        body="許可すると、現在地から歩ける範囲の営業中のお店を表示します。"
        actionLabel="現在地を許可する"
        onAction={request}
      />
    );
  }

  if (locationStatus === "requesting") {
    return <CenteredMessage title="現在地を取得しています…" />;
  }

  if (locationStatus === "denied") {
    return (
      <CenteredMessage
        title="現在地の許可が必要です"
        body="ブラウザの設定サイトの許可からこのページの位置情報を許可し、再試行してください。"
        actionLabel="再試行"
        onAction={request}
      />
    );
  }

  if (locationStatus === "error") {
    return (
      <CenteredMessage
        title="現在地が取得できませんでした"
        body="電波状況などにより取得に失敗しました。"
        actionLabel="再試行"
        onAction={request}
      />
    );
  }

  if (storesStatus === "error") {
    return (
      <CenteredMessage title="読み込めませんでした" actionLabel="再試行" onAction={retryStores} />
    );
  }

  if (storesStatus !== "success") {
    return <CenteredMessage title="お店を探しています…" />;
  }

  return (
    <div className={FRAME_CLASS}>
      <Header locationStatus={locationStatus} storeCount={stores.length} />

      {tab === "swipe" ? (
        <SwipeTab
          stores={stores}
          idx={idx}
          onAdvance={() => setIdx((i) => i + 1)}
          onLike={addFavorite}
          onResetIdx={() => setIdx(0)}
        />
      ) : (
        <FavListTab favorites={favorites} stores={stores} onRemove={removeFavorite} />
      )}

      <BottomTabBar tab={tab} favCount={favorites.length} onChange={setTab} />
    </div>
  );
}
