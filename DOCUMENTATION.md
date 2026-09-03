# Phikila — School Management Platform

## Overview

Phikila is a multi-school management platform built with Next.js 16, Supabase, and Vercel. It provides role-based dashboards for different stakeholders in a school system — from platform administrators to parents.

**Live:** https://phikila-app.vercel.app  
**GitHub:** https://github.com/twistedoliver211fs-art/phikila  
**Supabase:** https://supabase.com/dashboard/project/pgiytpbrnyxnnfupvaiv

---

## Onboarding Guide

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (free tier works)
- Google Cloud project (for OAuth)
- Vercel account (free tier works)

### Step 1: Clone & Install

```bash
git clone https://github.com/twistedoliver211fs-art/phikila.git
cd phikila/phikila-app
npm install
```

### Step 2: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Choose region (closest to your users)
4. Set a strong database password
5. Note the **Project URL** and **Anon Key** from Settings → API

### Step 3: Set Up Environment Variables

Create `.env.local` in `phikila-app/`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

Get keys from: Supabase Dashboard → Settings → API

### Step 4: Run Database Migrations

```bash
npx supabase db push --project-ref <your-project-ref>
```

This creates all tables, enums, RLS policies, and triggers.

**Or** run migrations manually:
1. Go to Supabase Dashboard → SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/migrations/002_exams_results.sql`
4. Run `supabase/migrations/003_timetable_manager.sql`

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

### Step 6: Configure Auth Redirects

In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL:** `https://<your-app-url>`
- **Redirect URLs:** Add `https://<your-app-url>/callback`

### Step 7: Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

Or connect your GitHub repo in the Vercel dashboard for auto-deploys.

Set environment variables in Vercel Dashboard → Settings → Environment Variables.

### Step 8: Create Your First Super Admin

After deployment, you need to manually create the first super admin:

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

### Step 9: First Login & Setup

1. Go to your deployed URL
2. Click **Sign in with Google**
3. You'll be redirected to the super admin dashboard
4. From here you can:
   - View platform stats
   - Switch between schools
   - Access the audit log

### Step 10: Add Staff & Assign Roles

As super admin or principal:

1. Go to **Staff → Invite Staff**
2. Add staff members with their details
3. Go to **Staff** table
4. Click **Change Role** next to any staff member
5. Assign roles: Teacher, Timetable Manager, Finance, Admissions Officer, Secretary

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

1. Go to **Timetable** → **Timetable Builder**
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
[ ] Database migrations applied
[ ] Google OAuth configured
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
| Framework | Next.js 16.3.4 (App Router, Turbopack) |
| Language | TypeScript |
| UI | Tailwind CSS + shadcn/ui (Radix primitives) |
| Auth | Supabase Auth (Google OAuth) |
| Database | PostgreSQL (Supabase) |
| ORM | Supabase JS SDK (`@supabase/ssr`) |
| Animations | Framer Motion |
| Icons | Lucide React |
| PWA | Service Worker + Web App Manifest |
| Hosting | Vercel (auto-deploy from GitHub) |

---

## Portals (7)

### 1. Super Admin (`/super-admin`)
- Platform-wide stats (schools, users, students, subscriptions)
- School context switcher (view data for any school)
- Audit log (`/super-admin/audit`) — filterable event table
- System health monitoring
- Recent schools list with status/subscription badges

### 2. Principal (`/principal`)
Full school admin dashboard with sub-pages:
- **Students** (`/principal/students`) — student list from DB, search, status badges
- **Staff** (`/principal/staff`) — staff directory + **role assignment** (controls portal access)
- **Attendance** (`/principal/attendance`) — class-by-class attendance overview with date picker
- **Fees & Finance** (`/principal/fees`) — collection stats, recent payments, outstanding balances
- **Academics** (`/principal/academics`) — subjects, classes, term overview
- **Exams & Results** (`/principal/exams`) — create exams, record scores (requires migration)
- **Timetable** (`/principal/timetable`) — visual timetable builder (day-by-day grid)
- **Admissions** (`/principal/admissions`) — application list with status badges

