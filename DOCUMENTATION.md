# Decimal — School Management Platform

## Overview

Decimal is a multi-school management platform built with Next.js, Supabase, and Vercel. It provides role-based portals for the different stakeholders in a school system — platform administrators, principals, teachers, non-teaching staff, and parents — with school context enforced at the database layer (Row-Level Security).

Multi-school access is a first-class concept:

- Users can belong to multiple schools, each with a role.
- A user with more than one membership picks a school after sign-in and can switch schools from the header while signed in.
- Super admins can enter any school and operate it as a principal, then exit back to the platform.

This document describes the current state of the code. For the product vision and roadmap, see `phikila-project-briefing.md` in the repository root.

---

## Onboarding Guide

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (free tier works)
- Google Cloud project (for OAuth)
- Vercel account (free tier works)
- Cloudflare account (for Turnstile CAPTCHA)

### Step 1: Clone & Install

```bash
git clone <your-repo-url>
cd decimal/decimal-app
npm install
```

### Step 2: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Choose region (closest to your users)
4. Set a strong database password
5. Note the **Project URL** and **Anon Key** from Settings → API

### Step 3: Set Up Environment Variables

Create `.env.local` in `decimal-app/`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<your-turnstile-site-key>
SUPABASE_CAPTCHA_SECRET=<your-turnstile-secret-key>
```

Get Supabase keys from: Supabase Dashboard → Settings → API.
Get Turnstile keys from: Cloudflare Dashboard → Turnstile.

### Step 4: Run Database Migrations

Apply **all** migrations under `supabase/migrations/` (they are ordered 001–021 and must run in sequence):

```bash
npx supabase db push --project-ref <your-project-ref>
```

This creates all tables, enums, RLS policies, and triggers.

**Or** run them manually in the Supabase Dashboard → SQL Editor, in filename order (`001_initial_schema.sql` … `021_platform_admin.sql`).

### Step 5: Set Up Google OAuth

1. Go to https://console.cloud.google.com
2. Create a project (or use existing)
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Set **Application type** = Web application
6. Add **Authorized redirect URIs**:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - `https://<your-app-url>/callback`
7. Copy the **Client ID** and **Client Secret**

Then in Supabase Dashboard:

1. Go to **Authentication → Providers → Google**
2. Enable it
3. Paste the Client ID and Client Secret
4. Save

Set the secret as a Supabase environment variable:

```bash
npx supabase secrets set AUTH_EXTERNAL_GOOGLE_SECRET=<your-google-client-secret> --project-ref <your-project-ref>
```

### Step 6: Configure Auth Redirects & CAPTCHA

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL:** `https://<your-app-url>`
- **Redirect URLs:** Add `https://<your-app-url>/callback`

The login page requires a Turnstile CAPTCHA before the Google button is enabled. Server-side verification happens in the OAuth callback; Supabase Auth also enforces Turnstile on its side when `[auth.captcha]` is configured in `supabase/config.toml`.

### Step 7: Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

Or connect your GitHub repo in the Vercel dashboard for auto-deploys.

Set environment variables in Vercel Dashboard → Settings → Environment Variables (the same ones from Step 3).

> **Note:** some files reference the deployed project's Supabase URL directly: `supabase/config.toml`, `src-tauri/tauri.conf.json`, `android/app/src/main/res/xml/network_security_config.xml`, and `scripts/demo/*`. Update those for your own deployment.

### Step 8: Create Your First Super Admin

After deployment, create the first super admin manually:

1. Sign in via Google OAuth on your deployed app
2. Go to Supabase Dashboard → Table Editor → `school_members`
3. Insert a row:
   - `user_id`: Your auth user ID (from `auth.users` table)
   - `school_id`: Create a school first in `schools` table, then use its ID
   - `role`: `super_admin`
   - `is_active`: `true`

**Or** run this SQL in the SQL Editor (replace the user ID):

