"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FRAME_CLASS } from "@/components/meshi/frame";

type Status = "idle" | "sending" | "sent" | "error";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>(
    searchParams.get("error") === "auth" ? "error" : "idle",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "sending") return;

    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className={FRAME_CLASS}>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
        {status === "sent" ? (
          <>
            <h2 className="text-lg font-bold text-text-primary">メールを確認してください</h2>
            <p className="text-sm text-text-secondary">
              {email} にログイン用のリンクを送りました。メール内のリンクを開くとログインできます。
            </p>
            <p className="mt-1 text-xs text-text-tertiary">
              ※ メールを開くのと同じブラウザでリンクを開いてください。
            </p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-text-primary">ログイン</h2>
            <p className="text-sm text-text-secondary">
              メールアドレスを入力すると、ログイン用のリンクが届きます。
            </p>
            <form onSubmit={handleSubmit} className="mt-4 flex w-full max-w-[280px] flex-col gap-3">
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-full border border-card-border bg-white px-4 text-center text-sm text-text-primary"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="h-12 rounded-full bg-accent text-sm font-bold text-text-primary disabled:opacity-60"
              >
                {status === "sending" ? "送信中…" : "ログインリンクを送る"}
              </button>
              {status === "error" && (
                <p className="text-xs text-[#D8452F]">
                  {searchParams.get("error") === "auth"
                    ? "リンクが無効か期限切れです。メールを送ったのと同じブラウザでリンクを開いているか確認し、もう一度お試しください。"
                    : "送信に失敗しました。もう一度お試しください。"}
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
