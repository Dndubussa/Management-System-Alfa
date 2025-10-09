# Alfa Specialized Hospital Management System

This is a hospital management system for Alfa Specialized Hospital in Dar es Salaam, Tanzania. The system includes features for patient management, appointment scheduling, medical records, billing, and more.

## Features

- Patient registration and management
- Appointment scheduling
- Electronic medical records (EMR)
- Laboratory orders and results
- Prescription management
- Billing and insurance claims
- Department-specific dashboards
- Operating theatre management
- Reporting and analytics

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- Supabase account (free tier available at [supabase.com](https://supabase.com))

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd alfa-ms-new-main
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Set up Supabase:
   - Create a free account at [supabase.com](https://supabase.com)
   - Create a new project
   - Get your Project URL and API Key from the project settings
   - Update the `.env` file with your Supabase credentials
   - Follow the detailed setup instructions in `SUPABASE_SETUP_INSTRUCTIONS.md`

## Running the Application

### Development Mode

To run the application in development mode with both frontend and backend:

```
npm run dev:full
```

This will start:
- Frontend development server on http://localhost:5173
- Backend API server on http://localhost:3001

### Frontend Only

To run only the frontend development server:

```
npm run dev
```

### Backend Only

To run only the backend server:

```
npm run server
```

### Production Build

To build the application for production:

```
npm run build
```

To preview the production build:

```
npm run preview
```

## API Endpoints

The backend API is available at `http://localhost:3001/api`. The following endpoints are available:

- `/api/patients` - Patient management
- `/api/medical-records` - Medical records
- `/api/prescriptions` - Prescriptions
- `/api/lab-orders` - Laboratory orders
- `/api/appointments` - Appointments
- `/api/users` - User management
- `/api/notifications` - Notifications
- `/api/service-prices` - Service pricing
- `/api/bills` - Billing
- `/api/departments` - Departments
- `/api/referrals` - Referrals
- `/api/insurance-claims` - Insurance claims
- `/api/surgery-requests` - Surgery requests
- `/api/ot-slots` - Operating theatre slots
- `/api/ot-resources` - Operating theatre resources
- `/api/ot-checklists` - Operating theatre checklists
- `/api/surgery-progress` - Surgery progress tracking
- `/api/ot-reports` - Operating theatre reports

## Users

User accounts are managed in the database. Contact your administrator to create or assign roles. No demo credentials are bundled.

## Technologies Used

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: Supabase (PostgreSQL)
- Routing: React Router
- UI Components: Lucide React icons

## Project Structure

```
alfa-ms-new-main/
├── src/
│   ├── components/     # React components
│   ├── config/         # Configuration files
│   ├── context/        # React context providers
│   ├── hooks/          # Custom hooks
│   ├── models/         # Supabase models
│   ├── services/       # API service layer
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── App.tsx         # Main application component
├── server.js           # Backend server
├── package.json        # Project dependencies and scripts
└── README.md           # This file
```

## Development

To modify the application:

1. Frontend code is located in the `src/` directory
2. Backend API endpoints are defined in `server.js`
3. Supabase models are defined in `src/models/supabaseModels.js`
4. TypeScript types are defined in `src/types/index.ts`
5. API service layer is in `src/services/api.ts`

## Database Schema

The application uses Supabase (PostgreSQL) with the following tables:

- **patients** - Patient information
- **medical_records** - Medical records
- **prescriptions** - Prescriptions
- **lab_orders** - Laboratory orders
- **appointments** - Appointments
- **users** - User accounts
- **notifications** - System notifications
- **service_prices** - Service pricing information
- **bills** - Billing information
- **bill_items** - Individual bill items
- **departments** - Hospital departments
- **referrals** - Referral requests
- **insurance_claims** - Insurance claims
- **surgery_requests** - Surgery requests
- **ot_slots** - Operating theatre slots
- **ot_resources** - Operating theatre resources
- **ot_checklists** - Operating theatre checklists
- **ot_checklist_items** - Items in operating theatre checklists
- **surgery_progress** - Surgery progress tracking
- **ot_reports** - Operating theatre reports
- **ot_report_surgeries** - Surgeries in operating theatre reports

## Testing Supabase Integration

To verify that the Supabase integration is working correctly, you can run the following test scripts:

1. **Basic Connection Test**:
   ```
   npm run test:supabase
   ```
   This test verifies that the application can connect to your Supabase instance.

2. **Comprehensive CRUD Operations Test**:
   ```
   npm run test:supabase:full
   ```
   This test verifies all Create, Read, Update, and Delete operations work correctly with Supabase.

3. **Database Schema Verification**:
   ```
   npm run verify:schema
   ```
   This test checks that all required tables exist in your Supabase database.

## Database Setup

Before running the application, you need to set up the database schema:

1. Log in to your Supabase project dashboard
2. Go to the SQL editor
3. Run the `supabase_schema.sql` script from the project root
4. Verify the tables were created successfully

## Seeding the Database

To populate the database with sample data:

```
npm run seed
```

This will create sample patients, users, appointments, and other data for testing.

## License

This project is proprietary to Alfa Specialized Hospital and should not be distributed without permission.