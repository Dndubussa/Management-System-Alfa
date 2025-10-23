import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { ErrorProvider } from './context/ErrorContext';
import { ErrorDisplay, ErrorSummary } from './components/ErrorHandling/ErrorDisplay';
import { ErrorBoundary } from './components/ErrorHandling/ErrorBoundary';
import { DataLoadingDiagnostics } from './components/Diagnostics/DataLoadingDiagnostics';
import { LoginForm } from './components/Login/LoginForm';
import { UserVerification } from './components/Login/UserVerification';
import { UserValidation } from './components/Login/UserValidation';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import TestConnection from './components/TestConnection';
import { DashboardStats } from './components/Dashboard/DashboardStats';
import { PatientList } from './components/Patients/PatientList';
import { PatientForm } from './components/Patients/PatientForm';
import { PatientDetail } from './components/Patients/PatientDetail';
import { EMRDashboard } from './components/EMR/EMRDashboard';
import { MedicalRecordForm } from './components/EMR/MedicalRecordForm';
import { InternalMedicineEMRForm } from './components/EMR/InternalMedicineEMRForm';
import { InternalMedicineDashboard } from './components/Dashboard/InternalMedicineDashboard';
import { OphthalmologistDashboard } from './components/Dashboard/OphthalmologistDashboard';
import { OphthalmologyEMRForm } from './components/EMR/OphthalmologyEMRForm';
import { OphthalmologyImaging } from './components/EMR/OphthalmologyImaging';
import { AppointmentList } from './components/Appointments/AppointmentList';
import { AppointmentForm } from './components/Appointments/AppointmentForm';
import { PrescriptionList } from './components/Prescriptions/PrescriptionList';
import { LabOrderList } from './components/Lab/LabOrderList';
import { TestResults } from './components/Lab/TestResults';
import { InventoryList } from './components/Inventory/InventoryList';
import { BillingDashboard } from './components/Billing/BillingDashboard';
import { BillDetails } from './components/Billing/BillDetails';
import { Patient, MedicalRecord, Appointment } from './types';
import { ReferralList } from './components/Referrals/ReferralList';
import { ReferralForm } from './components/Referrals/ReferralForm';
import { ChronicDiseaseDashboard } from './components/ChronicDisease/ChronicDiseaseDashboard';
import { ReportsDashboard } from './components/Reports/ReportsDashboard';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ReceptionistDashboard } from './components/Receptionist/ReceptionistDashboard';
import { InsuranceManagementDashboard } from './components/Receptionist/InsuranceManagementDashboard';
import { InsuranceClaimDetails } from './components/Receptionist/InsuranceClaimDetails';
import { PriceLookupAndEstimates } from './components/Receptionist/PriceLookupAndEstimates';
import ProcessExistingPatients from './components/Receptionist/ProcessExistingPatients';
import { DoctorAppointmentDashboard } from './components/Appointments/DoctorAppointmentDashboard';

// OT Coordinator Components
import { OTDashboard } from './components/OT/OTDashboard';
import { SurgeryRequests } from './components/OT/SurgeryRequests';
import { OTSchedule } from './components/OT/OTSchedule';
import { OTResources } from './components/OT/OTResources';
import { OTChecklists } from './components/OT/OTChecklists';
import { OTPatientQueue } from './components/OT/OTPatientQueue';
import { OTReports } from './components/OT/OTReports';

// Insurance Officer Components
import { InsuranceProviders } from './components/Insurance/InsuranceProviders';
import { InsuranceReports } from './components/Insurance/InsuranceReports';
import { InsuranceVerification } from './components/Insurance/InsuranceVerification';
import { ClaimSubmission } from './components/Insurance/ClaimSubmission';
import { ClaimTracking } from './components/Insurance/ClaimTracking';

// Cashier Components
import { CashierDashboard } from './components/Cashier/CashierDashboard';
import { InvoiceGeneration } from './components/Cashier/InvoiceGeneration';
import { OutstandingBills } from './components/Cashier/OutstandingBills';
import { InsuranceClaims } from './components/Cashier/InsuranceClaims';
import { ReportsReconciliations } from './components/Cashier/ReportsReconciliations';

