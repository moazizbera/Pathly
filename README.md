# Pathly

Smart planning for every role.

Pathly is a role-aware productivity platform built for the Design4Future hackathon. Instead of treating every user the same, Pathly adapts its planning experience for students, employees, and teachers, helping each person understand what to do next and why.

## What Pathly Does

- Supports sign up and login with Supabase Auth
- Creates a role-aware productivity experience based on category
- Protects the dashboard behind authentication
- Stores profile and task data in Supabase
- Recommends a best next action instead of showing only a flat to-do list
- Seeds starter tasks and profile context to make the first-run experience stronger
- Includes an in-app `/demo` walkthrough for hackathon judges and live presentations

## Product Direction

Pathly is built around one core idea:

> People do not just need a list of everything they should do. They need a clear next step that matches their role, time, and context.

Current supported roles:

- Student
- Employee
- Teacher

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth
- Supabase PostgreSQL
- Cloudflare Workers via OpenNext
- Zod

## Project Structure

- `src/app` - routes, pages, server actions
- `src/components` - reusable auth and dashboard UI
- `src/lib` - Supabase clients, dashboard data logic, validation
- `Docs` - product planning, auth setup, MVP notes, Supabase schema

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

## Cloudflare Deploy

Pathly is now wired for Cloudflare Workers using `@opennextjs/cloudflare`.

### Local Workers preview

```bash
npm run preview
```

This builds the app with OpenNext and runs it locally in the Cloudflare Workers runtime.

### Required Cloudflare environment variables

Set these in Cloudflare Workers Builds or Wrangler:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### Deploy command

```bash
npm run deploy
```

For Cloudflare Workers Builds:

- Build command: `npx @opennextjs/cloudflare build`
- Deploy command: `npx @opennextjs/cloudflare deploy`

Pathly currently uses `next build --webpack` for production builds so the OpenNext adapter receives the trace artifacts it needs for Cloudflare deployment.

## Current Flow

1. User lands on a branded homepage
2. User can open `/demo` for a guided judge walkthrough of the product story
3. User signs up and chooses a category
4. Auth metadata is stored with Supabase
5. Dashboard creates or restores a profile
6. Starter tasks are seeded if needed
7. Pathly highlights the best next action and a category-specific coach message

## Important Docs

- `Docs/analysis.md`
- `Docs/product-spec.md`
- `Docs/mvp-plan.md`
- `Docs/tech-stack.md`
- `Docs/auth-setup.md`
- `Docs/deployment.md`
- `Docs/submission-kit.md`
- `Docs/supabase-schema.sql`

## Current Status

Implemented:

- branded landing page
- in-app judge demo route
- signup and login flows
- protected dashboard
- Supabase SSR auth structure
- profile and task schema
- task creation and completion
- recommendation and coach messaging
- urgency-based dashboard lanes
- weekly progress strip
- live profile preview

In progress:

- submission packaging and publishing
- production environment setup in Cloudflare with live Supabase credentials

Next:

- deploy the app to Cloudflare Workers with production Supabase credentials
- finalize the live demo data and submission materials

## Hackathon Fit

Pathly is designed to score well across the Design4Future judging criteria:

- Impact and originality: role-aware productivity instead of a generic planner
- Functionality and build quality: realistic architecture with clear scope
- Design and UX: calm, guided interface centered on one actionable next step
