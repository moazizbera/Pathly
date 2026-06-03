"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { setActiveRole } from "@/app/actions/dashboard";
import { activeRoleLabel, type ActiveRole, type SupportedRole } from "@/lib/role-context";

type RoleSwitcherProps = {
  activeRole: ActiveRole;
  availableRoles: SupportedRole[];
};

export function RoleSwitcher({ activeRole, availableRoles }: RoleSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const options: ActiveRole[] = ["all", ...availableRoles];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((option) => {
        const isActive = option === activeRole;

        return (
          <button
            key={option}
            type="button"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await setActiveRole(option);
                router.refresh();
              });
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? "border-cyan-400/60 bg-cyan-500/12 text-cyan-100"
                : "border-slate-700/40 bg-slate-800/35 text-slate-300 hover:border-cyan-500/35 hover:text-cyan-200"
            } disabled:opacity-60`}
          >
            {activeRoleLabel(option)}
          </button>
        );
      })}
    </div>
  );
}