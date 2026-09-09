interface RouteMatrixElement {
  destinationIndex: number;
  duration?: string; // e.g. "634s"
  condition?: string; // "ROUTE_EXISTS" | "ROUTE_NOT_FOUND" | ...
}

/**
 * Routes API computeRouteMatrix, one origin (current location) to many
 * destinations, walking mode. Returns walk minutes keyed by the destination's
 * index in the `destinations` array — callers must keep that ordering.
 * Destinations Google couldn't route to are simply absent from the map.
 */
export async function computeWalkMinutes(
  origin: { lat: number; lng: number },
  destinations: { lat: number; lng: number }[],
): Promise<Map<number, number>> {
  const result = new Map<number, number>();
  if (destinations.length === 0) return result;

  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_SERVER_API_KEY is not set");
  }

  const res = await fetch("https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "originIndex,destinationIndex,duration,condition",
    },
    body: JSON.stringify({
      origins: [
        { waypoint: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } } },
      ],
      destinations: destinations.map((d) => ({
        waypoint: { location: { latLng: { latitude: d.lat, longitude: d.lng } } },
      })),
      travelMode: "WALK",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Routes API error: ${res.status}`);
  }

  const elements = (await res.json()) as RouteMatrixElement[];
  for (const el of elements) {
    if (el.condition !== "ROUTE_EXISTS" || !el.duration) continue;
    const seconds = Number(el.duration.replace("s", ""));
    result.set(el.destinationIndex, Math.round(seconds / 60));
  }
  return result;
}
