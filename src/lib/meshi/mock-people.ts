import type { Person } from "@/types/social";

/**
 * 「一緒に行く人」のモックデータ。友人/グループ機能は未設計のため、
 * ハンドオフ仕様書の例示通り3人を固定で使う(みんなビューの動作確認用)。
 */
export const MOCK_PEOPLE: Person[] = [
  { id: "yuki", name: "ゆき", color: "#D98B6A", wantIds: ["mock-1", "mock-3", "mock-5"] },
  { id: "ken", name: "けん", color: "#6F94B8", wantIds: ["mock-1", "mock-2", "mock-7"] },
  { id: "mai", name: "まい", color: "#8CA86A", wantIds: ["mock-3", "mock-4", "mock-6"] },
];
