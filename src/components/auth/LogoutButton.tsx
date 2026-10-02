"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // フルリロードでサーバー側のセッションCookieを再評価させ、/login のガードに任せる。
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="shrink-0 rounded-full border border-card-border px-3 py-1 text-xs font-bold text-text-secondary disabled:opacity-60"
    >
      {loading ? "…" : "ログアウト"}
    </button>
  );
}
