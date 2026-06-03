import { categoryOptions } from "@/lib/auth/schema";

export type SupportedRole = (typeof categoryOptions)[number];
export type ActiveRole = SupportedRole | "all";
export type TaskLaneValue = "role" | "shared" | "general";

export type RoleProfileSnapshot = {
  id: string;
  role: SupportedRole;
  mainGoal: string;
  focusPreference: string;
  availability: string;
  isDerived?: boolean;
};

export function isSupportedRole(value: string): value is SupportedRole {
  return categoryOptions.includes(value as SupportedRole);
}

export function normalizeActiveRole(value: string | null | undefined, availableRoles: SupportedRole[]): ActiveRole {
  if (value === "all") {
    return "all";
  }

  if (value && isSupportedRole(value) && availableRoles.includes(value)) {
    return value;
  }

  return "all";
}

export function activeRoleLabel(activeRole: ActiveRole) {
  return activeRole === "all" ? "All Roles" : activeRole;
}