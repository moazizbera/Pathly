# Auth Setup

Pathly uses Supabase Auth with the Next.js App Router and server-side session handling.

## Required Environment Variables

Create a local `.env.local` file from `.env.example` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Recommended Supabase Settings

- Enable Email + Password authentication.
- Add your local dev URL and deployed URL to the allowed redirect URLs.
- If you want instant sign-up during demos, disable mandatory email confirmation in the Auth settings.

## Current Auth Flow

1. User visits `/signup` or `/login`.
2. A Server Action validates the form with Zod.
3. Supabase creates or authenticates the user.
4. Supabase SSR cookies are refreshed through `proxy.ts`.
5. `/dashboard` is protected and redirects anonymous users to `/login`.

## Database Setup

Run the SQL in `Docs/supabase-schema.sql` inside the Supabase SQL editor.

That creates:

- `profiles` for role-aware user context
- `tasks` for dashboard planning and recommendations
- row level security policies so each user only sees their own records

## Notes

- User category, full name, and main goal are stored in `user_metadata` during sign-up.
- Profile and task persistence in Postgres tables is the next step after auth.
