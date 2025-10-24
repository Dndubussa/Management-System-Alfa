import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Plus, 
  Minus, 
  Heart, 
  Stethoscope, 
  Activity,
  FileText,
  Calendar,
  TestTube,
  Pill,
  Users,
  Download
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { MedicalRecord, Prescription, LabOrder, Patient } from '../../types';
import { exportEMRToCSV, exportEMRToJSON, exportEMRToText, exportEMRToHTML, downloadFile } from '../../utils/emrExport';
import { DuplicateDetection } from '../Common/DuplicateDetection';
import { useToast } from '../../context/ToastContext';
import { validateForm } from '../../utils/formValidation';

interface InternalMedicineEMRFormProps {
  patientId: string;
  record?: MedicalRecord;
  onSave: () => void;
  onCancel: () => void;
}

export function InternalMedicineEMRForm({ patientId, record, onSave, onCancel }: InternalMedicineEMRFormProps) {
  const { addMedicalRecord, patients, addNotification, servicePrices } = useHospital();
  const { user } = useAuth();
  const { showError, showWarning, showSuccess } = useToast();
  const [triageVitals, setTriageVitals] = useState<any>(null);
  const [vitalsLoaded, setVitalsLoaded] = useState(false);
  
  const patient = patients.find(p => p.id === patientId);
  
  const [formData, setFormData] = useState({
    visitDate: record?.visitDate || new Date().toISOString().split('T')[0],
    chiefComplaint: record?.chiefComplaint || '',
    historyOfPresentIllness: record?.notes?.includes('HPI:') ? record.notes.split('HPI:')[1]?.split('PMH:')[0]?.trim() || '' : '',
    pastMedicalHistory: record?.notes?.includes('PMH:') ? record.notes.split('PMH:')[1]?.split('FH:')[0]?.trim() || '' : '',
    familyHistory: record?.notes?.includes('FH:') ? record.notes.split('FH:')[1]?.split('SH:')[0]?.trim() || '' : '',
    socialHistory: record?.notes?.includes('SH:') ? record.notes.split('SH:')[1]?.split('MH:')[0]?.trim() || '' : '',
    medicationHistory: record?.notes?.includes('MH:') ? record.notes.split('MH:')[1] || '' : '',
    diagnosis: record?.diagnosis || '',
    treatment: record?.treatment || '',
    vitals: {
      bloodPressure: record?.vitals?.bloodPressure || '',
      heartRate: record?.vitals?.heartRate || '',
      temperature: record?.vitals?.temperature || '',
      weight: record?.vitals?.weight || '',
      height: record?.vitals?.height || '',
      respiratoryRate: '',
      oxygenSaturation: ''
    },
    status: record?.status || 'active' as const
  });

  const [duplicateCheck, setDuplicateCheck] = useState<any>(null);
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showGlobalError, setShowGlobalError] = useState(false);

  // Load triage vital signs when component mounts
  useEffect(() => {
    const loadTriageVitals = async () => {
      if (!patientId || vitalsLoaded) return;
      
      try {
        const response = await fetch(`/api/vital-signs/${patientId}/latest`);
        if (response.ok) {
          const vitals = await response.json();
          if (vitals) {
            setTriageVitals(vitals);
            // Auto-populate form with triage vitals if not already set
            setFormData(prev => ({
              ...prev,
              vitals: {
                ...prev.vitals,
                bloodPressure: prev.vitals.bloodPressure || `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}` || '',
                heartRate: prev.vitals.heartRate || vitals.pulse?.toString() || '',
                temperature: prev.vitals.temperature || vitals.temperature?.toString() || '',
                weight: prev.vitals.weight || vitals.weight?.toString() || '',
                height: prev.vitals.height || vitals.height?.toString() || '',
                respiratoryRate: prev.vitals.respiratoryRate || vitals.respiratoryRate?.toString() || '',
                oxygenSaturation: prev.vitals.oxygenSaturation || vitals.oxygenSaturation?.toString() || ''
              }
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load triage vitals:', error);
      } finally {
        setVitalsLoaded(true);
      }
    };

    loadTriageVitals();
  }, [patientId, vitalsLoaded]);

  const [prescriptions, setPrescriptions] = useState<Omit<Prescription, 'id' | 'recordId' | 'patientId' | 'doctorId' | 'status' | 'createdAt'>[]>(
    record?.prescriptions?.map(p => ({
      medication: p.medication,
      dosage: p.dosage,
      frequency: p.frequency,
      duration: p.duration,
      instructions: p.instructions
    })) || []
  );

  const [labOrders, setLabOrders] = useState<Omit<LabOrder, 'id' | 'recordId' | 'patientId' | 'doctorId' | 'status' | 'createdAt' | 'results' | 'completedAt'>[]>(
    record?.labOrders?.map(l => ({
      testName: l.testName,
      instructions: l.instructions
    })) || []
  );

  const [referrals, setReferrals] = useState<{specialist: string, reason: string}[]>([]);
  const [admissionRequest, setAdmissionRequest] = useState({ required: false, reason: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    const validationSchema = {
      chiefComplaint: { required: true, minLength: 5, message: 'Chief complaint is required (minimum 5 characters)' },
      historyOfPresentIllness: { required: true, minLength: 10, message: 'History of present illness is required (minimum 10 characters)' },
      physicalExamination: { required: true, minLength: 10, message: 'Physical examination is required (minimum 10 characters)' },
      assessment: { required: true, minLength: 5, message: 'Assessment is required (minimum 5 characters)' },
      plan: { required: true, minLength: 5, message: 'Plan is required (minimum 5 characters)' }
    };

    const validation = validateForm(medicalRecord, validationSchema);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setShowGlobalError(true);
      return;
    }
    
    // Check for duplicates before submitting
    if (!record && duplicateCheck?.isDuplicate && !allowDuplicate) {
      showWarning('Duplicate Medical Record Found', 'Please review the duplicate detection results before proceeding.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const now = new Date().toISOString();
    
    // Prepare prescriptions with full data
    const fullPrescriptions: Prescription[] = prescriptions.map((p, index) => ({
      id: `${Date.now()}-${index}`,
      recordId: record?.id || `${Date.now()}`,
      patientId,
      doctorId: user?.id || '',
      ...p,
      status: 'pending' as const,
      createdAt: now
    }));

    // Prepare lab orders with full data
    const fullLabOrders: LabOrder[] = labOrders.map((l, index) => ({
      id: `${Date.now()}-lab-${index}`,
      recordId: record?.id || `${Date.now()}`,
      patientId,
      doctorId: user?.id || '',
      ...l,
      status: 'ordered' as const,
      createdAt: now
    }));

    // Combine all notes into a structured format
    const combinedNotes = `
HPI: ${formData.historyOfPresentIllness}
PMH: ${formData.pastMedicalHistory}
FH: ${formData.familyHistory}
SH: ${formData.socialHistory}
MH: ${formData.medicationHistory}
    `.trim();

    const medicalRecord: Omit<MedicalRecord, 'id'> = {
      patientId,
      doctorId: user?.id || '',
      visitDate: formData.visitDate,
      chiefComplaint: formData.chiefComplaint,
      diagnosis: formData.diagnosis,
      diagnosisCodes: record?.diagnosisCodes || [],
      treatment: formData.treatment,
      notes: combinedNotes,
      vitals: formData.vitals,
      prescriptions: fullPrescriptions,
      labOrders: fullLabOrders,
      status: formData.status
    };

    addMedicalRecord(medicalRecord);

    // Send notifications to pharmacy for prescriptions
    if (fullPrescriptions.length > 0) {
      addNotification({
        userIds: ['4'], // Pharmacy user ID
        type: 'prescription',
        title: 'New Prescription Order',
        message: `${fullPrescriptions.length} prescription(s) for ${patient?.firstName} ${patient?.lastName}`,
        isRead: false
      });
    }

    // Send notifications to lab for lab orders
    if (fullLabOrders.length > 0) {
      addNotification({
        userIds: ['3'], // Lab user ID
        type: 'lab-order',
        title: 'New Lab Order',
        message: `${fullLabOrders.length} lab order(s) for ${patient?.firstName} ${patient?.lastName}`,
        isRead: false
      });
    }

    // Send notification for admission request if needed
    if (admissionRequest.required) {
      addNotification({
        userIds: ['1'], // Receptionist/Inpatient coordinator
        type: 'general',
        title: 'Admission Request',
        message: `Admission requested for ${patient?.firstName} ${patient?.lastName}: ${admissionRequest.reason}`,
        isRead: false
      });
    }

    onSave();
    } catch (error) {
      console.error('Error saving medical record:', error);
      showError('Save Failed', 'There was an error saving the medical record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('vitals.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addPrescription = () => {
    setPrescriptions(prev => [...prev, {
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prev => prev.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: string, value: string) => {
    setPrescriptions(prev => prev.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    ));
  };

  const addLabOrder = () => {
    setLabOrders(prev => [...prev, {
      testName: '',
      instructions: ''
    }]);
  };

  const removeLabOrder = (index: number) => {
    setLabOrders(prev => prev.filter((_, i) => i !== index));
  };

  const updateLabOrder = (index: number, field: string, value: string) => {
    setLabOrders(prev => prev.map((l, i) => 
      i === index ? { ...l, [field]: value } : l
    ));
  };

  const addReferral = () => {
    setReferrals(prev => [...prev, { specialist: '', reason: '' }]);
  };

  const removeReferral = (index: number) => {
    setReferrals(prev => prev.filter((_, i) => i !== index));
  };

  const updateReferral = (index: number, field: string, value: string) => {
    setReferrals(prev => prev.map((r, i) => 
      i === index ? { ...r, [field]: value } : r
    ));
  };

  // Get common lab tests for Internal Medicine
  const commonLabTests = servicePrices
    .filter(service => service.category === 'lab-test')
    .map(service => service.serviceName);

  // Get common medications for Internal Medicine
  const commonMedications = servicePrices
    .filter(service => service.category === 'medication')
    .map(service => service.serviceName);

  // Export current record
  const handleExportCSV = () => {
    if (!patient) return;
    
    // Create a temporary record object for export
    const combinedNotes = `
HPI: ${formData.historyOfPresentIllness}
PMH: ${formData.pastMedicalHistory}
FH: ${formData.familyHistory}
SH: ${formData.socialHistory}
MH: ${formData.medicationHistory}
    `.trim();
    
    const tempRecord: MedicalRecord = {
      id: record?.id || 'new',
      patientId,
      doctorId: user?.id || '',
      visitDate: formData.visitDate,
      chiefComplaint: formData.chiefComplaint,
      diagnosis: formData.diagnosis,
      diagnosisCodes: record?.diagnosisCodes || [],
      treatment: formData.treatment,
      notes: combinedNotes,
      vitals: {
        bloodPressure: formData.vitals.bloodPressure,
        heartRate: formData.vitals.heartRate,
        temperature: formData.vitals.temperature,
        weight: formData.vitals.weight,
        height: formData.vitals.height
      },
      prescriptions: prescriptions.map((p, index) => ({
        id: `${Date.now()}-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...p,
        status: 'pending',
        createdAt: new Date().toISOString()
      })),
      labOrders: labOrders.map((l, index) => ({
        id: `${Date.now()}-lab-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...l,
        status: 'ordered',
        results: undefined,
        createdAt: new Date().toISOString(),
        completedAt: undefined
      })),
      status: formData.status
    };
    
    const csvContent = exportEMRToCSV(patient, [tempRecord]);
    downloadFile(csvContent, `emr-${patient.firstName}-${patient.lastName}-record.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    if (!patient) return;
    
    // Create a temporary record object for export
    const combinedNotes = `
HPI: ${formData.historyOfPresentIllness}
PMH: ${formData.pastMedicalHistory}
FH: ${formData.familyHistory}
SH: ${formData.socialHistory}
MH: ${formData.medicationHistory}
    `.trim();
    
    const tempRecord: MedicalRecord = {
      id: record?.id || 'new',
      patientId,
      doctorId: user?.id || '',
      visitDate: formData.visitDate,
      chiefComplaint: formData.chiefComplaint,
      diagnosis: formData.diagnosis,
      diagnosisCodes: record?.diagnosisCodes || [],
      treatment: formData.treatment,
      notes: combinedNotes,
      vitals: {
        bloodPressure: formData.vitals.bloodPressure,
        heartRate: formData.vitals.heartRate,
        temperature: formData.vitals.temperature,
        weight: formData.vitals.weight,
        height: formData.vitals.height
      },
      prescriptions: prescriptions.map((p, index) => ({
        id: `${Date.now()}-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...p,
        status: 'pending',
        createdAt: new Date().toISOString()
      })),
      labOrders: labOrders.map((l, index) => ({
        id: `${Date.now()}-lab-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...l,
        status: 'ordered',
        results: undefined,
        createdAt: new Date().toISOString(),
        completedAt: undefined
      })),
      status: formData.status
    };
    
    const jsonContent = exportEMRToJSON(patient, [tempRecord]);
    downloadFile(jsonContent, `emr-${patient.firstName}-${patient.lastName}-record.json`, 'application/json');
  };

  const handleExportText = () => {
    if (!patient) return;
    
    // Create a temporary record object for export
    const combinedNotes = `
HPI: ${formData.historyOfPresentIllness}
PMH: ${formData.pastMedicalHistory}
FH: ${formData.familyHistory}
SH: ${formData.socialHistory}
MH: ${formData.medicationHistory}
    `.trim();
    
    const tempRecord: MedicalRecord = {
      id: record?.id || 'new',
      patientId,
      doctorId: user?.id || '',
      visitDate: formData.visitDate,
      chiefComplaint: formData.chiefComplaint,
      diagnosis: formData.diagnosis,
      diagnosisCodes: record?.diagnosisCodes || [],
      treatment: formData.treatment,
      notes: combinedNotes,
      vitals: {
        bloodPressure: formData.vitals.bloodPressure,
        heartRate: formData.vitals.heartRate,
        temperature: formData.vitals.temperature,
        weight: formData.vitals.weight,
        height: formData.vitals.height
      },
      prescriptions: prescriptions.map((p, index) => ({
        id: `${Date.now()}-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...p,
        status: 'pending',
        createdAt: new Date().toISOString()
      })),
      labOrders: labOrders.map((l, index) => ({
        id: `${Date.now()}-lab-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...l,
        status: 'ordered',
        results: undefined,
        createdAt: new Date().toISOString(),
        completedAt: undefined
      })),
      status: formData.status
    };
    
    const textContent = exportEMRToText(patient, [tempRecord]);
    downloadFile(textContent, `emr-${patient.firstName}-${patient.lastName}-record.txt`, 'text/plain');
  };

  const handleExportHTML = () => {
    if (!patient) return;
    
    // Create a temporary record object for export
    const combinedNotes = `
HPI: ${formData.historyOfPresentIllness}
PMH: ${formData.pastMedicalHistory}
FH: ${formData.familyHistory}
SH: ${formData.socialHistory}
MH: ${formData.medicationHistory}
    `.trim();
    
    const tempRecord: MedicalRecord = {
      id: record?.id || 'new',
      patientId,
      doctorId: user?.id || '',
      visitDate: formData.visitDate,
      chiefComplaint: formData.chiefComplaint,
      diagnosis: formData.diagnosis,
      diagnosisCodes: record?.diagnosisCodes || [],
      treatment: formData.treatment,
      notes: combinedNotes,
      vitals: {
        bloodPressure: formData.vitals.bloodPressure,
        heartRate: formData.vitals.heartRate,
        temperature: formData.vitals.temperature,
        weight: formData.vitals.weight,
        height: formData.vitals.height
      },
      prescriptions: prescriptions.map((p, index) => ({
        id: `${Date.now()}-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...p,
        status: 'pending',
        createdAt: new Date().toISOString()
      })),
      labOrders: labOrders.map((l, index) => ({
        id: `${Date.now()}-lab-${index}`,
        recordId: record?.id || `${Date.now()}`,
        patientId,
        doctorId: user?.id || '',
        ...l,
        status: 'ordered',
        results: undefined,
        createdAt: new Date().toISOString(),
        completedAt: undefined
      })),
      status: formData.status
    };
    
    const htmlContent = exportEMRToHTML(patient, [tempRecord]);
    downloadFile(htmlContent, `emr-${patient.firstName}-${patient.lastName}-record.html`, 'text/html');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-6xl mx-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {record ? 'Edit Medical Record' : 'New Medical Record'} - Internal Medicine
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Patient: {patient?.firstName} {patient?.lastName} (ID: {patient?.id})
            </p>
          </div>
          <div className="relative group">
            <button className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-10">
              <button
                onClick={handleExportCSV}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export as CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export as JSON
              </button>
              <button
                onClick={handleExportText}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export as Text
              </button>
              <button
                onClick={handleExportHTML}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export as HTML
              </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Visit Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Visit Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visit Date *
              </label>
              <input
                type="date"
                name="visitDate"
                required
                value={formData.visitDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Duplicate Detection - Only show for new records */}
        {!record && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Duplicate Check
            </h3>
            
            <DuplicateDetection
              type="medical_record"
              data={{
                patientId: patientId,
                doctorId: user?.id || '',
                visitDate: formData.visitDate
              }}
              onDuplicateFound={(result) => {
                setDuplicateCheck(result);
                if (result.isDuplicate) {
                  showWarning('Duplicate Medical Record Found', result.message);
                }
              }}
              onNoDuplicate={() => {
                setDuplicateCheck(null);
              }}
              showSuggestions={true}
              autoCheck={true}
            />

            {duplicateCheck?.isDuplicate && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 text-red-600">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-red-800">
                      Duplicate medical record detected. Please review before proceeding.
                    </span>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={allowDuplicate}
                      onChange={(e) => setAllowDuplicate(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-red-700">Proceed anyway</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chief Complaint */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Chief Complaint
          </h3>
          <div>
            <textarea
              name="chiefComplaint"
              required
              rows={3}
              value={formData.chiefComplaint}
              onChange={handleChange}
              placeholder="Primary reason for patient visit (e.g., chest pain, fever, fatigue)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* History Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-600" />
            Patient History
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                History of Present Illness (HPI)
              </label>
              <textarea
                name="historyOfPresentIllness"
                rows={4}
                value={formData.historyOfPresentIllness}
                onChange={handleChange}
                placeholder="Detailed history of current complaint: onset, duration, severity, associated symptoms, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Past Medical History (PMH)
              </label>
              <textarea
                name="pastMedicalHistory"
                rows={4}
                value={formData.pastMedicalHistory}
                onChange={handleChange}
                placeholder="Chronic conditions, previous illnesses, surgeries (e.g., diabetes, HTN, asthma, HIV)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Family History (FH)
              </label>
              <textarea
                name="familyHistory"
                rows={4}
                value={formData.familyHistory}
                onChange={handleChange}
                placeholder="Relevant family medical history (e.g., heart disease, diabetes, cancer)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Social History (SH)
              </label>
              <textarea
                name="socialHistory"
                rows={4}
                value={formData.socialHistory}
                onChange={handleChange}
                placeholder="Lifestyle factors: smoking, alcohol, occupation, living situation"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medication History (MH)
              </label>
              <textarea
                name="medicationHistory"
                rows={3}
                value={formData.medicationHistory}
                onChange={handleChange}
                placeholder="Current and recent medications, allergies, adverse reactions"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Physical Examination */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
            Physical Examination
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vital Signs
                {triageVitals && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    📋 From Triage
                  </span>
                )}
              </label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="vitals.bloodPressure"
                    value={formData.vitals.bloodPressure}
                    onChange={handleChange}
                    placeholder="BP (e.g., 120/80)"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                  <input
                    type="text"
                    name="vitals.heartRate"
                    value={formData.vitals.heartRate}
                    onChange={handleChange}
                    placeholder="HR (bpm)"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="vitals.temperature"
                    value={formData.vitals.temperature}
                    onChange={handleChange}
                    placeholder="Temp (°C)"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                  <input
                    type="text"
                    name="vitals.respiratoryRate"
                    value={formData.vitals.respiratoryRate}
                    onChange={handleChange}
                    placeholder="RR (bpm)"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="vitals.oxygenSaturation"
                    value={formData.vitals.oxygenSaturation}
                    onChange={handleChange}
                    placeholder="O2 Sat (%)"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="vitals.weight"
                      value={formData.vitals.weight}
                      onChange={handleChange}
                      placeholder="Weight (kg)"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                    <input
                      type="text"
                      name="vitals.height"
                      value={formData.vitals.height}
                      onChange={handleChange}
                      placeholder="Height (cm)"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System-Based Examination
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Heart className="w-4 h-4 mr-1 text-red-500" />
                    Cardiovascular
                  </h4>
                  <textarea
                    name="cardioExam"
                    rows={3}
                    placeholder="Heart sounds, murmurs, rhythm, peripheral pulses"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Activity className="w-4 h-4 mr-1 text-blue-500" />
                    Respiratory
                  </h4>
                  <textarea
                    name="respiratoryExam"
                    rows={3}
                    placeholder="Breath sounds, chest expansion, accessory muscle use"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Abdomen</h4>
                  <textarea
                    name="abdomenExam"
                    rows={3}
                    placeholder="Inspection, palpation, percussion, auscultation"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Neurological</h4>
                  <textarea
                    name="neuroExam"
                    rows={3}
                    placeholder="Mental status, cranial nerves, motor, sensory, reflexes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Orders */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <TestTube className="w-5 h-5 mr-2 text-green-600" />
            Clinical Orders
          </h3>
          
          {/* Lab Orders */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-medium text-gray-800">Lab Orders</h4>
              <button
                type="button"
                onClick={addLabOrder}
                className="text-green-600 hover:text-green-800 flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Lab Order
              </button>
            </div>
            
            {labOrders.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No lab orders added</p>
            ) : (
              <div className="space-y-3">
                {labOrders.map((labOrder, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-md">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Test Name
                        </label>
                        <select
                          value={labOrder.testName}
                          onChange={(e) => updateLabOrder(index, 'testName', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Select a test</option>
                          {commonLabTests.map((test, i) => (
                            <option key={i} value={test}>{test}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Instructions
                        </label>
                        <input
                          type="text"
                          value={labOrder.instructions}
                          onChange={(e) => updateLabOrder(index, 'instructions', e.target.value)}
                          placeholder="Special instructions"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLabOrder(index)}
                      className="mt-5 text-red-500 hover:text-red-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Radiology Orders */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-medium text-gray-800">Radiology Orders</h4>
              <button
                type="button"
                onClick={() => setLabOrders([...labOrders, { testName: '', instructions: 'Radiology order' }])}
                className="text-green-600 hover:text-green-800 flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Radiology Order
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setLabOrders([...labOrders, { testName: 'Chest X-ray', instructions: '' }])}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md text-blue-700 text-sm transition-colors"
              >
                Chest X-ray
              </button>
              <button
                type="button"
                onClick={() => setLabOrders([...labOrders, { testName: 'Ultrasound', instructions: '' }])}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md text-blue-700 text-sm transition-colors"
              >
                Ultrasound
              </button>
              <button
                type="button"
                onClick={() => setLabOrders([...labOrders, { testName: 'CT Scan', instructions: '' }])}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md text-blue-700 text-sm transition-colors"
              >
                CT Scan
              </button>
            </div>
          </div>
        </div>

        {/* Diagnosis & Notes */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-600" />
            Diagnosis & Clinical Notes
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preliminary & Final Diagnosis
              </label>
              <textarea
                name="diagnosis"
                required
                rows={3}
                value={formData.diagnosis}
                onChange={handleChange}
                placeholder="Enter diagnosis with ICD-10/SNOMED CT codes if applicable"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Plan
              </label>
              <textarea
                name="treatment"
                rows={3}
                value={formData.treatment}
                onChange={handleChange}
                placeholder="Comprehensive treatment plan including medications, lifestyle advice, and follow-up instructions"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Prescriptions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Pill className="w-5 h-5 mr-2 text-green-600" />
              Prescriptions
            </h3>
            <button
              type="button"
              onClick={addPrescription}
              className="text-green-600 hover:text-green-800 flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Prescription
            </button>
          </div>
          
          {prescriptions.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No prescriptions added</p>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medication
                      </label>
                      <select
                        value={prescription.medication}
                        onChange={(e) => updatePrescription(index, 'medication', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Select a medication</option>
                        {commonMedications.map((med, i) => (
                          <option key={i} value={med}>{med}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        value={prescription.dosage}
                        onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <input
                        type="text"
                        value={prescription.frequency}
                        onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                        placeholder="e.g., BID"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={prescription.duration}
                        onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                        placeholder="e.g., 7 days"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Instructions
                      </label>
                      <input
                        type="text"
                        value={prescription.instructions}
                        onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                        placeholder="Special instructions for patient"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePrescription(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Referrals */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              Referrals & Consultations
            </h3>
            <button
              type="button"
              onClick={addReferral}
              className="text-green-600 hover:text-green-800 flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Referral
            </button>
          </div>
          
          {referrals.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No referrals added</p>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-md">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Specialist
                      </label>
                      <input
                        type="text"
                        value={referral.specialist}
                        onChange={(e) => updateReferral(index, 'specialist', e.target.value)}
                        placeholder="e.g., Cardiologist, Surgeon"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Reason for Referral
                      </label>
                      <input
                        type="text"
                        value={referral.reason}
                        onChange={(e) => updateReferral(index, 'reason', e.target.value)}
                        placeholder="Reason for referral"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeReferral(index)}
                    className="mt-5 text-red-500 hover:text-red-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admission Request */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Admission Request</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="admissionRequired"
                checked={admissionRequest.required}
                onChange={(e) => setAdmissionRequest(prev => ({
                  ...prev,
                  required: e.target.checked
                }))}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="admissionRequired" className="ml-2 block text-sm text-gray-700">
                Admission Required
              </label>
            </div>
            
            {admissionRequest.required && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Admission
                </label>
                <textarea
                  value={admissionRequest.reason}
                  onChange={(e) => setAdmissionRequest(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                  rows={2}
                  placeholder="Justification for inpatient admission"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-1"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 inline mr-1" />
                Save Record
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
