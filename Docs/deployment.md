# Deployment Guide

## Recommended Target

Deploy Pathly to Cloudflare Workers with Supabase as the backend.

## Before You Deploy

1. Make sure the project builds locally with `npm run build`.
2. If you need the raw Next.js production build only, use `npm run next:build`.
3. Create a Supabase project.
4. Run `Docs/supabase-schema.sql` in the Supabase SQL editor.
5. Configure Supabase Auth redirect URLs for both local and deployed environments.

## Environment Variables

Set these variables in your deployment provider:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

These are the same values used in local development.

For Cloudflare Workers Builds, add them in Build Variables and Secrets so both the Next build and the deployed Worker can read them.

## Cloudflare Steps

1. Create a Cloudflare Workers project or connect the GitHub repository through Workers Builds.
2. Use either of these working configurations:
	- Build command: `npm run build`
	- Deploy command: `npx wrangler deploy`
	- or Build command: `npm run cf:build`
	- Deploy command: `npm run cf:deploy`
4. Add the two Supabase environment variables.
5. Deploy.

`npm run build` now runs the OpenNext Cloudflare build, so Cloudflare's default build path can produce the compiled bundle that deploy expects.

If deploying from the CLI instead of Workers Builds, run:

```bash
npm run deploy
```

## Supabase Auth Redirect URLs

Add these URLs in Supabase Auth settings:

- `http://localhost:3000/auth/callback`
- `https://your-production-domain/auth/callback`

If using `*.workers.dev`, add that callback URL as well.

## First Deployment Check

After deployment, verify these routes:

1. `/`
2. `/demo`
3. `/signup`
4. `/login`
5. `/dashboard`
6. `/profile`

## Practical Notes

- Pathly includes setup-aware fallback screens when Supabase is not configured, so the app still presents cleanly during partial setup.
- The app now uses local font stacks in CSS instead of network-fetched Google fonts, which avoids build failures in restricted environments.
- If sign-up appears to work but dashboard persistence is missing, re-check the database schema and Supabase Auth redirect URLs first.
- Cloudflare deployment uses the OpenNext adapter and Wrangler config in the repo root.
- Production builds use Webpack instead of Turbopack because the current OpenNext build path expects Next trace artifacts that are emitted reliably by `next build --webpack`.
- Auth route protection is handled in the app routes and server actions rather than global middleware, which avoids the current Cloudflare adapter limitation around Node.js middleware in Next 16.
- Run `npm run preview` before production deployment to verify the app in the Workers runtime instead of only in local Next.js dev mode.