/**
 * Local-development-only shortcut: skips location permission + onboarding and
 * serves mock store data instead of calling the paid Places/Routes APIs.
 *
 * Gated on NODE_ENV === "development" as well as the flag itself, so a
 * forgotten NEXT_PUBLIC_DEV_MODE=true can never leak into a production build
 * (next build / a deployed site always has NODE_ENV === "production").
 */
export function isDevMode(): boolean {
  return process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_DEV_MODE === "true";
}
