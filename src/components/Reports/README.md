# Reports Dashboard

The Reports Dashboard component provides comprehensive reporting capabilities for doctors and administrators in the hospital management system.

## Features

1. **Multiple Report Types**:
   - Visit Summaries
   - Progress Notes
   - Lab Results Reports
   - Prescription Reports
   - Chronic Disease Reports
   - Financial Reports
   - Patient List
   - Doctor Activity Report

2. **Date Range Selection**:
   - Today
   - Last 7 Days
   - Last 30 Days
   - Last 90 Days
   - Custom Date Range

3. **Report Actions**:
   - View reports in browser
   - Download as CSV
   - Download as PDF
   - Print reports

4. **Role-Based Access**:
   - Doctors can only see their own data
   - Administrators can see all data

## Usage

1. Select a report type from the left panel
2. Choose a date range from the right panel
3. For custom date ranges, select "Custom Range" and enter start and end dates
4. Click "View Report" to preview in browser
5. Use "CSV" or "PDF" buttons to download reports

## Technical Implementation

The component uses:
- `jsPDF` and `jspdf-autotable` for PDF generation
- Custom CSV generation for spreadsheet exports
- Date filtering based on selected ranges
- Role-based data filtering for doctors