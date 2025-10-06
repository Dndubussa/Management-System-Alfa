# Operating Theatre (OT) Coordinator Module

This module provides comprehensive functionality for managing surgical operations in the hospital.

## Features

### 1. OT Dashboard
- Overview of pending surgery requests
- Scheduled surgeries for the day
- Available OT rooms and surgeons
- Recent notifications

### 2. Surgery Requests
- View and manage surgery requests from doctors
- Approve or reject requests
- Review patient EMR, lab results, and radiology reports
- Check anesthesiologist pre-op assessments

### 3. OT Schedule
- Calendar view (Day/Week/Month)
- Drag-and-drop scheduling of surgeries
- Assign surgeons, anesthesiologists, nurses, and OT rooms
- Automatic conflict detection

### 4. Patient Queue
- Track patient progress through surgical workflow
- Pre-Op → In Progress → Post-Op → Completed
- Update patient status in real-time

### 5. Resources & Availability
- Manage surgeon, anesthesiologist, and nurse availability
- Track OT room schedules
- Equipment and instrument availability

### 6. OT Checklists
- Generate pre-operative checklists
- Track checklist completion
- Print checklists for surgeries

### 7. Reports & Logs
- Daily/Weekly/Monthly OT utilization reports
- Surgery summary reports
- Complications and mortality tracking
- Cancelled/postponed surgeries log

## Workflow

1. **Surgery Request**: Doctors send surgery requests to OT Coordinator
2. **Review**: OT Coordinator reviews requests and checks resources
3. **Schedule**: Surgeries are scheduled with assigned staff and resources
4. **Pre-Op**: Patients are prepared for surgery
5. **In Progress**: Surgeries are performed with real-time tracking
6. **Post-Op**: Patients are transferred to recovery
7. **Reporting**: Outcomes are logged and reports are generated

## Roles & Permissions

- **OT Coordinator**: Full access to all OT functionality
- **Surgeons**: Can view their assigned surgeries
- **Anesthesiologists**: Can view their assigned cases
- **Nurses**: Can view patient queue status
- **Admin**: Can view reports and analytics

## Integration Points

- EMR system for patient records
- Lab system for test results
- Radiology for imaging reports
- Pharmacy for medications
- Billing for surgery charges