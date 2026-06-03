# Submission Kit

## Project Name

Pathly

## Tagline

Smart planning for every role.

## One-Sentence Summary

Pathly is a role-aware productivity platform that helps students, employees, and teachers turn overwhelming responsibilities into one clear next step.

## Live Demo

https://pathly.maziz-abdelrahman.workers.dev/

## Elevator Pitch

Most productivity apps store everything but help prioritize almost nothing. Pathly changes that by starting with the user’s role, understanding their current goal and focus constraints, and then recommending the next best action instead of showing a flat generic task wall.

## Problem

Students, employees, and teachers face very different kinds of overload, but most planning tools treat them exactly the same. That creates decision fatigue, poor prioritization, and a dashboard full of tasks without guidance.

## Solution

Pathly adapts the planning experience to the user’s roles, profile, and current priorities. It builds a role-aware dashboard, surfaces the highest-value next move, explains why that recommendation matters, and makes multi-role planning visible through separate role plans, overlap detection, and a role-aware weekly view.

## Key Features

- Role-aware onboarding for Student, Employee, and Teacher
- Personalized profile with goal, focus style, and availability
- Guided dashboard with one best next action
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
- It recommends a next move instead of only storing tasks.
- It makes AI reasoning and overlap visible across dashboard, task list, and calendar.
- It includes a judge-ready presentation route inside the app itself.

## Demo Flow

1. Open `/demo` to frame the story.
2. Show signup with Student, Employee, and Teacher role selection.
3. Open the dashboard and highlight the recommended next move.
4. Show the role plans panel and overlap detection.
5. Open AI suggest for next week to show Student, Employee, Teacher, Shared, and General sections.
6. Show the task list and weekly calendar using the same role-lane system.
7. Open the profile page and explain how changing role context reshapes the planning guidance.

## Impact Statement

Pathly is built around a simple belief: people are more likely to follow through when their planner helps them decide what matters first. By reducing decision fatigue and making prioritization role-aware, the product makes planning feel calmer, more useful, and more human.

## Future Expansion

- More categories such as Freelancer, Parent, and Job seeker
- Smarter scoring based on recurring patterns and deadlines
- Richer weekly planning views and insights
- Team or mentor support flows for accountability