// Physical Therapist Components
import { PTDashboard } from './components/PhysicalTherapist/PTDashboard';
import { PTAppointments } from './components/PhysicalTherapist/PTAppointments';
import { PTAssessment } from './components/PhysicalTherapist/PTAssessment';
import { PTTherapyPlans } from './components/PhysicalTherapist/PTTherapyPlans';
import { PTEMR } from './components/PhysicalTherapist/PTEMR';
import { PTReports } from './components/PhysicalTherapist/PTReports';

// Doctor Components
import { DoctorQueue } from './components/Doctor/DoctorQueue';

// Nurse Components (to be created)
import { NurseDashboard } from './components/Nurse/NurseDashboard';
import { TriageQueue } from './components/Nurse/TriageQueue';
import { NurseTriageVitals } from './components/Nurse/NurseTriageVitals';
import { NurseCareNotes } from './components/Nurse/NurseCareNotes';
import { NurseMedicationAdmin } from './components/Nurse/NurseMedicationAdmin';
import { NurseProcedures } from './components/Nurse/NurseProcedures';
import { NurseInpatientCare } from './components/Nurse/NurseInpatientCare';
import { NurseReports } from './components/Nurse/NurseReports';

// HR Components
import HRDashboard from './components/HR/HRDashboard';
import StaffManagement from './components/HR/StaffManagement';
import Recruitment from './components/HR/Recruitment';
import LicensingCompliance from './components/HR/LicensingCompliance';
import AttendanceScheduling from './components/HR/AttendanceScheduling';
import TrainingDevelopment from './components/HR/TrainingDevelopment';
import PerformanceAppraisal from './components/HR/PerformanceAppraisal';
import HRReports from './components/HR/HRReports';

// Custom hook to find bill by ID
function useBill(billId: string | undefined) {
  const { bills } = useHospital();
  const [bill, setBill] = useState<any>(null);
  
  useEffect(() => {
    if (billId) {
      const foundBill = bills.find(b => b.id === billId);
      setBill(foundBill);
    }
  }, [billId, bills]);
  
  return bill;
}

// Custom hook to find claim by ID
function useClaim(claimId: string | undefined) {
  const { insuranceClaims } = useHospital();
  const [claim, setClaim] = useState<any>(null);
  
  useEffect(() => {
    if (claimId) {
      const foundClaim = insuranceClaims.find(c => c.id === claimId);
      setClaim(foundClaim);
    }
  }, [claimId, insuranceClaims]);
  
  return claim;
}

// Component to display bill details
function BillDetailRoute() {
  const { billId } = useParams();
  const bill = useBill(billId);
  const navigate = useNavigate();
  
  if (!bill) {
    return <div>Bill not found</div>;
  }
  
  return <BillDetails bill={bill} onClose={() => navigate('/billing')} />;
}

// Component to display claim details
function ClaimDetailRoute() {
  const { claimId } = useParams();
  const claim = useClaim(claimId);
  const navigate = useNavigate();
  
  if (!claim) {
    return <div>Claim not found</div>;
  }
  
  return <InsuranceClaimDetails claim={claim} onClose={() => navigate('/receptionist')} />;
}

// Create a wrapper component to extract the patientId from route params
function NewEMRRecordRoute() {
  const { patientId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user has permission to create EMR records
  const hasPermission = user?.role === 'doctor' || user?.role === 'ophthalmologist';
  
  if (!hasPermission) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
        <button
          onClick={() => navigate('/emr')}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Go to EMR Dashboard
        </button>
      </div>
    );
  }
  
  // For ophthalmologists, redirect to their specialized EMR form with patient ID
  if (user?.role === 'ophthalmologist') {
    navigate(`/ophthalmology-emr/${patientId || ''}`);
    return null;
  }
  
  // For doctors, use the internal medicine EMR form
  return (
    <InternalMedicineEMRForm
      patientId={patientId || ''}
      onSave={() => navigate('/emr')}
      onCancel={() => navigate('/emr')}
    />
  );
}

// Component to display patient details
function PatientDetailRoute() {
  const { patientId } = useParams();
  const { patients } = useHospital();
  const navigate = useNavigate();
  
  const patient = patients.find(p => p.id === patientId);
  
  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <PatientDetail 
      patient={patient} 
      onBack={() => navigate('/patients')} 
      onEdit={() => navigate(`/patient-edit/${patient.id}`)} 
    />
  );
}

