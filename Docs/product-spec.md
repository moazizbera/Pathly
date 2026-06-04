# Product Specification

## Core Product Concept

Pathly is a role-aware productivity assistant that helps one user plan across multiple responsibilities through focused dashboards, role-owned tasks, and explainable next-step guidance.

## Product Model

### Shared account profile

Each user has one base profile that stores:

- full name
- category summary
- main goal
- focus preference
- availability
- active role selection

### Role profiles

Each selected role can have its own profile context, including:

- role name
- role-specific main goal
- role-specific focus preference
- role-specific availability

### Tasks

Each task belongs to one of three planning lanes:

- role-owned: attached to exactly one role context
- shared: relevant across selected roles
- general: useful without a specific role context

## Primary Features

### 1. Authentication

- sign up with email and password
- log in and log out
- persistent account-backed session

### 2. Role-Aware Onboarding

- choose one or more supported roles
- create one shared user profile
- initialize role profiles for selected roles
- enter planning preferences and availability

### 3. Profile Management

- edit shared profile fields
- edit per-role planning fields
- choose a default active role
- update the role set over time

### 4. Task Management

- add tasks manually
- edit, complete, reschedule, and delete tasks
- assign task context as role-owned, shared, or general
- preserve task role context across list, calendar, and AI suggestions

### 5. Dashboard Experience

- focused role mode for one selected role
- all-roles mode for aggregate planning
- recommended next move
- reasoning summary, risk radar, and follow-up guidance
- role plans and overlap visibility

### 6. AI Suggestions

- generate next-week suggestions
- prioritize suggestions by current active role when focused
- group suggestions into Student, Employee, Teacher, Shared, and General lanes

### 7. Weekly Planning View

- grouped task list by role lane
- calendar with role-aware visual language
- drag and drop scheduling support

### 8. Demo And Presentation Support

- `/demo` route for judges and short walkthroughs
- clear story surface for role-aware planning differentiation

## Supported Roles

- Student
- Employee
- Teacher

## Key User Flows

### New User Flow

1. Open the landing page.
2. Create an account.
3. Select one or more roles.
4. Complete shared profile and role planning context.
5. Reach the dashboard.
6. Add tasks or use AI suggestions.

### Daily Usage Flow

1. Open the dashboard.
2. Switch to a focused role or stay in all-roles mode.
3. Review the recommended next move and explanation.
4. Add, start, edit, or complete tasks.
5. Use AI suggest for next-week planning.

### Multi-Role Review Flow

1. Open the dashboard in all-roles mode.
2. Review role plans and overlaps.
3. Switch to a focused role.
4. Inspect tasks, suggestions, and calendar for that role only.

## Functional Requirements

- the system must associate exactly one base profile with each user
- the system must support multiple role profiles for one user
- the system must allow one active role selection or an all-roles view
- the system must allow task creation, editing, completion, deletion, and scheduling
- the system must store task context as role-owned, shared, or general
- the dashboard must surface one visible recommended next action
- the role switcher must change the dashboard context meaningfully
- AI suggestions must respect the active role when focused

## UX Requirements

- the first meaningful dashboard screen must show value immediately
- the interface must reduce noise and highlight one next move
- role switching must be visible and understandable
- recommendation surfaces must include short reasoning so the result feels trustworthy
- the same role vocabulary must appear across suggestions, task list, and calendar

## MVP Acceptance Criteria

- a user can complete onboarding and reach the dashboard in one session
- a user can select multiple roles and save role-specific profile context
- a user can add and retrieve role-owned, shared, and general tasks
- a user can switch between focused role mode and all-roles mode
- the user sees at least one recommendation with explanation