```sql
-- Create the school
INSERT INTO schools (name, slug, status)
VALUES ('My School', 'my-school', 'active')
RETURNING id;

-- Use the returned school_id and your user_id
INSERT INTO school_members (user_id, school_id, role, is_active)
VALUES ('<your-user-id>', '<school-id>', 'super_admin', true);
```

Do not commit real user IDs, emails, or project references to the repository — use placeholders as shown above.

### Step 9: First Login & Setup

1. Go to your deployed URL
2. Click **Sign in with Google** (complete the CAPTCHA first)
3. Routing after sign-in:
   - **No school membership** → `/no-access`
   - **One membership** → straight to that role's portal
   - **Multiple memberships with no active school** → `/school-picker`
   - **Multiple memberships with an active school** → the active school's portal
4. From the super admin dashboard you can:
   - View platform stats
   - Manage schools, users, audit log, settings, feature flags
   - **Enter School** to operate any school as principal

### Step 10: Add Staff & Assign Roles

As super admin or principal:

1. Go to **Staff → Invite Staff**
2. Add staff members with their details
3. Click **Change Role** next to any staff member
4. Assign roles: Teacher, Timetable Manager, Finance, Admissions Officer, Secretary

Each role determines which portal the staff member sees when they log in.

### Step 11: Set Up School Structure

As principal, set up:

1. **Grades** — Add grade levels (Grade 1, Grade 2, etc.)
2. **Classes** — Create classes per grade (8A, 8B, etc.)
3. **Subjects** — Add subjects (Mathematics, English, etc.)
4. **Periods** — Define time periods (Period 1: 8:00-8:40, etc.)
5. **Rooms** — Add rooms (Room 1, Lab 1, etc.)
6. **Fee Structures** — Define fees (Tuition: KES 25,000, etc.)

### Step 12: Build the Timetable

As principal or timetable manager:

1. Go to **Timetable → Timetable Builder**
2. Select a day (Monday, Tuesday, etc.)
3. For each period, assign:
   - Class
   - Subject
   - Teacher
   - Room
4. Click **Save Timetable**

### Step 13: Add Students

As principal:

1. Go to **Students → Add Student**
2. Enter student details (name, admission number, class, etc.)
3. Link to parent account if needed

### Step 14: Add Admissions

As admissions officer or principal:

1. Applications appear in **Admissions** dashboard
2. Review each application
3. Accept or reject
4. Accepted students can be enrolled

---

## Quick Reference: First-Time Setup Checklist

