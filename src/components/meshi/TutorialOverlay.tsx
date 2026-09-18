"use client";

import { useEffect, useState, type RefObject } from "react";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TutorialOverlayProps {
  containerRef: RefObject<HTMLDivElement | null>;
  onComplete: () => void;
}

const STEPS = [
  { target: "like", caption: "右にスワイプ、またはここをタップして「食べたい」に追加します。" },
  { target: "pass", caption: "左にスワイプ、またはここをタップでパス。次のお店に進みます。" },
  {
    target: "fav-tab",
    caption: "追加したお店はここに溜まります。あとでGoogleマップから詳細を見られます。",
  },
];

const SPOTLIGHT_PADDING = 10;

export function TutorialOverlay({ containerRef, onComplete }: TutorialOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  useEffect(() => {
    function measure() {
      const container = containerRef.current;
      if (!container) return;
      const target = container.querySelector<HTMLElement>(
        `[data-onboarding-target="${step.target}"]`,
      );
      if (!target) {
        setRect(null);
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      setRect({
        top: targetRect.top - containerRect.top,
        left: targetRect.left - containerRect.left,
        width: targetRect.width,
        height: targetRect.height,
      });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [containerRef, step.target]);

  return (
    <div className="absolute inset-0 z-40">
      {rect && (
        <div
          className="absolute rounded-2xl transition-all duration-300 ease-out"
          style={{
            top: rect.top - SPOTLIGHT_PADDING,
            left: rect.left - SPOTLIGHT_PADDING,
            width: rect.width + SPOTLIGHT_PADDING * 2,
            height: rect.height + SPOTLIGHT_PADDING * 2,
            boxShadow: "0 0 0 9999px rgba(26,24,19,0.62)",
          }}
        />
      )}

      <div className="absolute inset-x-5 top-5 flex items-center justify-between">
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <span
              key={s.target}
              className={`h-1.5 rounded-full transition-all ${
                i === stepIndex ? "w-5 bg-accent" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
        <button type="button" onClick={onComplete} className="text-xs font-bold text-white/85">
          スキップ
        </button>
      </div>

      {rect && (
        <div
          className="absolute left-1/2 w-[248px] -translate-x-1/2 rounded-2xl bg-white p-4 text-center shadow-card transition-all duration-300 ease-out"
          style={{ top: Math.max(90, rect.top - 182) }}
        >
          <p className="text-sm font-bold text-text-primary">{step.caption}</p>
          <svg
            viewBox="0 0 24 24"
            className="mx-auto mt-1 h-5 w-5 text-accent"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 4v16M5 13l7 7 7-7" />
          </svg>
          <button
            type="button"
            onClick={() => (isLast ? onComplete() : setStepIndex((i) => i + 1))}
            className="mt-2 h-10 w-full rounded-full bg-accent text-sm font-bold text-text-primary"
          >
            {isLast ? "わかった" : "つぎへ"}
          </button>
        </div>
      )}
    </div>
  );
}
