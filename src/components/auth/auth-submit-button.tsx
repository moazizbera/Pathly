"use client";

import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
};

export function AuthSubmitButton({ idleLabel, pendingLabel }: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-linear-to-r from-cyan-500 to-cyan-600 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.4)] transition-all hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] disabled:opacity-50"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
