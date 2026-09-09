export type Price = "¥" | "¥¥" | "¥¥¥";

export interface Store {
  placeId: string;
  name: string;
  genre: string;
  price: Price | null;
  photoUrl: string;
  photoAttribution: string;
  lat: number;
  lng: number;
  walkMinutes: number;
}
