# Product Specification

## Core Product Concept

Pathly is a category-aware productivity assistant that helps users organize responsibilities and move toward their goals through personalized planning.

## Primary Features

### 1. Authentication

- Sign up with email and password
- Log in and log out
- Persistent user account

### 2. Category-Based Onboarding

- Choose a category during onboarding
- Collect role-specific profile information
- Save availability and focus preferences

### 3. User Profile

- Shared profile fields for all users
- Category-specific details based on selected role
- Editable profile screen

### 4. Goals And Tasks

- Create goals
- Add tasks manually
- Link tasks to goals
- Set deadlines and estimated durations

### 5. Personalized Dashboard

- Top priorities for today
- Recommended next action
- Explanation of recommendation
- Role-specific summary cards

### 6. Recommendation Engine

- Score tasks based on rules
- Select one primary recommended action
- Recompute when data changes

## Shared Profile Fields

- Full name
- Email
- Category
- Main goal
- Weekly availability
- Focus preference

## Category-Specific Fields

### Student

- School or university
- Subjects
- Exam dates

### Employee

- Company
- Job title
- Work hours

### Teacher

- Institution
- Subjects taught
- Class schedule

## Key User Flows

### New User Flow

1. Open landing page.
2. Create account.
3. Choose category.
4. Fill profile details.
5. Add initial goals and tasks.
6. Reach the personalized dashboard.

### Daily Usage Flow

1. Open dashboard.
2. Review today's priorities.
3. Start the recommended task.
4. Mark progress.
5. Return for updated guidance.

## Functional Requirements

- The system must associate each profile with exactly one user.
- The system must store one active category per user.
- The system must allow task creation, editing, completion, and deletion.
- The system must generate one visible recommended next action.
- The dashboard must show personalized content based on category.

## UX Requirements

- The first screen after onboarding must show value immediately.
- The interface must reduce noise and focus the user on a small number of priorities.
- Recommendations must include a short reason so users trust the result.

## MVP Acceptance Criteria

- A user can complete onboarding in one session.
- A user can save and retrieve tasks after login.
- A user sees category-aware dashboard content.
- A user sees at least one recommendation with explanation.