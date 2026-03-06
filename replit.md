# OptiTrack - Optical Frame Inventory Tracker

## Overview
A web dashboard for tracking optical frame inventory for opticians and eyewear professionals.

## Features
- **Dashboard**: Stats overview (total frames, on board, at lab, sold), recent frames list, financial summary
- **Inventory**: Full CRUD table with search and status filtering
- **Barcode Scanning**: USB scanner-compatible scan input at top of inventory page; found frames show a detail card with quick-action buttons; unknown barcodes auto-open Add Frame form pre-filled
- **Manufacturer/Brand dropdowns**: Dependent select dropdowns with 11 manufacturers and their associated brands; custom entries persisted to localStorage via `client/src/lib/manufacturers.ts`
- **Lab Workflow**: When status = "At Lab", form reveals Lab Order Number, Lab Name (dropdown with 14 labs + custom), Tracking Number fields
- **Frame fields**: manufacturer, brand, model, color, eye size, bridge, temple length, cost, retail price, status, barcode, labOrderNumber, labName, trackingNumber

## Architecture
- **Frontend**: React + TypeScript + Vite, TanStack Query, shadcn/ui, wouter routing
- **Backend**: Express.js REST API
- **Database**: PostgreSQL via Drizzle ORM
- **Schema**: `shared/schema.ts`

## Key Files
- `shared/schema.ts` - Frame and User database schema
- `server/db.ts` - Drizzle + pg database connection
- `server/storage.ts` - Database storage interface
- `server/routes.ts` - API endpoints (CRUD for frames)
- `server/seed.ts` - Seed data (7 realistic frames)
- `client/src/App.tsx` - App layout with sidebar
- `client/src/pages/dashboard.tsx` - Dashboard page
- `client/src/pages/inventory.tsx` - Inventory table page
- `client/src/components/app-sidebar.tsx` - Navigation sidebar

## API Endpoints
- `GET /api/frames` - List all frames
- `GET /api/frames/:id` - Get single frame
- `POST /api/frames` - Create frame
- `PATCH /api/frames/:id` - Update frame
- `DELETE /api/frames/:id` - Delete frame

## Frame Status Values
- `on_board` - Frame is in stock
- `at_lab` - Frame is being processed at a lab
- `sold` - Frame has been sold
