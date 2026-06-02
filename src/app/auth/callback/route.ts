import { NextResponse } from "next/server";

import { starterTasks } from "@/lib/dashboard-data";
import { getSupabaseSetupMessage, isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("message", getSupabaseSetupMessage());
    return NextResponse.redirect(loginUrl);
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;
      const meta = user.user_metadata ?? {};

      // Seed profile if not already present
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        const fullName: string = meta.full_name ?? user.email?.split("@")[0] ?? "there";
        const category: string = meta.category ?? "Employee";
        const mainGoal: string = meta.main_goal ?? "Clarify this week's biggest outcome.";

        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: user.id,
          full_name: fullName,
          category,
          main_goal: mainGoal,
          focus_preference: "Three meaningful priorities",
          availability: "90 minutes",
        });

        if (!profileError) {
          await supabase.from("tasks").insert(
            starterTasks(category).map((task) => ({
              user_id: user.id,
              ...task,
            })),
          );
        }
      }

      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("message", "We could not verify your email link. Please try signing in again.");

  return NextResponse.redirect(loginUrl);
}
