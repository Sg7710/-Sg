const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.primaryTypeDisplayName",
  "places.priceLevel",
  "places.photos",
  "places.location",
  "places.currentOpeningHours.openNow",
].join(",");

export interface RawPlace {
  id: string;
  displayName?: { text: string };
  primaryTypeDisplayName?: { text: string };
  priceLevel?: string;
  photos?: Array<{
    name: string;
    authorAttributions?: Array<{ displayName: string }>;
  }>;
  location?: { latitude: number; longitude: number };
  currentOpeningHours?: { openNow?: boolean };
}

/**
 * Places API (New) searchNearby. Returns only restaurants that are currently
 * open and have at least one photo — everything else is filtered out here so
 * downstream code (Routes lookup, Store mapping) never sees an unusable place.
 */
export async function searchNearbyRestaurants(
  lat: number,
  lng: number,
  radiusMeters: number,
): Promise<RawPlace[]> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_SERVER_API_KEY is not set");
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      includedTypes: ["restaurant"],
      maxResultCount: 20,
      languageCode: "ja",
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radiusMeters,
        },
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Places API error: ${res.status}`);
  }

  const data = (await res.json()) as { places?: RawPlace[] };
  const places = data.places ?? [];

  return places.filter(
    (place) =>
      place.currentOpeningHours?.openNow === true &&
      (place.photos?.length ?? 0) > 0 &&
      place.location != null,
  );
}
