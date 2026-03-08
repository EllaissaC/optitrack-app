# OptiTrack - Optical Frame Inventory Tracker

## Overview
A web dashboard for tracking optical frame inventory for opticians and eyewear professionals, with user authentication, lab workflow management, and email reminders.

## Features
- **Dashboard**: Inventory overview stats (total, on board, at lab, sold) + Sales Performance cards (total revenue, wholesale cost, profit, profit margin) + monthly stats + Top 5 Brands/Manufacturers/Models analytics + overdue lab alert + recent frames list
- **Inventory**: Full CRUD table with search and status filtering; Profit column (retail − wholesale); barcode scanning (USB scanner-compatible); manufacturer→brand dependent dropdowns (DB-backed); wholesale cost + multiplier → retail price auto-calculation
- **Lab Orders**: Dedicated page with overdue attention section at top, category filters (All, Overdue, At Lab Normal, Rush, Received), custom due date for rush orders, dynamic turnaround threshold. Visual badges: Rush (purple), Overdue (red). Overdue logic: customDueDate override or days >= labTurnaroundDays threshold. No patient names displayed.
- **Weekly Metrics**: Staff enter DAILY numbers (Mon–Sun) for Comp Exams, Optical Orders, and Follow Ups/Next Year in a grid table. Totals auto-calculate from daily entries. Live Scheduling Rate and Capture Rate preview. History table shows weekly totals with expandable chevron to see per-day breakdown. Color-coded badges (≥80% green, 60-79% yellow, <60% red). Summary stat cards. `dailyData` stored as JSON text in DB.
- **Authentication**: Passport-local auth (email + password) with bcryptjs, session management, three roles (admin/optician/staff), invite-by-email with 7-day expiry tokens, first-run admin setup flow
- **Clinic Data Isolation**: All operational data (frames, weekly metrics, labs) is scoped to the logged-in user's `clinic_id`. Queries automatically filter by clinic so each clinic only sees its own data. New users inherit the inviting admin's clinic when invited.
- **Settings (Admin Only)**: 6 tabs — General (email reminders, default multiplier, session expiration), Labs CRUD, Brands/Manufacturers CRUD (with inline quick-add), Team management (invite, toggle, delete), Account (email/password change), Clinic (name, address, city, state, zip)
- **Multi-Clinic Support**: `clinics` table, `clinicId` on users, clinic name + address shown in header when assigned, admin can create/edit clinic from Settings → Clinic tab
- **Email Reminders**: SendGrid integration for frames 14+ days at lab; `/api/reminders/check` endpoint

## Architecture
- **Frontend**: React + TypeScript + Vite, TanStack Query, shadcn/ui, wouter routing
- **Backend**: Express.js REST API
- **Database**: PostgreSQL via Drizzle ORM
- **Schema**: `shared/schema.ts`
- **Auth**: `server/auth.ts` (passport-local, bcryptjs, express-session)
- **Email**: `server/email.ts` (SendGrid)

## Key Files
- `shared/schema.ts` - Full database schema (frames, users, settings, labs, manufacturers, brands, weeklyMetrics, clinics)
- `server/storage.ts` - Database storage interface
- `server/routes.ts` - All API endpoints
- `server/auth.ts` - Authentication setup (passport, session, routes)
- `server/email.ts` - SendGrid email module
- `client/src/App.tsx` - App layout with auth-gated routing
- `client/src/pages/dashboard.tsx` - Dashboard page
- `client/src/pages/inventory.tsx` - Inventory table page with FrameDialog and InvoiceImportDialog
- `server/invoiceParser.ts` - PDF invoice parser using OpenAI gpt-4o (pdf-parse v1.1.1, createRequire CJS fallback)
- `client/src/pages/lab-orders.tsx` - Lab orders page (at_lab frames only)
- `client/src/pages/weekly-metrics.tsx` - Weekly optical performance metrics page
- `client/src/pages/settings.tsx` - Admin settings page (4 tabs)
- `client/src/pages/login.tsx` - Login page
- `client/src/pages/setup.tsx` - First-run admin setup
- `client/src/pages/invite.tsx` - Accept invite page
- `client/src/components/app-sidebar.tsx` - Navigation sidebar

## Navigation
- `/` - Dashboard
- `/inventory` - Frame inventory
- `/lab-orders` - Lab orders (at-lab frames)
- `/weekly-metrics` - Weekly optical performance metrics
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
- `POST /api/invoice/parse` - Parse PDF invoice via OpenAI, returns array of ExtractedFrame objects (manufacturer, brand, model, color, eyeSize, bridge, templeLength, cost, quantity)
- `GET /api/weekly-metrics` - List weekly metrics (newest first)
- `POST /api/weekly-metrics` - Save a new week's metrics
- `DELETE /api/weekly-metrics/:id` - Delete a weekly metric entry

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
