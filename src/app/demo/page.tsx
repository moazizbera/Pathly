import Link from "next/link";

import { JudgeSandbox } from "@/components/demo/judge-sandbox";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const demoSteps = [
  {
    step: "01",
    title: "Start with the person, not the task list",
    judgeView: "Open Pathly and show that onboarding begins with role selection instead of a generic planner template.",
    whyItMatters: "This is the moment judges understand the product is adaptive by design, not just branded for different users.",
  },
  {
    step: "02",
    title: "Capture one real weekly outcome",
    judgeView: "Set a concrete main goal and explain that Pathly uses it as a planning anchor across the dashboard.",
    whyItMatters: "It frames the app as a decision tool rather than simple task storage.",
  },
  {
    step: "03",
    title: "Reveal the guided dashboard",
    judgeView: "Show the best next action, coach note, and focus insights in one screen.",
    whyItMatters: "This is the clearest demonstration of reduced overwhelm and recommendation quality.",
  },
  {
    step: "04",
    title: "Change the profile and watch the guidance adapt",
    judgeView: "Open profile settings and use the live preview to show that role and focus changes reshape the recommendation engine.",
    whyItMatters: "It proves personalization affects behavior, not just labels.",
  },
  {
    step: "05",
    title: "Close on impact",
    judgeView: "Summarize how Student, Employee, and Teacher all see the same engine through different priorities.",
    whyItMatters: "It lands the broader market potential without bloating the MVP scope.",
  },
];

const roleScenes = [
  {
    role: "Student",
    signal: "Exam pressure",
    tone: "badge-cyan",
    scenario: "A student opens Pathly the week of exams and instantly sees revision prep before lower-stakes homework.",
  },
  {
    role: "Employee",
    signal: "Meeting pressure",
    tone: "badge-emerald",
    scenario: "An employee is steered toward the task that unlocks a meeting outcome instead of reacting to inbox noise.",
  },
  {
    role: "Teacher",
    signal: "Prep pressure",
    tone: "badge-indigo",
    scenario: "A teacher sees tomorrow's lesson prep rise above grading backlog because classroom readiness matters first.",
  },
];

const talkingPoints = [
  "Most productivity tools store everything but guide nothing.",
  "Pathly reduces decision fatigue by identifying one best next move from role, time, and current priorities.",
  "The same core engine scales across categories without turning the MVP into three separate products.",
];

const scorecard = [
  {
    criterion: "Impact and originality",
    evidence: "Pathly solves the overload problem with role-aware planning rather than another generic task list.",
    proof: "Student, Employee, and Teacher each surface different priorities through the same product flow.",
    tone: "border-cyan-500/30 bg-cyan-500/5",
  },
  {
    criterion: "Functionality and build quality",
    evidence: "The product includes auth, profile persistence, task workflows, recommendation logic, and setup-aware fallbacks.",
    proof: "Judges can see both the live flow and the guided setup mode without the app breaking in incomplete environments.",
    tone: "border-emerald-500/30 bg-emerald-500/5",
  },
  {
    criterion: "Design and user experience",
    evidence: "The interface stays focused on one next action, a calm dashboard, and visible personalization feedback.",
    proof: "The live profile preview demonstrates that changing user context immediately changes the product's guidance.",
    tone: "border-indigo-500/30 bg-indigo-500/5",
  },
];

const judgeMagnetCards = [
  {
    title: "Visible AI reasoning",
    summary: "Judges can see why the next task wins, which turns the AI from a claim into evidence.",
    accent: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
  },
  {
    title: "Multi-role planning",
    summary: "One person can be a student and an employee at the same time, and the system now plans for both instead of forcing one label.",
    accent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  },
  {
    title: "Live, not hypothetical",
    summary: "Auth, profile persistence, agenda ordering, recovery plans, and AI guidance already work in a real product flow.",
    accent: "border-indigo-500/30 bg-indigo-500/10 text-indigo-200",
  },
];

const judgeAnswers = [
  "If they ask about innovation: say Pathly is not another task manager, it is a role-aware decision engine for overloaded people.",
  "If they ask about feasibility: show signup, change roles, and let the dashboard reorder in real time.",
  "If they ask about impact: explain that reducing decision fatigue matters before productivity can improve.",
  "If they ask about business potential: point out that one orchestration engine already serves students, employees, teachers, and mixed-role users.",
];

