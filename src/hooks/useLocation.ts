"use client";

import { useCallback, useState } from "react";

export type LocationStatus = "idle" | "requesting" | "granted" | "denied" | "error";

export interface Coords {
  lat: number;
  lng: number;
}

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 15_000,
};

export function useLocation() {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [coords, setCoords] = useState<Coords | null>(null);

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus("granted");
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
      },
      GEOLOCATION_OPTIONS,
    );
  }, []);

  return { status, coords, request };
}