### 3. Teacher (`/teacher`)
- **Dashboard** (`/teacher`) — class overview
- **Timetable** (`/teacher/timetable`) — view personal timetable (desktop grid + mobile list)
- **Students** (`/teacher/students`) — students in assigned classes
- **Attendance** (`/teacher/attendance`) — mark attendance per student with status toggles

### 4. Parent (`/parent`)
- Children overview with attendance rate and fee balance
- Fee balances per child
- School announcements
- Quick access links

### 5. Admissions Officer (`/admissions-officer`)
- Application dashboard with status counts (pending, under review, accepted, rejected)
- Full application table with actions (view, accept, reject)

### 6. Finance (`/finance`)
- KPI cards (total expected, collected, outstanding, collection rate)
- Fee structures list
- Recent payments table
- Outstanding balances

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

## Database Schema

### Tables (15)

| Table | Purpose |
|-------|---------|
| `schools` | School records (name, slug, type, status, subscription) |
| `school_members` | User-school-role assignments (RLS-gated) |
| `profiles` | Extended user profiles (name, phone, avatar) |
| `students` | Student records (name, DOB, gender, class, parent link) |
| `staff` | Staff records (name, role, department, employee number) |
| `classes` | Class definitions (name, grade, stream, capacity) |
| `grades` | Grade levels (name, level number) |
| `subjects` | Subjects (name, code) |
| `academic_years` | Academic year definitions |
| `terms` | Term definitions (linked to academic year) |
| `attendance_records` | Daily attendance per student (present/absent/late/excused) |
| `fee_structures` | Fee definitions (name, amount) |
| `student_accounts` | Per-student fee tracking (due, paid, balance) |
| `payments` | Payment records (amount, date, reference) |
| `admissions` | Application records (name, status, requested class) |
| `announcements` | School announcements (title, content, target roles) |
| `messages` | Internal messages (sender, recipient, subject, content) |
| `rooms` | Room definitions (name, capacity) |
| `periods` | Time periods (name, start/end time, position) |
| `timetable_slots` | Timetable entries (class, subject, teacher, room, period, day) |
| `notifications` | User notifications (title, message, read status) |
| `exams` | Exam definitions (name, date, term) |
| `exam_results` | Per-student exam scores (score, grade, subject) |

### Key Relationships

```
schools ──┬── school_members ──── auth.users (profiles)
          ├── students ──── classes ──── grades
          ├── staff ──── class_teachers ──── classes, subjects
          ├── timetable_slots ──── classes, subjects, staff, rooms, periods
          ├── attendance_records ──── students
          ├── student_accounts ──── students, fee_structures
          ├── payments ──── student_accounts
          ├── admissions ──── classes
          ├── exams ──── terms
          ├── exam_results ──── exams, students, subjects
          ├── announcements
          ├── messages
          └── notifications ──── auth.users
```

### Row Level Security (RLS)

- **Schools:** Members can view their schools; super admins can do everything
- **Students/Staff:** Members can view; admin/principal can manage
- **Attendance:** Members can view; teachers/principals can record
- **Admissions:** Members can view; admin can manage
- **Announcements:** Members can view; admin can manage
- **Notifications:** Users can view/update their own

Helper functions:
- `get_user_school_ids()` — returns school IDs for current user
- `is_super_admin()` — checks if user has super_admin role

---

## Routes (28)

