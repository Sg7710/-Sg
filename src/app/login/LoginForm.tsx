"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FRAME_CLASS } from "@/components/meshi/frame";

type Stage = "email" | "sent" | "verifying";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<Stage>("email");
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get("error") === "auth"
      ? "リンクが無効か期限切れです。別のブラウザ/メールアプリでリンクを開くとこうなります。下にもう一度メールアドレスを入力して送信し、今度はリンクではなく届いたコードを入力してください。"
      : null,
  );

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email || sending) return;

    setSending(true);
    setErrorMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setSending(false);

    if (error) {
      setErrorMessage("送信に失敗しました。もう一度お試しください。");
      return;
    }
    setStage("sent");
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code || stage === "verifying") return;

    setStage("verifying");
    setErrorMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      setErrorMessage("コードが正しくないか期限切れです。もう一度お試しください。");
      setStage("sent");
      return;
    }
    // Full reload (not router.push) so the server re-checks the session cookie
    // that verifyOtp() just set, instead of reusing a stale RSC payload.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/";
  }

  return (
    <div className={FRAME_CLASS}>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
        {stage === "email" ? (
          <>
            <h2 className="text-lg font-bold text-text-primary">ログイン</h2>
            <p className="text-sm text-text-secondary">
              メールアドレスを入力すると、ログイン用のリンクと確認コードが届きます。
            </p>
            <form
              onSubmit={handleSendLink}
              className="mt-4 flex w-full max-w-[280px] flex-col gap-3"
            >
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
                disabled={sending}
                className="h-12 rounded-full bg-accent text-sm font-bold text-text-primary disabled:opacity-60"
              >
                {sending ? "送信中…" : "ログインリンクを送る"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-text-primary">メールを確認してください</h2>
            <p className="text-sm text-text-secondary">
              {email} 宛に送りました。メール内の<b>リンクを開く</b>か、
              メールに書かれた<b>6桁のコード</b>を下に入力してください
              （別のブラウザ・メールアプリで開く場合は、コード入力の方が確実です）。
            </p>
            <form
              onSubmit={handleVerifyCode}
              className="mt-4 flex w-full max-w-[280px] flex-col gap-3"
            >
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-12 rounded-full border border-card-border bg-white px-4 text-center font-mono text-lg tracking-[0.3em] text-text-primary"
              />
              <button
                type="submit"
                disabled={stage === "verifying"}
                className="h-12 rounded-full bg-accent text-sm font-bold text-text-primary disabled:opacity-60"
              >
                {stage === "verifying" ? "確認中…" : "コードで確認する"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStage("email");
                  setErrorMessage(null);
                }}
                className="text-xs font-bold text-text-tertiary"
              >
                メールアドレスを変更する
              </button>
            </form>
          </>
        )}
        {errorMessage && <p className="mt-2 text-xs text-[#D8452F]">{errorMessage}</p>}
      </div>
    </div>
  );
}
