"use client";

import { useState } from "react";
import { FRAME_CLASS } from "./frame";

interface OnboardingSlidesProps {
  onComplete: () => void;
}

const SLIDES = [
  { icon: "👉👍", title: "右にスワイプ", body: "気になったお店は右にスワイプして「食べたい」に追加します。" },
  { icon: "👈❌", title: "左にスワイプ", body: "気にならなければ左にスワイプ、またはパスして次のお店へ。" },
  {
    icon: "🗺️",
    title: "食べたいリストから",
    body: "追加したお店は「食べたいリスト」タブに溜まります。そこからGoogleマップで詳細や道順を確認できます。",
  },
];

export function OnboardingSlides({ onComplete }: OnboardingSlidesProps) {
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  return (
    <div className={FRAME_CLASS}>
      <div className="flex justify-end px-5 pt-5">
        <button
          type="button"
          onClick={onComplete}
          className="text-xs font-bold text-text-tertiary"
        >
          スキップ
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="text-5xl">{slide.icon}</div>
        <h2 className="mt-2 text-lg font-bold text-text-primary">{slide.title}</h2>
        <p className="text-sm text-text-secondary">{slide.body}</p>
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
