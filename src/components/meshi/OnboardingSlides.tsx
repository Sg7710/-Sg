"use client";

import { useState } from "react";
import { FRAME_CLASS } from "./frame";

interface OnboardingSlidesProps {
  onComplete: () => void;
}

function ArrowIcon({
  direction,
  className = "",
}: {
  direction: "left" | "right" | "up";
  className?: string;
}) {
  const rotate = { right: "rotate-0", left: "rotate-180", up: "-rotate-90" }[direction];
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${rotate} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  );
}

// 実際のStoreCard(角丸26px相当・ジャンルバッジ・「食べたい/パス」スタンプ)を
// 縮小再現し、実画面に忠実な形でスワイプ方向を示す。
function MiniCard({ direction }: { direction: "like" | "pass" }) {
  const isLike = direction === "like";
  return (
    <div className="relative h-[210px] w-[168px]">
      <div
        className="absolute inset-0 flex flex-col overflow-hidden rounded-[20px] border border-card-border bg-white shadow-card"
        style={{ transform: `rotate(${isLike ? 7 : -7}deg)` }}
      >
        <div className="relative flex-1 bg-gradient-to-br from-[#f6e6c8] to-accent/50">
          <span className="absolute inset-0 flex items-center justify-center text-3xl">🍜</span>
          <span className="absolute left-2 top-2 rounded-[8px] bg-black/50 px-2 py-0.5 text-[9px] font-bold text-white">
            ジャンル
          </span>
        </div>
        <div className="px-3 py-2.5">
          <div className="h-2.5 w-16 rounded bg-card-border" />
          <div className="mt-1.5 h-2 w-11 rounded bg-card-border/70" />
        </div>
        <div
          className={`pointer-events-none absolute top-16 rounded-md border-[3px] px-2 py-0.5 text-xs font-black ${
            isLike
              ? "right-2 rotate-[-12deg] border-accent text-accent"
              : "left-2 rotate-[12deg] border-text-secondary text-text-secondary"
          }`}
        >
          {isLike ? "👍 食べたい" : "❌ パス"}
        </div>
      </div>

      <ArrowIcon
        direction={isLike ? "right" : "left"}
        className={`absolute top-1/2 h-10 w-10 -translate-y-1/2 text-accent ${
          isLike ? "-right-11" : "-left-11"
        }`}
      />
    </div>
  );
}

function MiniListRow() {
  return (
    <div className="flex w-[210px] items-center gap-2 rounded-2xl border border-card-border bg-white p-2 shadow-card">
      <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-[#f6e6c8] to-accent/50" />
      <div className="min-w-0 flex-1">
        <div className="h-2 w-16 rounded bg-card-border" />
        <div className="mt-1 h-1.5 w-10 rounded bg-card-border/70" />
      </div>
      <span className="text-lg">🗺️</span>
    </div>
  );
}

function TabBarToFavIllustration() {
  return (
    <div className="flex flex-col items-center gap-2">
      <MiniListRow />
      <ArrowIcon direction="up" className="h-6 w-6 text-accent" />
      <div className="flex w-[210px] gap-1.5 rounded-2xl border border-card-border bg-white p-1.5 shadow-card">
        <div className="h-8 flex-1 rounded-full text-center text-[10px] leading-8 text-text-tertiary">
          スワイプ
        </div>
        <div className="relative h-8 flex-1 rounded-full bg-tab-active text-center text-[10px] font-bold leading-8 text-text-primary">
          食べたいリスト
          <span className="absolute right-1.5 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-text-primary">
            2
          </span>
        </div>
      </div>
    </div>
  );
}

const SLIDES = [
  {
    title: "右にスワイプ",
    body: "気になったお店は右にスワイプして「食べたい」に追加します。",
    illustration: <MiniCard direction="like" />,
  },
  {
    title: "左にスワイプ",
    body: "気にならなければ左にスワイプ、またはパスして次のお店へ。",
    illustration: <MiniCard direction="pass" />,
  },
  {
    title: "食べたいリストから",
    body: "追加したお店は下の「食べたいリスト」タブに溜まります。そこからGoogleマップで詳細や道順を確認できます。",
    illustration: <TabBarToFavIllustration />,
  },
];

export function OnboardingSlides({ onComplete }: OnboardingSlidesProps) {
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  return (
    <div className={FRAME_CLASS}>
      <div className="flex justify-end px-5 pt-5">
        <button type="button" onClick={onComplete} className="text-xs font-bold text-text-tertiary">
          スキップ
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
        {slide.illustration}
        <div>
          <h2 className="text-lg font-bold text-text-primary">{slide.title}</h2>
          <p className="mt-1 text-sm text-text-secondary">{slide.body}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pb-4">
        {SLIDES.map((s, i) => (
          <span
            key={s.title}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-accent" : "w-1.5 bg-card-border"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 px-5 pb-8">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="h-12 flex-1 rounded-full border border-card-border text-sm font-bold text-text-primary disabled:opacity-0"
        >
          もどる
        </button>
        <button
          type="button"
          onClick={() => (isLast ? onComplete() : setIndex((i) => i + 1))}
          className="h-12 flex-1 rounded-full bg-accent text-sm font-bold text-text-primary"
        >
          {isLast ? "はじめる" : "つぎへ"}
        </button>
      </div>
    </div>
  );
}
