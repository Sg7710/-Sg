"use client";

import { useRef, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocation } from "@/hooks/useLocation";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useStores } from "@/hooks/useStores";
import { isDevMode } from "@/lib/meshi/dev-mode";
import { FRAME_CLASS } from "./frame";
import { LocationPermission } from "./LocationPermission";
import { OnboardingChoice } from "./OnboardingChoice";
import { TutorialOverlay } from "./TutorialOverlay";
import { Header } from "./Header";
import { SwipeTab } from "./SwipeTab";
import { FavListTab } from "./FavListTab";
import { BottomTabBar } from "./BottomTabBar";

type Tab = "swipe" | "fav";
type Stage = "location" | "choice" | "app";

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
  const devMode = isDevMode();
  const frameRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>("swipe");
  const [idx, setIdx] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  const { status: locationStatus, coords, request } = useLocation();
  const {
    status: storesStatus,
    stores,
    retry: retryStores,
  } = useStores(devMode ? coords : locationStatus === "granted" ? coords : null);
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { seen: onboardingSeen } = useOnboarding();

  // Freeze "is this a returning visitor" the first time we know it, so later
  // markSeen() calls (from LocationPermission) can't flip this mid-flow.
  // In dev mode there's no onboarding flow at all, so this is never null.
  const [isReturningVisitor, setIsReturningVisitor] = useState<boolean | null>(
    devMode ? false : null,
  );
  if (isReturningVisitor === null && onboardingSeen !== undefined) {
    setIsReturningVisitor(onboardingSeen);
  }

  // Dev mode: skip only the location-permission screen. The onboarding choice
  // (and tutorial overlay on the real swipe screen) still show normally.
  const [stage, setStage] = useState<Stage>(devMode ? "choice" : "location");
  if (stage === "location" && locationStatus === "granted") {
    setStage(isReturningVisitor ? "app" : "choice");
  }

  if (isReturningVisitor === null) {
    return <div className={FRAME_CLASS} />;
  }

  if (stage === "location") {
    return (
      <LocationPermission status={locationStatus} onRequest={request} autoStart={isReturningVisitor} />
    );
  }

  if (stage === "choice") {
    return (
      <OnboardingChoice
        onChoose={(wantsTutorial) => {
          setShowTutorial(wantsTutorial);
          setStage("app");
        }}
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
    <div ref={frameRef} className={FRAME_CLASS}>
      <Header locationStatus={devMode ? "granted" : locationStatus} storeCount={stores.length} />

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

      {showTutorial && (
        <TutorialOverlay containerRef={frameRef} onComplete={() => setShowTutorial(false)} />
      )}
    </div>
  );
}
