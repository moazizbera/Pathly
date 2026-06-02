import Link from "next/link";

type SetupPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
};

const setupSteps = [
  "Create .env.local from .env.example.",
  "Add your Supabase URL and publishable key.",
  "Run Docs/supabase-schema.sql in Supabase SQL editor.",
  "Restart the app and open this route again.",
];

export function SetupPanel({ eyebrow, title, description, backHref, backLabel }: SetupPanelProps) {
  return (
    <main className="hero-grid min-h-screen px-6 py-6 sm:px-10 lg:px-14">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="glass-card rounded-4xl p-8 sm:p-10">
          <Link href={backHref} className="text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors">
            {backLabel}
          </Link>
          <p className="mt-8 text-sm font-semibold tracking-[0.22em] text-rose-400 uppercase">{eyebrow}</p>
          <h1 className="font-display mt-3 text-5xl leading-[0.95] text-slate-100 sm:text-6xl">{title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">{description}</p>
        </section>

        <section className="glass-card rounded-4xl p-8 sm:p-10">
          <p className="text-sm font-semibold tracking-[0.22em] text-slate-500 uppercase">Setup mode</p>
          <div className="mt-6 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm leading-7 text-amber-200">
            Pathly can already render the product shell, but auth and saved task data stay disabled until Supabase is wired.
          </div>

          <div className="mt-6 space-y-4">
            {setupSteps.map((step, index) => (
              <div key={step} className="rounded-3xl border border-slate-700/40 bg-slate-800/30 p-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-cyan-600 text-sm font-semibold text-slate-950">
                    0{index + 1}
                  </div>
                  <p className="pt-2 text-sm leading-7 text-slate-400">{step}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-cyan-500/25 bg-cyan-500/10 p-5 text-sm leading-7 text-cyan-300">
            After setup, this route will switch from setup mode to the full authenticated Pathly experience automatically.
          </div>
        </section>
      </div>
    </main>
  );
}