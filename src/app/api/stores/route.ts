import { NextResponse } from "next/server";
import { searchNearbyRestaurants } from "@/lib/google/places";
import { computeWalkMinutes } from "@/lib/google/routes";
import { mapPlaceToStore } from "@/lib/google/map-store";
import type { Store } from "@/types/store";

const DEFAULT_RADIUS_M = 1500;

export async function POST(request: Request) {
  let body: { lat?: number; lng?: number; radius?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  const { lat, lng, radius = DEFAULT_RADIUS_M } = body;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "lat/lng is required" }, { status: 400 });
  }

  try {
    const places = await searchNearbyRestaurants(lat, lng, radius);
    if (places.length === 0) {
      return NextResponse.json({ stores: [] });
    }

    // `places` and `destinations` must stay index-aligned — computeWalkMinutes
    // returns results keyed by position in `destinations`.
    const destinations = places.map((place) => ({
      lat: place.location!.latitude,
      lng: place.location!.longitude,
    }));
    const walkMinutesByIndex = await computeWalkMinutes({ lat, lng }, destinations);

    const stores = places
      .map((place, index) => {
        const walkMinutes = walkMinutesByIndex.get(index);
        if (walkMinutes === undefined) return null;
        return mapPlaceToStore(place, walkMinutes);
      })
      .filter((store): store is Store => store !== null);

    return NextResponse.json({ stores });
  } catch (err) {
    console.error("[api/stores]", err);
    return NextResponse.json({ error: "failed to fetch stores" }, { status: 502 });
  }
}
