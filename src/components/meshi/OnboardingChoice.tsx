"use client";

import { FRAME_CLASS } from "./frame";

interface OnboardingChoiceProps {
  onChoose: (wantsSlides: boolean) => void;
}

export function OnboardingChoice({ onChoose }: OnboardingChoiceProps) {
  return (
    <div className={FRAME_CLASS}>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
        <h2 className="text-lg font-bold text-text-primary">操作の説明はいりますか？</h2>
        <p className="text-sm text-text-secondary">
          スワイプでお店を選ぶ、簡単な使い方を3枚で説明します。
        </p>
        <div className="mt-4 flex w-full max-w-[260px] flex-col gap-3">
          <button
            type="button"
            onClick={() => onChoose(true)}
            className="h-12 rounded-full bg-accent text-sm font-bold text-text-primary"
          >
            はい
          </button>
          <button
            type="button"
            onClick={() => onChoose(false)}
            className="h-12 rounded-full border border-card-border text-sm font-bold text-text-primary"
          >
            いいえ
          </button>
        </div>
      </div>
    </div>
  );
}
