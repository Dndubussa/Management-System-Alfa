# Service Price Lookup & Estimate Generator Feature

## Overview

The **Service Price Lookup & Estimate Generator** is a comprehensive feature designed for the Receptionist role in the Alfa Specialized Hospital Management System. It allows receptionists to search service prices and generate cost estimates (quotations) for walk-in or new patients before registration.

## Features

### 🔍 Service Price Lookup
- **Advanced Search**: Search services by name or category
- **Filtering Options**: Filter by category, price range, and sort options
- **Real-time Results**: Instant search results with live filtering
- **Service Selection**: Add services to estimate with one click
- **Export Functionality**: Export service prices to CSV
- **Visual Interface**: Clean, modern UI with service cards

### 📊 Estimate Generator
- **Patient Information**: Capture patient details (name, phone, email)
- **Service Management**: Add/remove services with quantity controls
- **Pricing Calculations**: Automatic subtotal, discount, and total calculations
- **Estimate Numbering**: Auto-generated unique estimate numbers (EST-YYYY-NNNN)
- **Validity Period**: Set estimate validity dates
- **Status Tracking**: Track estimate status (draft, sent, accepted, expired, converted)
- **Notes & Comments**: Add special instructions or notes

### 📋 Estimate History
- **Historical View**: View all previously created estimates
- **Status Management**: Track estimate lifecycle
- **Quick Actions**: View details, download PDF, resend estimates
- **Search & Filter**: Find estimates by patient, date, or status

## Technical Implementation

### Frontend Components

#### 1. ServicePriceLookup.tsx
- **Purpose**: Search and display service prices
- **Features**:
  - Real-time search with debouncing
  - Advanced filtering (category, price range)
  - Sort options (name, category, price)
  - Service selection for estimates
  - CSV export functionality

#### 2. EstimateGenerator.tsx
- **Purpose**: Create and manage cost estimates
- **Features**:
  - Patient information form
  - Service quantity management
  - Discount calculations
  - Estimate validation
  - Save/send functionality

#### 3. PriceLookupAndEstimates.tsx
- **Purpose**: Main container component
- **Features**:
  - Tabbed interface (Lookup, Generator, History)
  - State management between components
  - Estimate history display

### Backend Implementation

#### API Endpoints
```javascript
GET    /api/estimates          // Get all estimates
GET    /api/estimates/:id      // Get specific estimate
POST   /api/estimates          // Create new estimate
PUT    /api/estimates/:id      // Update estimate
DELETE /api/estimates/:id      // Delete estimate
```

#### Database Schema
```sql
CREATE TABLE service_estimates (
  id UUID PRIMARY KEY,
  estimate_number TEXT UNIQUE NOT NULL,
  patient_name TEXT,
  patient_phone TEXT,
  patient_email TEXT,
  services JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  discount_reason TEXT,
  total DECIMAL(10,2) NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'accepted', 'expired', 'converted')),
  created_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### TypeScript Interfaces

```typescript
interface ServiceEstimate {
  id: string;
  estimateNumber: string;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  services: EstimateService[];
  subtotal: number;
  discount?: number;
  discountReason?: string;
  total: number;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'expired' | 'converted';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

interface EstimateService {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
}
```

## User Workflow

### 1. Price Lookup Workflow
1. **Access Feature**: Navigate to "Price Lookup & Estimates" from receptionist sidebar
2. **Search Services**: Use search bar to find specific services
3. **Apply Filters**: Filter by category, price range, or sort options
4. **Select Services**: Click "+" button to add services to estimate
5. **Export (Optional)**: Export service list to CSV for reference

### 2. Estimate Generation Workflow
1. **Switch to Generator**: Click "Estimate Generator" tab
2. **Enter Patient Info**: Fill in patient name, phone, email (optional)
3. **Review Services**: Verify selected services and quantities
4. **Apply Discounts**: Add discounts with reasons if applicable
5. **Set Validity**: Set estimate validity period (default: 7 days)
6. **Add Notes**: Include special instructions or notes
7. **Save/Send**: Save as draft or send to patient

### 3. Estimate Management Workflow
1. **View History**: Check "Estimate History" tab
2. **Track Status**: Monitor estimate status and validity
3. **Take Actions**: View details, download PDF, or resend estimates
4. **Follow Up**: Track accepted estimates and convert to actual bills

## Integration Points

### With Existing System
- **Service Prices**: Uses existing `service_prices` table
- **User Management**: Integrates with user authentication
- **Billing System**: Estimates can be converted to actual bills
- **Patient Registration**: Estimates can be linked to patient records

### Navigation Integration
- **Sidebar Menu**: Added "Price Lookup & Estimates" menu item for receptionists
- **Routing**: New route `/receptionist/price-lookup` added to App.tsx
- **Role-based Access**: Only accessible to users with 'receptionist' role

## Database Setup

### 1. Create Database Schema
```bash
# Run the SQL schema file in Supabase SQL editor
supabase_estimates_schema.sql
```

### 2. Verify Table Creation
```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'service_estimates';

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'service_estimates';
```

## Usage Examples

### Creating a Simple Estimate
1. Search for "Consultation" services
2. Add "General Consultation" to estimate
3. Enter patient name: "John Doe"
4. Enter phone: "+255 123 456 789"
5. Set validity: 7 days from today
6. Save estimate

### Creating a Complex Estimate
1. Search for multiple services (consultation, lab tests, medications)
2. Add multiple services with different quantities
3. Apply 10% discount for "Senior Citizen"
4. Add notes: "Patient requires wheelchair access"
5. Send estimate via email/SMS

## Future Enhancements

### Planned Features
- **PDF Generation**: Generate professional PDF estimates
- **Email Integration**: Send estimates via email
- **SMS Integration**: Send estimates via SMS
- **Template System**: Pre-defined estimate templates
- **Approval Workflow**: Multi-level estimate approval
- **Integration with Billing**: Direct conversion to bills
- **Analytics Dashboard**: Estimate conversion rates and analytics

### Technical Improvements
- **Caching**: Implement service price caching
- **Offline Support**: Offline estimate creation
- **Mobile Optimization**: Mobile-responsive design
- **API Rate Limiting**: Implement rate limiting for API calls
- **Audit Trail**: Track all estimate modifications

## Security Considerations

### Data Protection
- **Row Level Security**: Implemented for all estimate data
- **User Permissions**: Only receptionists can create estimates
- **Data Validation**: Server-side validation for all inputs
- **Audit Logging**: Track all estimate operations

### Privacy
- **Patient Data**: Secure handling of patient information
- **Access Control**: Role-based access to estimate data
- **Data Retention**: Configurable data retention policies

## Troubleshooting

### Common Issues
1. **Services Not Loading**: Check service_prices table data
2. **Estimate Not Saving**: Verify database permissions
3. **Search Not Working**: Check search filters and data format
4. **PDF Generation Failing**: Verify PDF library installation

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify API endpoints are responding
3. Check database connection and permissions
4. Validate input data formats

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Compatibility**: Alfa Hospital Management System v2.0+
