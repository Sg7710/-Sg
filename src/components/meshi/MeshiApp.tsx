"use client";

import { useMemo, useRef, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useLocation } from "@/hooks/useLocation";
import { useOnboarding } from "@/hooks/useOnboarding";
import { usePassHistory } from "@/hooks/usePassHistory";
import { useStores } from "@/hooks/useStores";
import { isDevMode } from "@/lib/meshi/dev-mode";
import { shuffle } from "@/lib/meshi/derived";
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
// lap1 = 1周目(全件ランダム順)、confirm = 「もう一度見ますか」、
// lap2 = 2周目(1回だけパスされた店のみ)、done = その日は以上
type SwipePhase = "lap1" | "confirm" | "lap2" | "done";

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
  const [phase, setPhase] = useState<SwipePhase>("lap1");
  const [lap2List, setLap2List] = useState<
    ReturnType<typeof useStores>["stores"]
  >([]);

  const { status: locationStatus, coords, request } = useLocation();
  const {
    status: storesStatus,
    stores,
    retry: retryStores,
  } = useStores(devMode ? coords : locationStatus === "granted" ? coords : null);
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const { seen: onboardingSeen, markSeen } = useOnboarding();
  const { getPassCount, recordPass } = usePassHistory();

  // 1周目の並び。stores の中身が変わった(=新しく取得した)ときだけシャッフルし直す。
  const lap1List = useMemo(() => shuffle(stores), [stores]);
  const currentList = phase === "lap2" ? lap2List : lap1List;

  // Freeze "is this a returning visitor" the first time we know it, so later
  // markSeen() calls can't flip this mid-flow.
  const [isReturningVisitor, setIsReturningVisitor] = useState<boolean | null>(null);
  if (isReturningVisitor === null && onboardingSeen !== undefined) {
    setIsReturningVisitor(onboardingSeen);
  }

  // Dev mode: skip only the location-permission screen, straight to the
  // onboarding choice. Once we know this is a returning visitor (already
  // marked seen in an earlier session), skip that too and go straight to the app.
  const [stage, setStage] = useState<Stage>(devMode ? "choice" : "location");
  if (devMode && stage === "choice" && isReturningVisitor === true) {
    setStage("app");
  }
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
          markSeen();
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

  // ST-5: 1周目を出し切ったら、1回だけパスされた店で2周目の山を作る。
  // 山が0件なら確認を出さずそのまま「今日は以上です」。
  if (phase === "lap1" && lap1List.length > 0 && idx >= lap1List.length) {
    const pile = lap1List.filter((s) => getPassCount(s.placeId) === 1);
    setLap2List(pile);
    setIdx(0);
    setPhase(pile.length === 0 ? "done" : "confirm");
  }
  if (phase === "lap2" && idx >= lap2List.length) {
    setIdx(0);
    setPhase("done");
  }

  function handlePass(placeId: string) {
    recordPass(placeId);
  }

  return (
    <div ref={frameRef} className={FRAME_CLASS}>
      <Header locationStatus={devMode ? "granted" : locationStatus} storeCount={stores.length} />

      {tab === "fav" ? (
        <FavListTab favorites={favorites} stores={stores} onRemove={removeFavorite} />
      ) : phase === "confirm" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <h2 className="text-lg font-bold text-text-primary">もう一度見ますか？</h2>
          <p className="text-sm text-text-secondary">
            さっきパスした{lap2List.length}件を、もう一度だけ出します。
          </p>
          <div className="mt-4 flex w-full max-w-[260px] flex-col gap-3">
            <button
              type="button"
              onClick={() => setPhase("lap2")}
              className="h-12 rounded-full bg-accent text-sm font-bold text-text-primary"
            >
              見る
            </button>
            <button
              type="button"
              onClick={() => setPhase("done")}
              className="h-12 rounded-full border border-card-border text-sm font-bold text-text-primary"
            >
              見ない
            </button>
          </div>
        </div>
      ) : phase === "done" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <h2 className="text-lg font-bold text-text-primary">今日は以上です</h2>
          <p className="text-sm text-text-secondary">また明日、新しい気持ちで見返せます。</p>
          <button
            type="button"
            onClick={() => setTab("fav")}
            className="mt-4 h-12 rounded-full bg-accent px-6 text-sm font-bold text-text-primary"
          >
            食べたいリストを見る
          </button>
        </div>
      ) : (
        <SwipeTab
          stores={currentList}
          idx={idx}
          isRelapse={phase === "lap2"}
          onAdvance={() => setIdx((i) => i + 1)}
          onLike={addFavorite}
          onPass={handlePass}
        />
      )}

      <BottomTabBar tab={tab} favCount={favorites.length} onChange={setTab} />

      {showTutorial && (
        <TutorialOverlay containerRef={frameRef} onComplete={() => setShowTutorial(false)} />
      )}
    </div>
  );
}
