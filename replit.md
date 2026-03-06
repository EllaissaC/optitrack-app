# OptiTrack - Optical Frame Inventory Tracker

## Overview
A web dashboard for tracking optical frame inventory for opticians and eyewear professionals, with user authentication, lab workflow management, and email reminders.

## Features
- **Dashboard**: Stats overview (total frames, on board, at lab, sold), recent frames list, financial summary, "Frames Needing Lab Follow-Up" amber alert card (14+ days)
- **Inventory**: Full CRUD table with search and status filtering; barcode scanning (USB scanner-compatible); manufacturer→brand dependent dropdowns (DB-backed); wholesale cost + multiplier → retail price auto-calculation
- **Lab Orders**: Dedicated page showing only frames with `at_lab` status. Separate columns for Brand, Model, Lab Name, Lab Order #, Vision Plan, Tracking, Date Sent, and Days at Lab with color indicators (0-7 green, 8-13 yellow, 14+ red). "Mark Received" button changes status to On Board and records `dateReceivedFromLab`. Edit dialog lets staff update all lab order fields including Vision Plan.
- **Authentication**: Passport-local auth with bcryptjs, session management, admin/staff roles, invite-by-email with 7-day expiry tokens, first-run admin setup flow
- **Settings (Admin Only)**: 4 tabs — General (email reminders, default multiplier), Labs CRUD, Manufacturers & Brands CRUD, Team management (invite, toggle, delete)
- **Email Reminders**: SendGrid integration for frames 14+ days at lab; `/api/reminders/check` endpoint

## Architecture
- **Frontend**: React + TypeScript + Vite, TanStack Query, shadcn/ui, wouter routing
- **Backend**: Express.js REST API
- **Database**: PostgreSQL via Drizzle ORM
- **Schema**: `shared/schema.ts`
- **Auth**: `server/auth.ts` (passport-local, bcryptjs, express-session)
- **Email**: `server/email.ts` (SendGrid)

## Key Files
- `shared/schema.ts` - Full database schema (frames, users, settings, labs, manufacturers, brands)
- `server/storage.ts` - Database storage interface
- `server/routes.ts` - All API endpoints
- `server/auth.ts` - Authentication setup (passport, session, routes)
- `server/email.ts` - SendGrid email module
- `client/src/App.tsx` - App layout with auth-gated routing
- `client/src/pages/dashboard.tsx` - Dashboard page
- `client/src/pages/inventory.tsx` - Inventory table page with FrameDialog
- `client/src/pages/lab-orders.tsx` - Lab orders page (at_lab frames only)
- `client/src/pages/settings.tsx` - Admin settings page (4 tabs)
- `client/src/pages/login.tsx` - Login page
- `client/src/pages/setup.tsx` - First-run admin setup
- `client/src/pages/invite.tsx` - Accept invite page
- `client/src/components/app-sidebar.tsx` - Navigation sidebar

## Navigation
- `/` - Dashboard
- `/inventory` - Frame inventory
- `/lab-orders` - Lab orders (at-lab frames)
- `/settings` - Admin settings
- `/login` - Login
- `/setup` - First-run admin setup
- `/invite` - Accept invite

## API Endpoints
- `GET/POST /api/frames` - List/create frames
- `GET/PATCH/DELETE /api/frames/:id` - Single frame operations
- `GET /api/labs` - List labs
- `POST /api/labs` - Create lab (admin)
- `PATCH/DELETE /api/labs/:id` - Update/delete lab (admin)
- `GET /api/manufacturers` - List manufacturers
- `GET /api/manufacturers/:id/brands` - List brands for manufacturer
- `POST/PATCH/DELETE /api/manufacturers/:id` - Manage manufacturers (admin)
- `POST/PATCH/DELETE /api/brands/:id` - Manage brands (admin)
- `GET/PUT /api/settings` - App settings (auth required / admin)
- `GET/POST/PATCH/DELETE /api/users` - User management (admin)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user
- `POST /api/auth/setup` - Create first admin
- `GET /api/auth/setup-required` - Check if setup needed
- `POST /api/auth/invite` - Send invite (admin)
- `GET /api/auth/invite/:token` - Check invite token
- `POST /api/auth/accept-invite` - Accept invite and set password
- `POST /api/reminders/check` - Trigger email reminder check

## Frame Status Values
- `on_board` - Frame is in stock
- `at_lab` - Frame is being processed at a lab
- `sold` - Frame has been sold

## Frame Lab Fields
- `visionPlan` - Required when status=at_lab; options: VSP, Blue Cross Blue Shield, EyeMed, Aetna, Tricare, VA, Spectera, Private Pay, Meritain
- `dateReceivedFromLab` - Date the frame was received back from lab (set when Mark Received is clicked)
- `dateSentToLab` - Date the frame was sent to lab

## Shared Constants
- `client/src/lib/constants.ts` - VISION_PLAN_OPTIONS array (used in inventory and lab-orders pages)

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session secret
- `SENDGRID_API_KEY` - SendGrid API key for email reminders (optional)
