# Pathly

Smart planning for every role.

Pathly is a multi-role productivity platform built for the Design4Future hackathon. It helps people who live in more than one role, such as Student, Employee, and Teacher, move from a flat list of responsibilities to one clear next step.

Live app: https://pathly.maziz-abdelrahman.workers.dev/

## One-Line Pitch

Pathly helps overloaded people see what to do next, why it matters, and how that decision changes across the roles they live in.

## The Problem

Most productivity tools store tasks well but prioritize poorly.

That becomes worse when one person is balancing multiple responsibilities at once. A user might be a Student and an Employee. A Teacher might also be managing preparation, grading, and admin work in parallel. Traditional planners flatten those realities into one backlog, which increases decision fatigue and context switching.

## The Solution

Pathly is role-aware from the data model to the interface.

It keeps one shared user profile, supports multiple role profiles, assigns tasks to a specific role context, and then builds an aggregate view on top. Instead of stopping at task storage, it:

- recommends the next best action
- explains why that action matters now
- lets the user switch between focused role mode and all-roles mode
- highlights overlap and shared work across roles
- keeps the same role language across suggestions, task lists, and the weekly calendar

## Why It Stands Out

- Multi-role planning: one person can plan across Student, Employee, and Teacher without losing structure
- Role-owned tasks: tasks belong to a role context first, with aggregation happening second
- Guided prioritization: the dashboard promotes a next move instead of a flat wall of tasks
- Visible reasoning: recommendation, risk radar, and adaptive follow-up make the AI feel explainable
- Judge-ready storytelling: the app includes a built-in `/demo` route for pitch support

## Core Features

- Supabase Auth sign-up and login
- Shared account profile plus per-role profile settings
- Role switcher with focused role view and all-roles dashboard
- Manual task creation, editing, completion, and scheduling
- AI suggestions for next-week planning by role lane
- Role plans panel with overlap visibility
- Grouped task list and calendar with consistent role-aware lanes
- Profile page for updating goals, focus preferences, availability, and default active role
- In-app demo route for judges and short walkthroughs

## Current Architecture

Pathly now uses a role-aware model:

- `profiles`: one base user profile per account
- `role_profiles`: one row per selected role for the same account
- `tasks`: each task can be role-owned, shared, or general
- `active_role`: controls focused dashboard mode versus all-roles mode

This keeps the user model simple while allowing the planning engine to reason about role context correctly.

## Recommended Demo Flow

1. Open `/demo` to frame the problem and the role-aware story.
2. Show `/signup` to prove the product starts with role-aware onboarding.
3. Open `/dashboard` and highlight the recommended next move, risk radar, and follow-up guidance.
4. Use the header role switcher to compare a focused role view against `All Roles`.
5. Show the role plans panel and overlap visibility.
6. Open `AI Suggest` to show role-aware next-week suggestions.
7. Show the grouped task list and weekly calendar.
8. Open `/profile` to show how guidance changes when role context changes.

## Hackathon Fit

Pathly is designed to score well on common hackathon criteria:

- Impact: reduces decision fatigue instead of only storing tasks
- Originality: multi-role planning is more specific and defensible than a generic task manager
- Execution: real auth, persistence, server actions, role-aware planning logic, and deployment are implemented
- UX: the product is intentionally built around clarity and guided decision-making
- Presentation: the demo route and documentation support a clean judge narrative

## Built With

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth
- Supabase PostgreSQL
- Cloudflare Workers via OpenNext
- Zod

## Project Structure

- `src/app` - app routes, pages, auth flows, and server actions
- `src/components` - dashboard, demo, profile, and auth UI
- `src/lib` - Supabase helpers, planning logic, and role-context utilities
- `Docs` - product, submission, deployment, and video materials

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### 3. Create the database schema

Run the SQL in `Docs/supabase-schema.sql` inside the Supabase SQL editor.

That sets up:

- `profiles`
- `role_profiles`
- `tasks`
- row-level security policies
- indexes for role-aware planning and task deduplication

### 4. Configure Supabase Auth

- Enable Email + Password sign-in
- Add your local and deployed callback URLs
- Optionally disable mandatory email confirmation for faster demo setup

More details are in `Docs/auth-setup.md`.

### 5. Start development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Cloudflare Deployment

Pathly is configured for Cloudflare Workers using `@opennextjs/cloudflare`.

### Preview in Workers runtime

```bash
npm run preview
```

### Required environment variables

Set these in Cloudflare Workers Builds or Wrangler:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### Deploy

```bash
npm run deploy
```

For Workers Builds, these configurations work:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

or:

- Build command: `npm run cf:build`
- Deploy command: `npm run cf:deploy`

If you need the raw Next.js production build only, use `npm run next:build`.

## Important Docs

- `Docs/submission-kit.md`
- `Docs/screenshot-capture-guide.md`
- `Docs/notebooklm-video-script.md`
- `Docs/deployment.md`
- `Docs/auth-setup.md`
- `Docs/product-spec.md`
- `Docs/supabase-schema.sql`

## Final Submission Notes

Before submission, verify:

- live URL is current
- demo video URL is added where required
- Supabase auth callbacks match the production domain
- screenshot filenames match the capture guide
- NotebookLM prompt matches the final chosen screenshots
