"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    // 成功するとGoogleの画面へ遷移するのでここでloadingを戻す必要はない。
    // 失敗(ポップアップブロック等)した場合に備えてボタンは再度押せるようにしておく。
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="h-12 rounded-full border border-card-border bg-white text-sm font-bold text-text-primary disabled:opacity-60"
    >
      {loading ? "Googleへ移動中…" : "Googleでログイン"}
    </button>
  );
}