```
[ ] Supabase project created
[ ] Database migrations applied (001–021)
[ ] Google OAuth configured
[ ] Turnstile CAPTCHA keys configured
[ ] Environment variables set
[ ] Vercel deployment live
[ ] Super admin user created
[ ] School created in database
[ ] First login successful
[ ] Staff added and roles assigned
[ ] Grades, classes, subjects configured
[ ] Periods and rooms defined
[ ] Fee structures created
[ ] Timetable built
[ ] Students enrolled
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | Tailwind CSS 4 + shadcn/ui (Base UI primitives) |
| Auth | Supabase Auth (Google OAuth + Turnstile CAPTCHA) |
| Database | PostgreSQL (Supabase) with Row-Level Security |
| ORM | Supabase JS SDK (`@supabase/ssr`) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts |
| PWA | Service Worker + Web App Manifest |
| Hosting | Vercel |
| Tests | Vitest |

---

## Portals (7)

### 1. Super Admin (`/super-admin`)
- Platform dashboard with aggregate stats (schools, users, students, subscriptions)
- **School Management** (`/super-admin/schools`) — approve/reject/suspend/reactivate schools, and **Enter School** to operate any school as principal
- **User Management** (`/super-admin/users`) — role assignment and member activation across schools
- **Audit Log** (`/super-admin/audit`) — filterable event table
- **Platform Settings** (`/super-admin/settings`) and **Feature Flags** (`/super-admin/feature-flags`)

### 2. Principal (`/principal`)
Full school admin dashboard with sub-pages:

- **Students** — student directory with search and status badges
- **Staff** — staff directory, invite, and **role assignment** (controls portal access)
- **Attendance** — class-by-class attendance overview with date picker
- **Fees** — collection stats and outstanding balances
- **Invoices** and **Payments** — invoicing and payment records
- **Academics** — subjects, classes, and term overview
- **Exams** — create exams, record scores, grading system, performance analysis
- **Report Cards** — generate and view student report cards
- **Timetable** — visual day-by-day timetable builder, teacher assignments, subject frequencies, print views, "Who's Where", settings
- **Admissions** — application list with status badges and review actions
- **Billing** and **Analytics** — subscription/billing foundation and analytics
- **Import Data** — bulk import workflows
- **Documents**, **API Keys**, **Webhooks** — school document store and API/webhook management
- **Messages** and **Notifications** — internal messaging and notification center

### 3. Teacher (`/teacher`)
- **Dashboard** (`/teacher`) — today's classes and tasks
- **My Timetable** (`/teacher/timetable`) — personal timetable (desktop grid + mobile list)
- **My Students** (`/teacher/students`) — students in assigned classes
- **Attendance** (`/teacher/attendance`) — mark attendance per student
- **Exams & Results** (`/teacher/exams`) — record scores

### 4. Parent (`/parent`)
- Children overview (attendance rate, outstanding fees, class) via `/api/parent/*`
- Per-child attendance and fee status
- Quick access links

### 5. Admissions Officer (`/admissions-officer`)
- Application dashboard with status counts (pending, under review, accepted, rejected)
- **Staff Registration** and **Student Registration** workflows
- **Non-Teaching Staff** management

### 6. Finance (`/finance`)
- KPI cards (total expected, collected, outstanding, collection rate)
- Fee structures list
- Recent payments table with student/class context

### 7. Secretary (`/secretary`)
- Announcements management
- Messages overview
- Staff directory
- Quick actions (new announcement, send message, schedule event, generate report)

---

## Roles (8)

| Role | Portal | Assigned By |
|------|--------|-------------|
| `super_admin` | Platform-wide admin | System |
| `principal` | School admin dashboard | Super admin |
| `teacher` | Class teacher view | Principal |
| `timetable_manager` | Teacher + Timetable Builder | Principal |
| `finance` | Payments & fees | Principal |
| `admissions_officer` | Application review | Principal |
| `secretary` | Communications & office | Principal |
| `parent` | Children overview | Principal |

**Role assignment:** Principal can change any staff member's role via `/principal/staff`. The role determines which portal the user sees when they log in.

---

## Multi-School Access

### School picker (`/school-picker`)

After Google sign-in, users with more than one active membership and no active school are sent to the school picker, which lists each membership (school + role). Selecting one calls `POST /api/auth/set-active-school`, which:

1. Validates the exact (school, role) membership
2. Persists `profiles.active_school_id` (the server-side school context)
3. Records the chosen role in a `decimal_active_role` cookie
4. Redirects to the correct portal

### Header school switcher

Multi-school users see the current school's name in the platform header. Opening the dropdown lists all memberships; switching calls the same `set-active-school` API and performs a full page load so server components and middleware re-resolve against the new school.

### Super Admin Enter / Exit School

From **Super Admin → Schools**, an admin can **Enter** any school and operate it as a principal:

- The **Enter** button calls `POST /api/auth/set-active-school` with `{ schoolId, role: "principal" }`. If the admin is not already a member, the API creates (or reactivates) a temporary `principal` membership in the school, sets `profiles.active_school_id`, and records a `school.enter` audit entry. The temporary membership is required because RLS write policies are membership-scoped — a plain `is_super_admin()` bypass only covers reads.
- While inside, the shell shows the **principal** sidebar plus an amber banner: **Super Admin · {school} · Principal View**, with a persistent **Exit School** button.
- `POST /api/admin/exit-school` deactivates exactly the temporary membership created on enter (a genuine pre-existing principal membership is left untouched), restores the home school as active, clears the cookies, and records a `school.exit` audit entry. Switching to a *different* school (via the header switcher) also ends school mode automatically through the same `set-active-school` API.

### Role resolution

Middleware, the platform layout, and `/dashboard` resolve a multi-school user's role from their **active school** (`profiles.active_school_id` + `decimal_active_role` cookie) rather than their first membership, so the portal they land in always matches the school they selected.

---

## Database Schema

### Tables (~57)

Grouped by domain:

- **Tenancy & identity:** `schools`, `school_members`, `profiles`, `parent_student_relationships`
- **Academic structure:** `academic_years`, `terms`, `grades`, `classes`, `subjects`, `class_teachers`
- **People:** `students`, `staff`, `admissions`
- **Attendance & academics:** `attendance_records`, `exams`, `exam_results`, `report_cards`
- **Finance:** `fee_structures`, `student_accounts`, `payments`, `invoices`, `fee_categories`, `ledger_entries`, `receipts`, `billing_invoices`
- **Timetable:** `rooms`, `periods`, `timetable_slots`
- **Communication:** `announcements`, `messages`, `conversations`, `conversation_participants`, `notifications`
- **RBAC:** `permissions`, `role_permissions`, `custom_roles`, `custom_role_assignments`, `custom_role_permissions`
- **Platform:** `audit_logs`, `domain_events`, `feature_flags`, `school_feature_flags`, `system_settings`, `platform_analytics`, `analytics_snapshots`
- **Billing/subscriptions:** `plans`, `subscriptions`, `subscription_events`
- **Documents & API:** `document_categories`, `documents`, `document_access`, `api_keys`, `api_usage_logs`, `webhook_endpoints`, `webhook_deliveries`
- **Notifications:** `notification_preferences`, `notification_templates`

### Key Relationships

```
schools ──┬── school_members ──── auth.users (profiles)
          ├── students ──── classes ──── grades
          ├── staff ──── class_teachers ──── classes, subjects
          ├── timetable_slots ──── classes, subjects, staff, rooms, periods
          ├── attendance_records ──── students
          ├── student_accounts ──── students, fee_structures
          ├── payments ──── student_accounts
          ├── invoices ──── students, fee_structures
          ├── exams ──── terms
          ├── exam_results ──── exams, students, subjects
          ├── admissions ──── classes
          └── notifications ──── auth.users
```

### Row Level Security (RLS)

RLS is enabled on every application table. Two helper functions drive it:

- `get_user_school_ids()` — the active school memberships of the current user
- `is_super_admin()` — whether the current user holds the super_admin role

**Reads** are scoped to `school_id IN get_user_school_ids() OR is_super_admin()` on every table. **Writes** are scoped to the user's memberships with the required role (e.g. principal can manage students/staff; teachers can record attendance; finance can manage payments) — the super admin bypass applies to reads only, which is why the Enter School flow grants a temporary membership.

**Multi-school context:** `profiles.active_school_id` stores the user's current school, and a DB trigger (`validate_active_school_membership`) prevents setting it to a school the user is not an active member of.

---

## Routes

### Public
| Route | Page |
|-------|------|
| `/` | Landing page (hero, demo, features, timetable preview, roles, download, CTA) |
| `/login` | Google OAuth sign-in (Turnstile-gated) |
| `/register` / `/register/school` | School registration (3-step form) |
| `/demo` | Demo request |
| `/docs`, `/security`, `/privacy`, `/terms` | Static pages |
| `/download` | App download page |
| `/no-access` | No school membership message |

### Auth
| Route | Type | Purpose |
|-------|------|---------|
| `/callback` | Route handler | OAuth code exchange + role/school-based redirect |
| `/school-picker` | Page | School selection for multi-school users |
| `/api/auth/signout` | API route | POST to clear session |
| `/api/auth/set-active-school` | API route | POST to switch active school (or enter a school as super admin) |
| `/api/auth/register-school` | API route | POST to register a school |
| `/api/auth/captcha-verify` | API route | Turnstile token verification |

### Protected portals
`/dashboard` (role-based redirect), `/super-admin/*`, `/principal/*`, `/teacher/*`, `/parent/*`, `/admissions-officer/*`, `/finance/*`, `/secretary/*`, `/onboarding` (principal/super-admin only)

### API route groups
`/api/admin/*` (update-school, update-member, remove-member, exit-school), `/api/v1/*` (admin, auth, sync), `/api/parent/*` (children, attendance, fees), `/api/sync/*` (attendance, marks, resolve), `/api/onboarding` (wizard steps), plus `/api/features`, `/api/platform`, `/api/analytics`, `/api/webhooks`, `/api/documents`, `/api/api-keys`, `/api/notifications`, `/api/messages`, `/api/billing`, `/api/import`, `/api/report-cards`, `/api/demo-request`

---

## Features

### Authentication & access
- Google OAuth via Supabase Auth, gated by a Cloudflare Turnstile CAPTCHA (client widget + server verification)
- Role-based, school-aware redirect after login
- Multi-school picker and header school switcher
- Super admin Enter/Exit School with audit trail
- Protected routes via Next.js middleware, role gating resolved against the active school
- Session management via httpOnly cookies

### RBAC
- 8 built-in roles mapped to portals
- Granular permission system (`has_permission` / `get_user_permissions` RPCs) with `permissions`, `role_permissions`, and school-defined `custom_roles`

### Platform operations
- Audit log (`audit_logs`) written via the service-role client for sensitive actions
- Feature flags with school-level overrides
- System settings (maintenance mode, etc.)
- API keys and webhooks for school integrations (with usage logs and delivery tracking)
- Billing/subscriptions foundation (`plans`, `subscriptions`, `billing_invoices`, `subscription_events`)

### School operations
- **Onboarding wizard** (`/onboarding`) — guided setup: academic year + terms, grades & classes, subjects (CBC auto-load or manual), bell periods, fee structures; principal dashboard shows a setup prompt until the academic structure exists
- Students, staff (with role assignment), attendance, academics, exams/results, report cards
- Fees & finance: fee structures, student accounts, invoices, payments, ledger, receipts
- Admissions with review workflow
- Timetable builder with teacher assignments, subject frequencies, and print views
- Documents store with access control
- Bulk import workflows

### Parent portal
- Children overview with per-child attendance and fee status via `/api/parent/*` (school-scoped, child-scoped responses)

### Offline / sync
- IndexedDB-backed offline stores (`attendance`, `marks`, `timetable`, `students`) with a sync queue
- Background sync on reconnect and every 30 seconds via `/api/sync/*`
- **Conflict detection**: sync compares the client's edit timestamp against the server's `updated_at` (migration 023). Newer server rows are never silently overwritten — conflicts are stored on-device and surfaced in a banner where the user picks "Keep server" or "Use mine" (`/api/sync/resolve`)
- Client-supplied `school_id` is ignored — all sync writes go to the session's active school

### Notifications
- In-app notification center with unread badge in the header
- Notification preferences and templates tables

### PWA
- Web App Manifest, service worker with static asset caching, install banner

### UI/UX
- Indigo brand color defined as OKLCH tokens in `globals.css` (light + dark)
- Responsive, mobile-first layout with sidebar navigation and loading/empty states

---

## Deployment

### Vercel
- Auto-deploys from the default branch
- Environment variables set in Vercel Dashboard → Settings → Environment Variables
- Build command: `next build`

### Supabase
- Migrations under `supabase/migrations/` (001–021) applied via `npx supabase db push`
- Google OAuth and Turnstile CAPTCHA configured in the dashboard
- RLS enabled on all tables

### Migrations
| File | Purpose |
|------|---------|
| `001_initial_schema.sql` | Core tables, enums, RLS policies, triggers |
| `002_exams_results.sql` | Exams and exam_results tables |
| `003_timetable_manager.sql` | timetable_manager role enum value |
| `004_timetable_upgrade.sql` | Timetable upgrades |
| `005_admissions_upgrade.sql` | Admissions workflow upgrades |
| `006_exams_upgrade.sql` | Exams workflow upgrades |
| `007_rls_for_remaining_tables.sql` | RLS on the 13 remaining tables |
| `008_self_registration.sql` | School self-registration support |
| `009_tenant_context.sql` | `profiles.active_school_id` + membership trigger |
| `010_rbac_v2.sql` | Permissions, role_permissions, custom roles |
| `011_domain_events.sql` | Domain events table |
| `012_audit_logs.sql` | Audit log table |
| `013_feature_flags.sql` | Feature flags + school overrides |
| `014_billing_subscriptions.sql` | Plans, subscriptions, subscription events |
| `015_financial_ledger.sql` | Invoices, ledger entries, receipts |
| `016_messaging.sql` | Conversations + participants |
| `017_notification_preferences.sql` | Notification preferences + templates |
| `018_parent_portal_reportcards.sql` | Parent portal relationships + report cards |
| `019_documents.sql` | Document store with access control |
| `020_api_platform.sql` | API keys, webhooks, usage logs |
| `021_platform_admin.sql` | System settings, platform analytics |

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<Turnstile site key>
SUPABASE_CAPTCHA_SECRET=<Turnstile secret key>
```

Set via Supabase secrets (not local env): `AUTH_EXTERNAL_GOOGLE_SECRET`.

Never commit real values. The repository's `.gitignore` excludes `.env*.local`.

---

## File Structure

```
decimal-app/
├── src/
│   ├── middleware.ts          # Session + role/school gate for protected routes
│   ├── app/
│   │   ├── (auth)/            # login, callback, school-picker
│   │   ├── (platform)/        # All portal dashboards + super-admin
│   │   │   ├── super-admin/   # dashboard, schools, users, audit, settings, feature-flags
│   │   │   ├── principal/     # ~28 modules (students, staff, exams, timetable, …)
│   │   │   ├── teacher/       # dashboard, timetable, students, attendance, exams
│   │   │   ├── parent/        # children overview (attendance, fees)
│   │   │   ├── finance/       # dashboard, payments, fee-structures
│   │   │   ├── admissions-officer/
│   │   │   ├── secretary/     # dashboard, announcements
│   │   │   └── dashboard/     # Role-based redirect
│   │   ├── (public)/          # Landing, register, demo, docs, privacy, terms, download, no-access
│   │   └── api/               # Route handlers (auth, admin, parent, sync, v1, …)
│   ├── components/
│   │   ├── landing/           # Landing page sections
│   │   ├── platform/          # Shell, sidebar, header, school switcher, banner, notifications
│   │   └── ui/                # shadcn/ui components
│   └── lib/
│       ├── supabase/          # Client, server, server-admin, middleware, helpers
│       ├── services/          # Domain services (audit, tenant, rbac, platform, document, …)
│       └── auth-config.ts     # Portal routes, role maps, role resolution
├── tests/                     # Vitest unit tests
├── supabase/
│   └── migrations/            # SQL migrations (001–023)
├── android/  src-tauri/       # Mobile/desktop wrappers
└── scripts/                   # Utility + demo scripts (incl. export-school-data.ts backup/restore export)
```

---

## Next Steps (not yet built)

1. **Timetable AI** — AI-assisted scheduling, constraint solving, and conflict suggestions
2. **Reports module** — deeper attendance/finance/academic report generation
3. **Parent portal expansion** — announcements, direct messaging, timetable view
4. **Custom role builder UI** — manage `custom_roles` from the interface
5. **Payment processing** — actual payment provider integration (foundation exists)
6. **Email/SMS notifications** — beyond in-app notifications
7. **Seed/demo data** — sample school content for trials
8. **Onboarding phase 2** — staff/student creation and welcome communication inside the wizard (academic structure steps are done)
9. **Keep this document in sync with the code** — re-audit after significant features land