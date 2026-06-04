# Product Analysis

## Project Name

Pathly

## Tagline

Smart planning for every role.

## Elevator Pitch

Pathly is a multi-role productivity platform that helps users prioritize across Student, Employee, and Teacher responsibilities through role-owned tasks, focused dashboards, and explainable next-step guidance.

## Problem Statement

Most productivity products flatten human responsibilities into one generic list. In real life, one person often lives in several roles at once. When tools ignore that structure, the result is overload, poor prioritization, and constant context switching.

## Opportunity

Pathly can occupy a stronger position than a typical to-do app by treating role context as a first-class planning signal. Instead of one generic backlog, it helps users see what matters in a specific role, what overlaps across roles, and what should happen next.

## Target Users

### Current supported roles

- Student
- Employee
- Teacher

### Future expansion roles

- Freelancer
- Parent
- Job seeker

## Core User Problems

### Student

- Assignments, exams, and revision compete for limited focus time
- A flat list does not show what is most urgent or highest leverage
- Academic planning gets mixed with non-academic responsibilities

### Employee

- Meetings and admin crowd out deep work
- Project tasks compete across deadlines and stakeholders
- Work responsibilities can dominate everything else without structure

### Teacher

- Lesson planning, grading, and parent communication create fragmented work
- Teaching and admin tasks blur together without prioritization
- Repetitive weekly work still requires active planning energy

### Multi-role users

- One person can be both Student and Employee, or Teacher and planner of other work
- Shared tasks are hard to identify in generic tools
- Users need both focused mode and aggregate mode, not one or the other

## Product Hypothesis

If tasks belong to a role context first and the interface can switch between focused role mode and an all-roles view, users will feel less overwhelmed and make better next-step decisions than they would in a flat planner.

## Differentiation

Pathly is not just role-themed. Its differentiation is structural:

1. one shared user profile can support multiple role profiles
2. tasks are role-owned, shared, or general
3. the dashboard can focus on one role or aggregate all roles
4. AI suggestions use the same role context as the rest of the product
5. explanation is visible through recommendation, risk radar, and follow-up guidance

## Judge-Focused Value

### Impact and originality

- solves a real pain point: decision fatigue across multiple responsibilities
- more specific and defensible than a generic productivity app
- demonstrates a stronger product thesis than simple task storage

### Functionality and build quality

- real auth, persistence, schema, and deployment are implemented
- the data model supports multi-role planning rather than simulating it cosmetically
- the product includes presentation-specific flows like `/demo`

### Design and user experience

- the dashboard is built around one next move instead of noise
- role switching changes the view in a visible and meaningful way
- suggestions, task list, and calendar all use the same role language

## Success Criteria

- a user can sign up, select multiple roles, and reach the dashboard
- a user can add role-owned, shared, and general tasks
- a user can switch between focused role mode and all-roles mode
- the dashboard shows one clear next action with explanation
- AI suggestions, task list, and calendar remain consistent with role context

## Demo Narrative

1. show the problem framing on `/demo`
2. show role-aware onboarding on `/signup`
3. show the dashboard recommendation and reasoning
4. show role switching between focused mode and all-roles mode
5. show role plans, overlaps, and AI suggestions
6. show that the same lane system appears in the task list and calendar

## Product Risks

- if role context falls out of sync with the task model, the product can feel inconsistent
- if the demo uses weak example data, the multi-role value may not be obvious enough
- if screenshots are captured in the wrong order, the pitch can sound like a generic planner again

## Scope Control Decision

Pathly should stay focused on doing three roles well, keeping the role-aware architecture legible, and presenting one strong story instead of adding broader but shallower feature surface.