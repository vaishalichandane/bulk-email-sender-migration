# Bulk Email Sender — Frontend Migration

Migrated from a Bun + vanilla HTML/CSS/JS app to a **Node.js backend + Next.js frontend**.

## What changed

- **Backend**: Migrated from Bun runtime to plain Node.js
  - `bun:sqlite` → Node's built-in `node:sqlite` (no native compilation required — avoids needing platform-specific build tools like Visual Studio C++ workload)
  - `argon2` (native password hashing) → `bcryptjs` (pure JS, same reasoning as above)
  - Bun's static file serving removed — no longer needed since Next.js serves the frontend now
  - Upgraded Hono v3 → v4 (required by `@hono/node-server`), including the cookie API change (`c.req.cookie()` → `getCookie()`)
- **Frontend**: Rebuilt from scratch in Next.js (App Router, TypeScript, Tailwind CSS)
  - Old `public/` folder (vanilla HTML/JS) removed entirely
  - Backend routes and database schema were **not modified** — only the runtime/dependency layer needed changes to run without Bun

## Project structure

```
server/   → Node.js + Hono backend (unchanged business logic)
client/   → Next.js frontend (new)
```

## Scope decision

Given the assignment's own documentation describes roughly 4 weeks of planned work against a 7-day deadline, this migration deliberately prioritizes:

- ✅ Authentication (register/login/logout/session)
- ✅ SMTP configuration management (add/test/delete/set default)
- ✅ Sending a single immediate email campaign (Excel contact list upload)
- ✅ Basic dashboard/navigation

**Deliberately out of scope** (to prioritize code quality over feature count under the deadline):
- Batch sending, scheduled sending
- Reports page with export
- Real-time polling dashboard

## Running locally

### 1. Backend
```
cd server
npm install
cp .env.example .env   # fill in SMTP details if you want real sending
npm run dev
```
Runs on `http://localhost:3000`.

### 2. Frontend
```
cd client
npm install
npm run dev
```
Runs on `http://localhost:3001`.

Open `http://localhost:3001` in your browser — it'll redirect to `/login` if you're not authenticated.

## Known pre-existing issue (not introduced by this migration)

The `/health` endpoint requires authentication in the original backend code, which is unusual for a health-check endpoint (these are typically public). Left as-is since backend logic wasn't meant to be modified.
