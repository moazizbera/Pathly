# Pathly

Smart planning for every role.

Pathly is a role-aware productivity platform built for the Design4Future hackathon. It helps people who balance different responsibilities avoid decision fatigue by turning a messy task list into one clear next move.

## One-Line Pitch

Pathly helps students, employees, and teachers understand what to do next and why, instead of dumping everything into one generic to-do list.

## The Problem

Most planning tools are good at storing tasks but weak at helping people decide what matters first.

That becomes worse when the user is not just one type of person. A student who also works, or a teacher with admin and class prep, does not need a flat list. They need a planner that understands role context, overlap, urgency, and limited time.

## The Solution

Pathly adapts the planning experience to the user’s roles, goals, and availability.

Instead of stopping at task storage, it:

- recommends the best next action
- explains why that task matters now
- separates planning by role
- flags overlap between roles
- keeps the week visible through a role-aware calendar and task lanes

## Why It Stands Out

- Role-aware planning: supports `Student`, `Employee`, and `Teacher`
- Multi-role visibility: shows per-role tasks, suggestions, and overlaps
- Guided prioritization: promotes one next step, not just a long backlog
- Judge-ready storytelling: includes an in-app `/demo` route for presentations
- Clear UX: dashboard, suggestions, task list, and calendar now share the same role-lane language

## Core Features

- Sign up and login with Supabase Auth
- Personalized onboarding with role selection
- Profile with main goal, focus preference, and availability
- AI-style recommendation engine for the next best action
- Task creation, editing, completion, and next-week AI suggestions
- Role-specific planning lanes for Student, Employee, Teacher, Shared, and General
- Overlap detection when one task supports more than one role
- Weekly calendar with role-aware color coding
- Profile preview and judge demo route

## Multi-Role Planning

One of Pathly’s strongest differentiators is that it no longer hides multi-role behavior behind one blended dashboard.

Users can now see:

- a separate plan for each selected role
- role-specific suggestions for next week
- shared tasks that overlap across roles
- general tasks that help regardless of role
- the same role meaning carried across suggestions, task lists, and calendar items

## Demo Flow For Judges

If you are evaluating the project, the recommended walkthrough is:

1. Open `/demo` to frame the story and see the live pitch surface.
2. Show the signup flow and the three role options.
3. Open the dashboard and highlight the recommended next action.
4. Show the role-specific planning panels and overlap notices.
5. Open AI suggest for next week to show Student, Employee, Teacher, Shared, and General sections.
6. Show the task list and calendar to demonstrate that the same role system stays consistent across the product.
7. Open `/profile` to show how Pathly adapts when the user changes focus and role context.

## Hackathon Fit

Pathly is designed to perform well against common hackathon judging criteria:

- Impact: reduces decision fatigue instead of just storing tasks
- Originality: role-aware and multi-role planning is more specific than a generic productivity app
- Execution: real auth, persistence, planning logic, and deployment wiring are implemented
- UX: the interface is designed to guide, not overwhelm
- Presentation quality: the app includes a built-in demo route for storytelling

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

- `src/app` - routes, pages, and server actions
- `src/components` - reusable auth, dashboard, demo, and profile UI
- `src/lib` - Supabase clients, planning logic, and validation
- `Docs` - product planning, auth setup, deployment, and submission materials

## Local Setup

### 1. Install dependencies

```bash
npm install
```

If your network is unstable, the repo includes a local `.npmrc` with retry-friendly settings.

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### 3. Create the database schema

Run the SQL in `Docs/supabase-schema.sql` inside the Supabase SQL editor.

That creates:

- `profiles`
- `tasks`
- row level security policies for both tables

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

Pathly is wired for Cloudflare Workers using `@opennextjs/cloudflare`.

### Preview in the Workers runtime

```bash
npm run preview
```

### Required Cloudflare environment variables

Set these in Cloudflare Workers Builds or Wrangler:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### Deploy

```bash
npm run deploy
```

For Cloudflare Workers Builds:

- Build command: `npm run cf:build`
- Deploy command: `npm run cf:deploy`

Do not use `npm run build` followed by `npx wrangler deploy` in Workers Builds for this project. `npm run build` only runs the Next.js build, while Cloudflare deployment also needs the OpenNext transformation step.

Pathly currently uses `next build --webpack` for production builds so OpenNext receives the build trace artifacts it needs.

## Submission Checklist

Before submitting, make sure the README still has:

- final deployed URL
- demo video URL
- any required hackathon metadata or team details
- updated Supabase callback URL for the live domain

## Important Docs

- `Docs/submission-kit.md`
- `Docs/deployment.md`
- `Docs/auth-setup.md`
- `Docs/product-spec.md`
- `Docs/supabase-schema.sql`

## Current Status

Implemented:

- branded landing page
- in-app judge demo route
- signup and login flows
- protected dashboard and profile pages
- task creation, edit, completion, and suggestion flows
- role-aware dashboard logic
- multi-role planning with overlap visibility
- role-aware calendar and grouped task list
- Cloudflare deployment wiring with OpenNext

Remaining before final submission:

- deploy the production instance
- add final live demo links
- verify Supabase auth callbacks on the live domain
