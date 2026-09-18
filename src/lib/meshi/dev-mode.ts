/**
 * Shortcut that skips location permission + onboarding and serves mock store
 * data instead of calling the paid Places/Routes APIs.
 *
 * Hardcoded ON for now (per request) so it's gone everywhere — local dev,
 * local prod build, and the deployed Vercel site — regardless of env vars.
 * To bring back the real location-check flow, restore the env-flag version:
 *
 *   return process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DEV_MODE === "true";
 */
export function isDevMode(): boolean {
  return true;
}