const submissionHighlights = [
  {
    label: "Problem",
    value: "Generic productivity tools create overload because they store everything but prioritize nothing.",
  },
  {
    label: "Solution",
    value: "Pathly adapts planning by role and recommends one next move instead of another flat task wall.",
  },
  {
    label: "Why it stands out",
    value: "The same product flow works for Students, Employees, and Teachers without fragmenting into separate apps.",
  },
  {
    label: "Built with",
    value: "Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase Auth, PostgreSQL, and Zod.",
  },
];

export default function DemoPage() {
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <main className="hero-grid min-h-screen px-6 py-6 sm:px-10 lg:px-14">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="glass-card flex flex-col gap-5 rounded-4xl p-6 sm:p-8 border-indigo-500/20">
          <div>
            <Link href="/" className="text-sm font-semibold text-slate-400 hover:text-indigo-300 transition-colors">
              Back to home
            </Link>
            <p className="mt-6 text-sm font-semibold tracking-[0.22em] text-indigo-300 uppercase">Judge demo mode</p>
            <h1 className="font-display mt-3 max-w-4xl text-4xl leading-tight text-slate-100 sm:text-5xl">
              A guided Pathly walkthrough built for a 2-minute hackathon demo.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
              This page gives you the exact story to tell: why Pathly matters, what judges should notice on each screen, and how to land the role-aware recommendation moment quickly.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={supabaseConfigured ? "/signup" : "/dashboard"}
              className="rounded-full bg-linear-to-r from-indigo-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-slate-100 shadow-[0_0_24px_rgba(99,102,241,0.4)] transition-all hover:shadow-[0_0_40px_rgba(99,102,241,0.6)]"
            >
              {supabaseConfigured ? "Run live demo" : "Open setup-aware preview"}
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-500/20 transition-all"
            >
              Open dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card rounded-4xl p-6 sm:p-8 border-cyan-500/20">
            <p className="text-sm font-semibold tracking-[0.22em] text-slate-400 uppercase">Opening line</p>
            <blockquote className="font-display mt-4 text-3xl leading-tight text-slate-100 sm:text-4xl">
              Productivity tools usually ask people to manage everything. Pathly starts by helping them decide what matters first.
            </blockquote>
            <div className="mt-6 rounded-3xl border border-cyan-500/20 bg-linear-to-r from-slate-800 to-slate-900 p-5 text-sm leading-7 text-slate-200">
              Use this line before clicking anywhere. It sets up the problem and makes the dashboard recommendation feel like the answer instead of just another feature.
            </div>
          </div>

          <div className="glass-card rounded-4xl p-6 sm:p-8">
            <p className="text-sm font-semibold tracking-[0.22em] text-slate-500 uppercase">Live status</p>
            <div className={`mt-5 rounded-3xl border p-5 ${supabaseConfigured ? "border-emerald-500/30 bg-emerald-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Current environment</p>
              <p className="mt-3 text-2xl font-semibold text-slate-100">
                {supabaseConfigured ? "Supabase is connected for a live account flow." : "Setup mode is active, but the product story is fully demoable."}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {supabaseConfigured
                  ? "Show real signup, profile persistence, and task updates."
                  : "Use the dashboard and profile preview to show the full UX without backend wiring blocking the presentation."}
              </p>
            </div>
            <div className="mt-6 rounded-4xl border border-slate-700/40 bg-slate-800/30 p-5 text-sm leading-7 text-slate-400">
              <p className="font-semibold text-slate-200">Demo note</p>
              <p className="mt-3">
                If Supabase is not configured yet, walk judges through the user experience with the setup-aware preview and the profile editor.
              </p>
            </div>
          </div>
        </section>

        <JudgeSandbox />

        <section className="glass-card rounded-4xl p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.22em] text-slate-500 uppercase">Demo script</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-100">Five moments to show in order</h2>
            </div>
            <p className="text-sm text-slate-400">Designed to fit a sharp 2 to 3 minute walkthrough.</p>
          </div>

          <div className="mt-8 grid gap-4">
            {demoSteps.map((item) => (
              <article key={item.step} className="rounded-4xl border border-slate-700/40 bg-slate-800/20 p-5 sm:p-6">
                <div className="grid gap-5 lg:grid-cols-[0.18fr_0.82fr]">
                  <div className="text-sm font-semibold tracking-[0.22em] text-rose-400 uppercase">{item.step}</div>
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-100">{item.title}</h3>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-3xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-sm leading-7 text-slate-200">
                        <p className="text-xs font-semibold tracking-[0.18em] text-indigo-300 uppercase">What to show</p>
                        <p className="mt-3">{item.judgeView}</p>
                      </div>
                      <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-4 text-sm leading-7 text-slate-400">
                        <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Why it matters</p>
                        <p className="mt-3">{item.whyItMatters}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-card rounded-4xl p-6 sm:p-8">
            <p className="text-sm font-semibold tracking-[0.22em] text-slate-500 uppercase">Role snapshots</p>
            <div className="mt-6 space-y-4">
              {roleScenes.map((scene) => (
                <article key={scene.role} className="rounded-3xl border border-slate-700/40 bg-slate-800/30 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-100">{scene.role}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-400">{scene.scenario}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${scene.tone}`}>{scene.signal}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-4xl p-6 sm:p-8">
            <p className="text-sm font-semibold tracking-[0.22em] text-slate-500 uppercase">Talking points</p>
            <div className="mt-6 space-y-4">
              {talkingPoints.map((point, index) => (
                <div key={point} className="rounded-3xl border border-cyan-500/25 bg-cyan-500/10 p-5 text-slate-200">
                  <p className="text-xs font-semibold tracking-[0.18em] text-cyan-400 uppercase">Point 0{index + 1}</p>
                  <p className="mt-3 text-base leading-8">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-card rounded-4xl p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.22em] text-slate-500 uppercase">Judge scorecard</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-100">How to connect the demo to scoring criteria</h2>
            </div>
            <p className="text-sm text-slate-400">Use these points when the judges ask why this product deserves to win.</p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {scorecard.map((item) => (
              <article key={item.criterion} className={`rounded-4xl p-5 ${item.tone}`}>
                <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">{item.criterion}</p>
                <p className="mt-4 text-lg font-semibold leading-8 text-slate-100">{item.evidence}</p>
                <div className="mt-4 rounded-3xl border border-slate-700/40 bg-slate-800/30 p-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">Proof in the product</p>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{item.proof}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-card rounded-4xl p-6 sm:p-8">
            <p className="text-sm font-semibold tracking-[0.22em] text-slate-500 uppercase">What judges remember</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-100">Three proof points worth calling out explicitly</h2>

            <div className="mt-6 space-y-4">
              {judgeMagnetCards.map((item) => (
                <article key={item.title} className={`rounded-3xl border p-5 ${item.accent}`}>
                  <h3 className="text-lg font-semibold text-slate-100">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.summary}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-4xl p-6 sm:p-8 border-cyan-500/20">
            <p className="text-sm font-semibold tracking-[0.22em] text-cyan-300 uppercase">High-scoring answers</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-100">Use these when judges push deeper</h2>

            <div className="mt-6 space-y-4">
              {judgeAnswers.map((answer, index) => (
                <article key={answer} className="rounded-3xl border border-slate-700/40 bg-slate-800/30 p-5">
                  <p className="text-xs font-semibold tracking-[0.18em] text-cyan-300 uppercase">Answer 0{index + 1}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{answer}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-5">
              <p className="text-xs font-semibold tracking-[0.18em] text-cyan-300 uppercase">Best live move</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                Open the dashboard and use the AI action center to generate the 90-second judge pitch from live user data.
              </p>
            </div>
          </div>
        </section>

        <section className="glass-card rounded-4xl p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
          <p className="text-sm font-semibold tracking-[0.22em] text-slate-500 uppercase">Submission highlights</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-100">The one-screen summary for judges</h2>
            </div>
            <p className="text-sm text-slate-400">Useful when you need to summarize Pathly in under 20 seconds.</p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {submissionHighlights.map((item, index) => {
              const tone =
                index === 0
                  ? "border border-rose-500/25 bg-rose-500/10"
                  : index === 1
                    ? "border border-emerald-500/25 bg-emerald-500/10"
                    : index === 2
                      ? "border border-indigo-500/25 bg-indigo-500/10"
                      : "border border-slate-700/40 bg-slate-800/30";

              return (
                <article key={item.label} className={`rounded-4xl p-5 ${tone}`}>
                  <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">{item.label}</p>
                  <p className="mt-4 text-base leading-8 text-slate-100">{item.value}</p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}