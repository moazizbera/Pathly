"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { type AuthFormState, loginSchema, signupSchema } from "@/lib/auth/schema";
import { starterTasks } from "@/lib/dashboard-data";
import { getSupabaseSetupMessage, isSupabaseConfiguredAsync } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function resolveOrigin(headersList: Awaited<ReturnType<typeof headers>>) {
  const origin = headersList.get("origin");

  if (origin) {
    return origin;
  }

  const host = headersList.get("host");

  if (host) {
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}

export async function signUp(
  _previousState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState | undefined> {
  if (!(await isSupabaseConfiguredAsync())) {
    return { error: getSupabaseSetupMessage() };
  }

  // Handle multiple categories from checkboxes
  const categories = formData.getAll("categories") as string[];
  const categoryStr = categories.length > 0 ? categories.join(",") : "Employee";

  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    category: categoryStr,
    email: formData.get("email"),
    password: formData.get("password"),
    mainGoal: formData.get("mainGoal"),
  });

  if (!parsed.success) {
    return {
      error: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        fullName: formData.get("fullName") as string,
        category: categoryStr,
        email: formData.get("email") as string,
        mainGoal: formData.get("mainGoal") as string,
      },
    };
  }

  const supabase = await createClient();
  const requestHeaders = await headers();
  const redirectOrigin = resolveOrigin(requestHeaders);

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${redirectOrigin}/auth/callback`,
      data: {
        full_name: parsed.data.fullName,
        category: parsed.data.category,
        main_goal: parsed.data.mainGoal,
      },
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  // Supabase returns a fake success for duplicate emails (anti-enumeration).
  // An empty `identities` array is the reliable signal that the email is already taken.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return {
      error: "An account with this email already exists. Sign in instead.",
      fieldErrors: { email: ["This email is already registered."] },
      values: {
        fullName: parsed.data.fullName,
        category: categoryStr,
        email: parsed.data.email,
        mainGoal: parsed.data.mainGoal,
      },
    };
  }

  if (!data.session) {
    return {
      success: `Account created. We sent a verification link to ${parsed.data.email}. Confirm that address before signing in.`,
      verificationEmail: parsed.data.email,
      values: {
        fullName: parsed.data.fullName,
        category: parsed.data.category,
        email: parsed.data.email,
        mainGoal: parsed.data.mainGoal,
      },
    };
  }

  if (!data.user) {
    return {
      error: "Account created, but profile setup could not start automatically. Please sign in to continue.",
    };
  }

  const user = data.user;

  const profilePayload = {
    user_id: user.id,
    full_name: parsed.data.fullName,
    category: parsed.data.category,
    main_goal: parsed.data.mainGoal,
    focus_preference: "Three meaningful priorities",
    availability: "90 minutes",
  };

  const { error: profileError } = await supabase.from("profiles").upsert(profilePayload, {
    onConflict: "user_id",
  });

  if (!profileError) {
    await supabase.from("tasks").insert(
      starterTasks(parsed.data.category).map((task) => ({
        user_id: user.id,
        ...task,
      })),
    );
  }

  redirect("/dashboard");
}

export async function signIn(
  _previousState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState | undefined> {
  if (!(await isSupabaseConfiguredAsync())) {
    return { error: getSupabaseSetupMessage() };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  redirect("/dashboard");
}

export async function resendVerificationEmail(
  _previousState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState | undefined> {
  if (!(await isSupabaseConfiguredAsync())) {
    return { error: getSupabaseSetupMessage() };
  }

  const email = String(formData.get("email") ?? "").trim();

  const parsed = loginSchema.pick({ email: true }).safeParse({ email });

  if (!parsed.success) {
    return {
      error: "Enter a valid email address before requesting another verification link.",
      verificationEmail: email,
    };
  }

  const supabase = await createClient();
  const requestHeaders = await headers();
  const redirectOrigin = resolveOrigin(requestHeaders);

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${redirectOrigin}/auth/callback`,
    },
  });

  if (error) {
    return {
      error: error.message,
      verificationEmail: parsed.data.email,
    };
  }

  return {
    success: `Verification email resent to ${parsed.data.email}.`,
    verificationEmail: parsed.data.email,
  };
}

export async function signOut() {
  if (!(await isSupabaseConfiguredAsync())) {
    redirect("/login?message=Supabase+setup+is+still+required+before+auth+can+run.");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
