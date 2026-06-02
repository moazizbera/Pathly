# Technical Direction

## Recommended Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend and Data

- Supabase
- PostgreSQL
- Supabase Auth

### AI and Integrations

- OpenAI API for task breakdown and next-step suggestions

### Hosting

- Vercel for frontend deployment
- Supabase for backend hosting and database

## Why This Stack

- Fast to build within a hackathon timeline
- Strong support for authentication and database setup
- Good developer experience for rapid iteration
- Easy deployment and demo preparation

## High-Level Architecture

1. The client handles onboarding, dashboards, and task management.
2. Supabase Auth manages sign-up and login.
3. PostgreSQL stores users, profiles, tasks, goals, and plans.
4. Server-side API routes generate role-aware recommendations.
5. AI is used selectively for breakdowns and guidance, not basic CRUD.

## Core Data Model

### users

- id
- email
- created_at

### profiles

- id
- user_id
- full_name
- category
- bio
- availability
- focus_preference
- main_goal
- metadata_json

### goals

- id
- user_id
- title
- description
- target_date
- status

### tasks

- id
- user_id
- goal_id
- title
- description
- due_date
- priority
- estimated_minutes
- status
- category_context

### plans

- id
- user_id
- plan_date
- recommended_task_id
- explanation
- created_at

## Category Modeling Strategy

Use one shared `profiles` table with a flexible `metadata_json` field for category-specific information.

Examples:

- Student: subjects, exam_dates, course_name
- Employee: company, role_title, work_hours
- Teacher: subjects_taught, class_schedule, grading_load

This keeps the MVP schema simple while preserving room for later normalization.

## Recommendation Engine Strategy

Start with a transparent rule-based score instead of a complex AI-only system.

Suggested score inputs:

- urgency
- importance
- effort
- available time
- user role context
- whether the task unlocks other work

Example output:

> Recommended next step: Review Chapter 3 notes because your exam is in 2 days, the task fits your available 30 minutes, and it unlocks tomorrow's revision plan.

## Authentication Scope

MVP auth should support:

- Email and password sign-up
- Login and logout
- Protected dashboard routes

Optional stretch goal:

- Google sign-in

## MVP Pages

- Landing page
- Sign up
- Login
- Onboarding
- Dashboard
- Tasks
- Goals
- Profile

## Engineering Priorities

1. Ship working auth first.
2. Build the profile and onboarding flow next.
3. Add task and goal persistence.
4. Add dashboard personalization.
5. Add recommendation logic last, then polish.

## Non-Goals For MVP

- Complex team collaboration
- Chat-first assistant interface
- Full calendar sync
- Large analytics suite