// Component to edit patient
function PatientEditRoute() {
  const { patientId } = useParams();
  const { patients } = useHospital();
  const navigate = useNavigate();
  
  const patient = patients.find(p => p.id === patientId);
  
  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <PatientForm 
      patient={patient} 
      onSave={() => navigate('/patients')} 
      onCancel={() => navigate('/patients')} 
    />
  );
}

// Create a wrapper component for the ophthalmology EMR form
function OphthalmologyEMRRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (user?.role !== 'ophthalmologist') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
        <button
          onClick={() => navigate('/emr')}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Go to EMR Dashboard
        </button>
      </div>
    );
  }
  
  return <OphthalmologyEMRForm />;
}

function AppContent() {
  const { user } = useAuth();
  
  // Add error boundary for useHospital
  let hospitalContext;
  try {
    hospitalContext = useHospital();
  } catch (error) {
    console.error('Hospital context error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please refresh the page if this persists.</p>
        </div>
      </div>
    );
  }
  
  const { generateBill, addNotification, addToQueue, users, updatePatient } = hospitalContext;
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [recordPatientId, setRecordPatientId] = useState<string>('');
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<any>(null);
  const [referralPatientId, setReferralPatientId] = useState<string>('');

  // Custom navigation handler that also closes forms
  const handleNavigation = (path: string) => {
    // Close all forms when changing routes
    setShowPatientForm(false);
    setShowRecordForm(false);
    setShowAppointmentForm(false);
    
    // Clear selections
    setSelectedPatient(null);
    setSelectedRecord(null);
    setSelectedAppointment(null);
    setRecordPatientId('');
    setSelectedBill(null);
    setSelectedClaim(null);
    
    // Navigate to the new path
    navigate(path);
  };

  if (!user) {
    return <LoginForm />;
  }

  const handleViewPatient = (patient: Patient) => {
    console.log('🔍 handleViewPatient called with patient:', patient);
    setSelectedPatient(patient);
    console.log('🔍 selectedPatient state set, navigating to /patient-detail');
    navigate(`/patient-detail/${patient.id}`);
  };

  const handleEditPatient = (patient: Patient) => {
    console.log('🔍 handleEditPatient called with patient:', patient);
    setSelectedPatient(patient);
    console.log('🔍 selectedPatient state set, navigating to /patient-edit');
    navigate(`/patient-edit/${patient.id}`);
  };

  const handleNewPatient = () => {
    navigate('/registration');
  };

  const handleSavePatient = async (newPatient?: Patient) => {
    // Determine if this was an edit or new registration based on whether selectedPatient exists
    const isEdit = !!selectedPatient;
    
    setShowPatientForm(false);
    setSelectedPatient(null);
    
    // Doctor assignment is now handled during registration in PatientForm
    // No need to assign doctor here as it's already done during patient creation
    
    // Add notification for successful patient save
    addNotification({
      userIds: [user?.id || ''],
      type: 'general',
      title: 'Patient Saved',
      message: `Patient information has been successfully ${isEdit ? 'updated' : 'registered'}.`,
      isRead: false
    });
    
    navigate('/patients');
  };

  const handleCreateRecord = (patientId: string) => {
    setRecordPatientId(patientId);
    setSelectedRecord(null);
    setShowRecordForm(true);
  };

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setRecordPatientId(record.patientId);
    setShowRecordForm(true);
  };

  const handleSaveRecord = () => {
    setShowRecordForm(false);
    setSelectedRecord(null);
    setRecordPatientId('');
    
    // Auto-generate bill for the medical record
    if (recordPatientId) {
      generateBill(recordPatientId, undefined, selectedRecord?.id);
    }
    
    navigate('/emr');
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    navigate('/appointment/new');
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    navigate('/appointment-edit');
  };

  const handleSaveAppointment = () => {
    setShowAppointmentForm(false);
    setSelectedAppointment(null);
    
    // Auto-generate bill for the appointment
    if (selectedAppointment?.patientId) {
      generateBill(selectedAppointment.patientId, selectedAppointment.id);
    }
    
    navigate('/appointments');
  };

  const handleViewBill = (bill: any) => {
    setSelectedBill(bill);
    navigate(`/bill/${bill.id}`);
  };

  const handleViewClaim = (claim: any) => {
    setSelectedClaim(claim);
    navigate(`/insurance-claim/${claim.id}`);
  };

  const handleCreateReferral = (patientId: string) => {
    setReferralPatientId(patientId);
    setShowReferralForm(true);
  };

  const handleViewReferral = () => {
    // We're now handling this in the ReferralList component itself
    // This function is kept for compatibility with the ReferralList props
  };

  const handleSaveReferral = () => {
    setShowReferralForm(false);
    setSelectedReferral(null);
    setReferralPatientId('');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeTab={location.pathname} onTabChange={handleNavigation} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
          <Routes>
            {/* Common Routes */}
            <Route path="/" element={<DashboardRoute />} />
            <Route path="/patients" element={<PatientList onViewPatient={handleViewPatient} onEditPatient={handleEditPatient} onNewPatient={handleNewPatient} />} />
            <Route path="/patient-detail/:patientId" element={<PatientDetailRoute />} />
            <Route path="/patient-edit/:patientId" element={<PatientEditRoute />} />
            <Route path="/registration" element={<PatientForm onSave={handleSavePatient} onCancel={() => navigate('/patients')} />} />
            <Route path="/test-connection" element={<TestConnection />} />
            <Route path="/diagnostics" element={<DataLoadingDiagnostics />} />
            <Route path="/appointments" element={<AppointmentList onNewAppointment={handleNewAppointment} onEditAppointment={handleEditAppointment} />} />
            <Route path="/appointment/new" element={<AppointmentForm appointment={undefined} onSave={handleSaveAppointment} onCancel={() => navigate('/appointments')} />} />
            <Route path="/appointment-edit" element={selectedAppointment ? <AppointmentForm appointment={selectedAppointment} onSave={handleSaveAppointment} onCancel={() => navigate('/appointments')} /> : <div>Appointment not selected</div>} />
            <Route path="/doctor-queue" element={<DoctorQueue />} />
            <Route path="/emr" element={<EMRDashboard onCreateRecord={handleCreateRecord} onViewRecord={handleViewRecord} />} />
            <Route path="/emr/:patientId" element={<NewEMRRecordRoute />} />
            <Route path="/ophthalmology-emr/:patientId?" element={<OphthalmologyEMRRoute />} />
            <Route path="/imaging" element={<OphthalmologyImaging />} />
            <Route path="/lab-orders" element={<LabOrderList />} />
            <Route path="/results" element={<TestResults />} />
            <Route path="/prescriptions" element={<PrescriptionList />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/billing" element={<BillingDashboard onViewBill={handleViewBill} onViewClaim={handleViewClaim} />} />
            <Route path="/bill/:billId" element={<BillDetailRoute />} />
            <Route path="/referrals" element={<ReferralList onViewReferral={handleViewReferral} onNewReferral={handleNewPatient} />} />
            <Route path="/referral/new/:patientId?" element={<ReferralForm patientId={referralPatientId || ''} referral={undefined} onSave={handleSaveReferral} onCancel={() => navigate('/referrals')} />} />
            <Route path="/referral/:referralId" element={selectedReferral ? <ReferralForm patientId={selectedReferral.patientId} referral={selectedReferral} onSave={handleSaveReferral} onCancel={() => navigate('/referrals')} /> : <div>Referral not selected</div>} />
            <Route path="/chronic-disease" element={<ChronicDiseaseDashboard />} />
            <Route path="/reports" element={<ReportsDashboard />} />
            
            {/* Doctor-specific Routes */}
            <Route path="/doctor-appointments" element={<DoctorAppointmentDashboard />} />
            
            {/* Receptionist-specific Routes */}
            <Route path="/receptionist" element={<ReceptionistDashboard onViewBill={handleViewBill} onViewClaim={handleViewClaim} />} />
            <Route path="/process-existing-patients" element={<ProcessExistingPatients />} />
            <Route path="/insurance-management" element={<InsuranceManagementDashboard />} />
            <Route path="/insurance-verification" element={<InsuranceVerification />} />
            <Route path="/insurance-providers" element={<InsuranceProviders />} />
            <Route path="/insurance-submission" element={<ClaimSubmission />} />
            <Route path="/insurance-tracking" element={<ClaimTracking />} />
            <Route path="/insurance-reports" element={<InsuranceReports />} />
            <Route path="/receptionist/price-lookup" element={<PriceLookupAndEstimates />} />
            <Route path="/insurance-claim/:claimId" element={<ClaimDetailRoute />} />
            
            {/* Admin-specific Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* OT Coordinator Routes */}
            <Route path="/ot-dashboard" element={<OTDashboard />} />
            <Route path="/surgery-requests" element={<SurgeryRequests />} />
            <Route path="/ot-schedule" element={<OTSchedule />} />
            <Route path="/ot-resources" element={<OTResources />} />
            <Route path="/ot-checklists" element={<OTChecklists />} />
            <Route path="/ot-patient-queue" element={<OTPatientQueue />} />
            <Route path="/ot-reports" element={<OTReports />} />
            
            
            {/* Cashier Routes */}
            <Route path="/cashier-dashboard" element={<CashierDashboard />} />
            <Route path="/cashier-bills" element={<CashierDashboard />} />
            <Route path="/cashier-invoices" element={<InvoiceGeneration />} />
            <Route path="/cashier-outstanding" element={<OutstandingBills />} />
            <Route path="/cashier-insurance" element={<InsuranceClaims />} />
            <Route path="/cashier-reports" element={<ReportsReconciliations />} />
            
            {/* Physical Therapist Routes */}
            <Route path="/pt-dashboard" element={<PTDashboard />} />
            <Route path="/pt-appointments" element={<PTAppointments />} />
            <Route path="/pt-assessment" element={<PTAssessment />} />
            <Route path="/pt-plans" element={<PTTherapyPlans />} />
            <Route path="/pt-emr" element={<PTEMR />} />
            <Route path="/pt-reports" element={<PTReports />} />
            
            {/* Nurse Routes */}
            <Route path="/nurse-dashboard" element={<NurseDashboard />} />
            <Route path="/triage-queue" element={<TriageQueue />} />
            <Route path="/nurse-triage" element={<NurseTriageVitals />} />
            <Route path="/nurse-notes" element={<NurseCareNotes />} />
            <Route path="/nurse-mar" element={<NurseMedicationAdmin />} />
            <Route path="/nurse-procedures" element={<NurseProcedures />} />
            <Route path="/nurse-inpatient" element={<NurseInpatientCare />} />
            <Route path="/nurse-reports" element={<NurseReports />} />
            
            {/* HR Routes */}
            <Route path="/hr-dashboard" element={<HRDashboard />} />
            <Route path="/hr-staff" element={<StaffManagement />} />
            <Route path="/hr-recruitment" element={<Recruitment />} />
            <Route path="/hr-licensing" element={<LicensingCompliance />} />
            <Route path="/hr-attendance" element={<AttendanceScheduling />} />
            <Route path="/hr-training" element={<TrainingDevelopment />} />
            <Route path="/hr-performance" element={<PerformanceAppraisal />} />
            <Route path="/hr-reports" element={<HRReports />} />

            {/* Fallback Route */}
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function PatientNotSelectedRoute() {
  const navigate = useNavigate();
  
  // Redirect to main dashboard if no patient is selected
  React.useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

function DashboardRoute() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is a doctor to determine which dashboard to show
  const isDoctor = user?.role === 'doctor';
  const isOphthalmologist = user?.role === 'ophthalmologist';
  const isAdmin = user?.role === 'admin';
  const isOTCoordinator = user?.role === 'ot-coordinator';
  const isCashier = user?.role === 'cashier';
  const isPhysicalTherapist = user?.role === 'physical-therapist';
  const isNurse = user?.role === 'nurse';
  const isHR = user?.role === 'hr';
  
  // Use specialized dashboard for doctors
  if (isDoctor) {
    return <InternalMedicineDashboard />;
  }
  
  if (isOphthalmologist) {
    return <OphthalmologistDashboard />;
  }
  
  // Use admin dashboard for admin users
  if (isAdmin) {
    return <AdminDashboard />;
  }
  
  // Use OT dashboard for OT Coordinator
  if (isOTCoordinator) {
    return <OTDashboard />;
  }
  
  
  // Use Cashier dashboard
  if (isCashier) {
    return <CashierDashboard />;
  }
  
  // Use Physical Therapist dashboard
  if (isPhysicalTherapist) {
    return <PTDashboard />;
  }
  
  // Use Nurse dashboard for nurses
  if (isNurse) {
    return <NurseDashboard />;
  }
  
  // Use HR dashboard for HR staff
  if (isHR) {
    return <HRDashboard />;
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-600">
          {user?.department} • {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      {/* Show doctor appointment dashboard for doctors */}
      {user?.role === 'doctor' && (
        <div className="mb-8">
          <DoctorAppointmentDashboard />
        </div>
      )}
      
      <DashboardStats />
      
      {/* Quick Actions based on role */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {user?.role === 'receptionist' && (
            <>
              <button
                onClick={() => navigate('/registration')}
                className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-center transition-colors"
              >
                <div className="text-green-600 font-medium">New Patient Registration</div>
                <div className="text-xs text-green-700 mt-1">Auto-adds to triage queue</div>
              </button>
              <button
                onClick={() => navigate('/triage-queue')}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-center transition-colors"
              >
                <div className="text-blue-600 font-medium">Triage Queue</div>
                <div className="text-xs text-blue-700 mt-1">View patients waiting for triage</div>
              </button>
              <button
                onClick={() => navigate('/process-existing-patients')}
                className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 text-center transition-colors"
              >
                <div className="text-orange-600 font-medium">Process Existing Patients</div>
                <div className="text-xs text-orange-700 mt-1">Assign doctors & add to triage</div>
              </button>
              <button
                onClick={() => navigate('/insurance-management')}
                className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg p-4 text-center transition-colors"
              >
                <div className="text-indigo-600 font-medium">Insurance Management</div>
                <div className="text-xs text-indigo-700 mt-1">Validate, claim & track</div>
              </button>
              <button
                onClick={() => navigate('/receptionist')}
                className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-center transition-colors"
              >
                <div className="text-purple-600 font-medium">Billing & Claims</div>
                <div className="text-xs text-purple-700 mt-1">Legacy billing system</div>
              </button>
            </>
          )}
          
          {(isDoctor || isOphthalmologist) && (
            <>
              <button
                onClick={() => navigate('/doctor-queue')}
                className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-center transition-colors"
              >
                <div className="text-green-600 font-medium">Patient Queue</div>
                <div className="text-xs text-green-700 mt-1">Patients ready for consultation</div>
              </button>
              <button
                onClick={() => navigate('/emr')}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-center transition-colors"
              >
                <div className="text-blue-600 font-medium">Create Medical Record</div>
                <div className="text-xs text-blue-700 mt-1">Manual EMR creation</div>
              </button>
              <button
                onClick={() => navigate('/appointments')}
                className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 text-center transition-colors"
              >
                <div className="text-orange-600 font-medium">Scheduled Appointments</div>
                <div className="text-xs text-orange-700 mt-1">Pre-scheduled visits</div>
              </button>
            </>
          )}
          
          {isOTCoordinator && (
            <>
              <button
                onClick={() => navigate('/surgery-requests')}
                className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-center transition-colors"
              >
                <div className="text-green-600 font-medium">Surgery Requests</div>
              </button>
              <button
                onClick={() => navigate('/ot-schedule')}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-center transition-colors"
              >
                <div className="text-blue-600 font-medium">OT Schedule</div>
              </button>
              <button
                onClick={() => navigate('/ot-patient-queue')}
                className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-center transition-colors"
              >
                <div className="text-purple-600 font-medium">Patient Queue</div>
              </button>
              <button
                onClick={() => navigate('/ot-reports')}
                className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg p-4 text-center transition-colors"
              >
                <div className="text-indigo-600 font-medium">Reports</div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorProvider>
      <ErrorBoundary>
        <AuthProvider>
          <HospitalProvider>
            <AppContent />
            <ErrorDisplay />
          </HospitalProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ErrorProvider>
  );
}

export default App;