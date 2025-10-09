# Migration from MongoDB to Supabase

This document summarizes the changes made to migrate the Alfa Specialized Hospital Management System from MongoDB to Supabase (PostgreSQL).

## Changes Made

### 1. Removed MongoDB Dependencies
- Removed `mongodb` and `mongoose` from package.json
- Removed MongoDB configuration files
- Removed MongoDB models

### 2. Added Supabase Integration
- Added Supabase client configuration in `src/config/supabase.js`
- Created SQL schema definitions in `supabase_schema.sql`
- Updated environment variables in `.env` file

### 3. Updated Backend Server
- Replaced `server.js` with a new Supabase-enabled version
- Updated all API endpoints to use Supabase instead of MongoDB
- Maintained the same REST API interface for frontend compatibility

### 4. Updated Database Models
- Replaced MongoDB models with Supabase SQL table definitions
- Created `src/models/supabaseModels.js` with table schemas

### 5. Updated Seeding Script
- Replaced MongoDB seeding script with Supabase version
- Updated `src/scripts/seedDb.ts` to work with Supabase

### 6. Documentation Updates
- Updated README.md to reflect Supabase integration
- Added database schema documentation
- Updated setup instructions

## Database Schema Changes

### Table Name Changes
| MongoDB Collection | Supabase Table |
|-------------------|----------------|
| patients | patients |
| medicalrecords | medical_records |
| prescriptions | prescriptions |
| laborders | lab_orders |
| appointments | appointments |
| users | users |
| notifications | notifications |
| serviceprices | service_prices |
| bills | bills |
| departments | departments |
| referrals | referrals |
| insuranceclaims | insurance_claims |
| surgeryrequests | surgery_requests |
| otslots | ot_slots |
| otresources | ot_resources |
| otchecklists | ot_checklists |
| surgeryprogress | surgery_progress |
| otreports | ot_reports |

### New Tables
- `bill_items` - For individual items in bills
- `ot_checklist_items` - For individual items in OT checklists
- `ot_report_surgeries` - For surgeries in OT reports

## API Compatibility
The REST API endpoints remain unchanged to maintain frontend compatibility:
- `/api/patients`
- `/api/medical-records`
- `/api/prescriptions`
- `/api/lab-orders`
- `/api/appointments`
- `/api/users`
- `/api/notifications`
- `/api/service-prices`
- `/api/bills`
- `/api/departments`
- `/api/referrals`
- `/api/insurance-claims`
- `/api/surgery-requests`
- `/api/ot-slots`
- `/api/ot-resources`
- `/api/ot-checklists`
- `/api/surgery-progress`
- `/api/ot-reports`

## Setup Instructions

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your Project URL and API Key from the project settings
4. Update the `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=your_project_url
   SUPABASE_KEY=your_api_key
   ```
5. Run the SQL schema script to create tables
6. Seed the database with sample data:
   ```bash
   npm run seed
   ```

## Testing
Test the Supabase connection with:
```bash
npm run test:supabase
```

## Running the Application
Start the development server with:
```bash
npm run dev:full
```

This will start both the frontend (port 5173) and backend (port 3001) with Supabase integration.