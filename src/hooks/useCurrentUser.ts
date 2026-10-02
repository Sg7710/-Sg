"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isDevMode } from "@/lib/meshi/dev-mode";

interface CurrentUser {
  name: string;
  email: string | null;
}

const DEV_USER: CurrentUser = { name: "ゲスト", email: null };

export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<CurrentUser>(DEV_USER);

  useEffect(() => {
    if (isDevMode()) return;
    let cancelled = false;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled || !data.user) return;
      const meta = data.user.user_metadata as
        | { full_name?: string; name?: string }
        | undefined;
      const name = meta?.full_name || meta?.name || data.user.email?.split("@")[0] || "ユーザー";
      setUser({ name, email: data.user.email ?? null });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return user;
}
