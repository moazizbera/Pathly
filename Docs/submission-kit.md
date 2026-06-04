# Submission Kit

## Project Name

Pathly

## Tagline

Smart planning for every role.

## One-Sentence Summary

Pathly is a multi-role productivity platform that helps students, employees, and teachers turn overlapping responsibilities into one clear next step.

## Live Demo

https://pathly.maziz-abdelrahman.workers.dev/

## Elevator Pitch

Most productivity apps store everything but help prioritize almost nothing. Pathly changes that by understanding the user’s roles, current goals, and focus constraints, then recommending the next best action instead of showing one flat task wall.

## Core Positioning

Pathly should not be pitched as a calendar app.

The strongest positioning is:

Pathly is a multi-role prioritization system that helps one person decide what deserves attention when they are balancing different responsibilities.

The defensible value is not task CRUD or calendar placement. The defensible value is that the same user can:

- switch between focused role mode and `All Roles`
- see a different next move by role
- understand why that move matters
- spot overlap between responsibilities
- get role-aware next-week suggestions instead of a generic list

## Problem

Students, employees, and teachers face different kinds of overload, and many people are balancing more than one of those roles at the same time. Most planning tools flatten that reality into a generic backlog, which creates decision fatigue and weak prioritization.

## Solution

Pathly adapts the planning experience to the user’s shared profile, role profiles, and current priorities. It builds a role-aware dashboard, surfaces the highest-value next move, explains why that recommendation matters, and makes multi-role planning visible through focused role mode, an all-roles dashboard, overlap detection, and a role-aware weekly view.

## Key Features

- Role-aware onboarding for Student, Employee, and Teacher
- Shared profile plus per-role profile settings
- Guided dashboard with one best next action
- Focused role mode and all-roles mode
- Separate role plans for Student, Employee, and Teacher
- Shared-task overlap detection across roles
- AI suggestions grouped into Student, Employee, Teacher, Shared, and General
- Weekly calendar and task list with role-aware lanes
- In-app `/demo` route for judge walkthroughs and pitch support

## Built With

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth
- Supabase PostgreSQL
- Cloudflare Workers via OpenNext
- Zod

## What Makes It Stand Out

- It handles one person across multiple roles instead of forcing a single identity.
- It makes tasks role-owned first and aggregated second.
- It recommends a next move instead of only storing tasks.
- It makes AI reasoning and overlap visible across dashboard, task list, and calendar.
- It includes a judge-ready presentation route inside the app itself.

## Demo Flow

1. Open `/demo` to frame the story.
2. Show signup with Student, Employee, and Teacher role selection.
3. Open the dashboard and highlight the recommended next move.
4. Use the role switcher to compare focused mode and all-roles mode.
5. Show the role plans panel and overlap detection.
6. Open AI suggest for next week to show Student, Employee, Teacher, Shared, and General sections.
7. Show the task list and weekly calendar using the same role-lane system.
8. Open the profile page and explain how changing role context reshapes the planning guidance.

## Demo Warning

If the walkthrough spends too much time on the calendar, Pathly will look like a generic planner.

Keep the narrative in this order:

1. flat tools create overload
2. one person can have multiple roles
3. Pathly changes the next move by role
4. `All Roles` shows overlap and planning pressure
5. the calendar is the execution layer, not the main value

## Impact Statement

Pathly is built around a simple belief: people are more likely to follow through when their planner helps them decide what matters first. By reducing decision fatigue and making prioritization role-aware across multiple responsibilities, the product makes planning feel calmer, more useful, and more human.

## Future Expansion

- More categories such as Freelancer, Parent, and Job seeker
- Smarter scoring based on recurring patterns and deadlines
- Richer weekly planning views and insights
- Team or mentor support flows for accountability

## Pitch Prep

Use `Docs/pitch-cheatsheet.md` for short spoken versions of the product story.