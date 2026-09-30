import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDevMode } from "@/lib/meshi/dev-mode";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (!isDevMode()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/");
  }

  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
