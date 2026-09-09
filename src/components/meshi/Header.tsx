"use client";

import type { LocationStatus } from "@/hooks/useLocation";

const SEARCH_RADIUS_M = 1500;

interface HeaderProps {
  locationStatus: LocationStatus;
  storeCount: number | null;
}

const STATUS_DOT: Record<LocationStatus, string> = {
  idle: "bg-text-tertiary",
  requesting: "bg-[#C8811A]",
  granted: "bg-[#2E9E63]",
  denied: "bg-[#D8452F]",
  error: "bg-[#D8452F]",
};

const STATUS_LABEL: Record<LocationStatus, string> = {
  idle: "現在地を準備しています",
  requesting: "現在地を取得しています…",
  granted: "現在地を取得しました",
  denied: "現在地の許可が必要です",
  error: "現在地を取得できませんでした",
};

export function Header({ locationStatus, storeCount }: HeaderProps) {
  return (
    <div className="shrink-0 px-5 pt-5">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[locationStatus]}`} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-text-primary">
            {STATUS_LABEL[locationStatus]}
          </p>
          {locationStatus === "granted" && (
            <p className="font-mono text-xs text-text-tertiary">
              半径{SEARCH_RADIUS_M}m
              {storeCount !== null ? ` · ${storeCount}件` : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
