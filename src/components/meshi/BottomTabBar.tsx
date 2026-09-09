"use client";

type Tab = "swipe" | "fav";

interface BottomTabBarProps {
  tab: Tab;
  favCount: number;
  onChange: (tab: Tab) => void;
}

export function BottomTabBar({ tab, favCount, onChange }: BottomTabBarProps) {
  return (
    <div className="flex shrink-0 gap-2 border-t border-card-border p-3">
      <button
        type="button"
        onClick={() => onChange("swipe")}
        className={`h-12 flex-1 rounded-full text-sm font-bold ${
          tab === "swipe" ? "bg-tab-active text-text-primary" : "text-text-secondary"
        }`}
      >
        スワイプ
      </button>
      <button
        type="button"
        onClick={() => onChange("fav")}
        className={`relative h-12 flex-1 rounded-full text-sm font-bold ${
          tab === "fav" ? "bg-tab-active text-text-primary" : "text-text-secondary"
        }`}
      >
        食べたいリスト
        {favCount > 0 && (
          <span className="absolute right-4 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 font-mono text-[11px] font-bold text-text-primary">
            {favCount}
          </span>
        )}
      </button>
    </div>
  );
}