### Public
| Route | Page |
|-------|------|
| `/` | Landing page (11 sections, Framer Motion animations) |
| `/login` | Google OAuth sign-in |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/no-access` | No school access message |

### Auth
| Route | Type | Purpose |
|-------|------|---------|
| `/callback` | Route handler | OAuth code exchange + role-based redirect |
| `/api/auth/signout` | API route | POST to clear session |

### Protected Portals
| Route | Portal |
|-------|--------|
| `/dashboard` | Role-based redirect to correct portal |
| `/super-admin` | Super admin dashboard |
| `/super-admin/audit` | Audit log |
| `/principal` | Principal dashboard |
| `/principal/students` | Student management |
| `/principal/staff` | Staff management + role assignment |
| `/principal/attendance` | Attendance overview |
| `/principal/fees` | Fees & finance |
| `/principal/academics` | Academics structure |
| `/principal/exams` | Exams & results |
| `/principal/timetable` | Timetable builder |
| `/principal/admissions` | Admission applications |
| `/teacher` | Teacher dashboard |
| `/teacher/timetable` | Personal timetable view |
| `/teacher/students` | Students in assigned classes |
| `/teacher/attendance` | Mark attendance |
| `/parent` | Parent dashboard |
| `/admissions-officer` | Admissions dashboard |
| `/finance` | Finance dashboard |
| `/secretary` | Secretary dashboard |

---

## Features

### Authentication
- Google OAuth via Supabase Auth
- Role-based redirect after login
- Session management via cookies
- Protected routes via Next.js middleware

### PWA
- Web App Manifest (`/manifest.json`)
- Service Worker (`/sw.js`) with static asset caching
- Apple Web App meta tags
- Install banner component (desktop only)

### UI/UX
- Indigo primary color (#4F46E5)
- OKLCH color system
- Responsive design (mobile-first)
- Sidebar navigation with active state highlighting
- Header with search, notification badge, user dropdown
- Loading states and empty states
- Framer Motion scroll animations on landing page

### Real-time Data
- All portal pages query live Supabase data
- Notification center reads from `notifications` table
- Header badge shows unread notification count from DB

---

## Deployment

### Vercel
- Auto-deploys from `main` branch
- Environment variables set in Vercel dashboard
- Build command: `next build`
- Output: `.next/`

### Supabase
- Project: `pgiytpbrnyxnnfupvaiv` (eu-central-1)
- Migrations applied via `npx supabase db push`
- Google OAuth configured with client ID/secret
- RLS enabled on all tables

### Migrations
| File | Purpose |
|------|---------|
| `001_initial_schema.sql` | Core tables, enums, RLS policies, triggers |
| `002_exams_results.sql` | Exams and exam_results tables |
| `003_timetable_manager.sql` | timetable_manager role enum value |

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://pgiytpbrnyxnnfupvaiv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
AUTH_EXTERNAL_GOOGLE_SECRET=<Google OAuth client secret>
```

---

## File Structure

```
phikila-app/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login, callback
│   │   ├── (platform)/       # All portal dashboards
│   │   │   ├── super-admin/  # Super admin portal
│   │   │   ├── principal/    # Principal portal (8 sub-pages)
│   │   │   ├── teacher/      # Teacher portal (3 sub-pages)
│   │   │   ├── parent/       # Parent portal
│   │   │   ├── finance/      # Finance portal
│   │   │   ├── admissions-officer/
│   │   │   └── secretary/    # Secretary portal
│   │   ├── (public)/         # Landing, privacy, terms, no-access
│   │   └── api/auth/signout/ # Sign-out handler
│   ├── components/
│   │   ├── landing/          # Landing page sections
│   │   ├── platform/         # Shell, sidebar, header, notifications
│   │   └── ui/               # shadcn/ui components
│   └── lib/
│       └── supabase/         # Client, server, middleware, helpers
├── public/                   # Logo, manifest, SW, verification
├── supabase/
│   └── migrations/           # SQL migrations
└── .env.local                # Environment variables
```

---

## Super Admin Credentials

- **Email:** kipkiruigideon890@gmail.com
- **User ID:** 2dd957dd-0e2e-4486-b688-89d27673a857
- **Role:** super_admin
- **School:** Phikila Platform (bf197e21-bfe2-42ab-9371-ba61e700ff0d)

---

## Next Steps

1. **Seed data** — Add sample school, classes, students, staff for demo
2. **Exam results recording** — Teacher portal to input scores
3. **Report card generation** — PDF export of student results
4. **Fee structure management** — CRUD for fee structures
5. **Payment recording** — Full payment flow with receipts
6. **Announcement management** — Create/edit/delete announcements
7. **Message system** — Internal messaging between roles
8. **Timetable auto-generation** — AI-assisted timetable scheduling
9. **Parent portal expansion** — Fee payment, message teachers
10. **Mobile app** — Capacitor or React Native wrapper
