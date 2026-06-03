import type React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/app/actions/auth";
import { AddTaskDialog } from "@/components/dashboard/add-task-dialog";
import { AgentActionsPanel } from "@/components/dashboard/agent-actions-panel";
import { IdeasPad } from "@/components/dashboard/ideas-pad";
import { TaskListPanel } from "@/components/dashboard/task-list-panel";
import { WeekCalendar } from "@/components/dashboard/week-calendar";
import { LiveClock } from "@/components/dashboard/live-clock";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";
import { SetupPanel } from "@/components/setup/setup-panel";
import { getDashboardData } from "@/lib/dashboard-data";
import { isSupabaseConfiguredAsync } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default function DashboardPage() {
  return <DashboardContent />;
}

async function DashboardContent() {
  if (!(await isSupabaseConfiguredAsync())) {
    return (
      <SetupPanel
        eyebrow="Dashboard setup"
        title="Finish backend setup to unlock the live Pathly dashboard."
        description="Add your Supabase keys to .env.local to activate auth and database features."
        backHref="/"
        backLabel="Back to home"
      />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dashboardData = await getDashboardData(supabase, user);
  const {
    profile,
    activeRole,
    availableRoles,
    progress,
    recommendation,
    mainObjective,
    agenda,
    aiRole,
    aiBrief,
    tasks,
    rolePlans,
    roleOverlaps,
    setupHint,
  } = dashboardData;

  return (
    <DashboardWrapper 
      user={user}
      profile={profile} 
      activeRole={activeRole}
      availableRoles={availableRoles}
      progress={progress}
      recommendation={recommendation}
      mainObjective={mainObjective}
      agenda={agenda}
      aiRole={aiRole}
      aiBrief={aiBrief}
      tasks={tasks}
      rolePlans={rolePlans}
      roleOverlaps={roleOverlaps}
      setupHint={setupHint}
    />
  );
}