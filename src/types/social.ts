export interface Person {
  id: string;
  name: string;
  color: string;
  wantIds: string[];
}

export interface LikeEntry {
  placeId: string;
  likedAt: number;
}
