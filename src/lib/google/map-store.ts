import type { Price, Store } from "@/types/store";
import type { RawPlace } from "./places";

function mapPriceLevel(level: string | undefined): Price | null {
  switch (level) {
    case "PRICE_LEVEL_INEXPENSIVE":
      return "¥";
    case "PRICE_LEVEL_MODERATE":
      return "¥¥";
    case "PRICE_LEVEL_EXPENSIVE":
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return "¥¥¥";
    default:
      return null;
  }
}

function photoUrlFor(photoName: string): string {
  return `/api/places/photo?name=${encodeURIComponent(photoName)}`;
}

export function mapPlaceToStore(place: RawPlace, walkMinutes: number): Store | null {
  const photo = place.photos?.[0];
  if (!photo || !place.location) return null;

  return {
    placeId: place.id,
    name: place.displayName?.text ?? "名称不明",
    genre: place.primaryTypeDisplayName?.text ?? "レストラン",
    price: mapPriceLevel(place.priceLevel),
    photoUrl: photoUrlFor(photo.name),
    photoAttribution: photo.authorAttributions?.[0]?.displayName ?? "Google",
    lat: place.location.latitude,
    lng: place.location.longitude,
    walkMinutes,
  };
}
