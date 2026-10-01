import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDevMode } from "@/lib/meshi/dev-mode";
import { SignupForm } from "./SignupForm";

export default async function SignupPage() {
  if (!isDevMode()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/");
  }

  return <SignupForm />;
}
