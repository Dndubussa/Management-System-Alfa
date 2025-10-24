import React, { useState } from 'react';
import { Save, X, CheckCircle, UserPlus } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Patient } from '../../types';
import InsuranceValidation from '../Receptionist/InsuranceValidation';
import { DuplicateDetection } from '../Common/DuplicateDetection';
import { useToast } from '../../context/ToastContext';
import { validateForm, commonSchemas } from '../../utils/formValidation';

interface PatientFormProps {
  patient?: Patient;
  onSave: (newPatient?: Patient) => void;
  onCancel: () => void;
}

export function PatientForm({ patient, onSave, onCancel }: PatientFormProps) {
  const { addPatient, updatePatient, addToQueue, addNotification, users } = useHospital();
  const { showError, showWarning, showSuccess, showInfo } = useToast();
  const [formData, setFormData] = useState({
    name: patient ? `${patient.firstName} ${patient.lastName}` : '',
    age: patient ? calculateAge(patient.dateOfBirth) : '',
    gender: patient?.gender || 'male' as const,
    phone: patient?.phone || '',
    address: patient?.address || '',
    emergencyContactName: patient?.emergencyContact?.name || '',
    emergencyContactPhone: patient?.emergencyContact?.phone || '',
    emergencyContactRelationship: patient?.emergencyContact?.relationship || '',
    paymentMethod: patient?.insuranceInfo?.provider === 'Direct' ? 'cash' : 
                   patient?.insuranceInfo?.provider === 'Lipa Kwa Simu' ? 'lipa-kwa-simu' :
                   patient?.insuranceInfo?.provider ? 'insurance' : 'cash',
    insuranceProvider: patient?.insuranceInfo?.provider && patient?.insuranceInfo?.provider !== 'Direct' && patient?.insuranceInfo?.provider !== 'Lipa Kwa Simu' ? patient?.insuranceInfo?.provider : '',
    insuranceMembershipNumber: patient?.insuranceInfo?.membershipNumber || '',
    cashAmount: patient?.insuranceInfo?.cashAmount || '',
    assignedDoctorId: patient?.assignedDoctorId || '',
    assignedDoctorName: patient?.assignedDoctorName || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [error, setError] = useState('');
  const [showInsuranceValidation, setShowInsuranceValidation] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<any>(null);
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showGlobalError, setShowGlobalError] = useState(false);

  // Helper function to calculate age from date of birth
  function calculateAge(dateOfBirth: string): string {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  }

  // Get available doctors based on insurance type
  const getAvailableDoctors = () => {
    const insuranceProvider = formData.insuranceProvider;
    
    if (insuranceProvider === 'NHIF') {
      // NHIF patients see general practitioners
      return users.filter(u => u.role === 'doctor');
    } else {
      // Non-NHIF patients can see any specialist
      return users.filter(u => 
        u.role === 'doctor' || 
        u.role === 'ophthalmologist' || 
        u.role === 'radiologist' || 
        u.role === 'physical-therapist'
      );
    }
  };

  const availableDoctors = getAvailableDoctors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    const validationSchema = {
      name: { required: true, minLength: 2, message: 'Patient name is required' },
      age: { required: true, min: 0, max: 150, message: 'Valid age is required' },
      phone: { required: true, pattern: /^[\+]?[0-9\s\-\(\)]{10,15}$/, message: 'Valid phone number is required' },
      address: { required: true, minLength: 5, message: 'Address is required' },
      emergencyContactName: { required: true, minLength: 2, message: 'Emergency contact name is required' },
      emergencyContactPhone: { required: true, pattern: /^[\+]?[0-9\s\-\(\)]{10,15}$/, message: 'Emergency contact phone is required' },
      emergencyContactRelationship: { required: true, message: 'Emergency contact relationship is required' }
    };

    const validation = validateForm(formData, validationSchema);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setShowGlobalError(true);
      return;
    }
    
    // Check for duplicates before submitting
    if (!patient && duplicateCheck?.isDuplicate && !allowDuplicate) {
      showWarning('Duplicate Patient Found', 'Please review the duplicate detection results before proceeding.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setValidationErrors({});

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Patient name is required');
      }
      if (!formData.age || parseInt(formData.age) <= 0) {
        throw new Error('Valid age is required');
      }
      if (!formData.phone.trim()) {
        throw new Error('Phone number is required');
      }
      if (formData.paymentMethod === 'insurance' && (!formData.insuranceProvider || !formData.insuranceMembershipNumber)) {
        throw new Error('Insurance provider and membership number are required when insurance is selected');
      }

      // Convert age back to date of birth for the API
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - parseInt(formData.age);
      const dateOfBirth = `${birthYear}-01-01`; // Approximate date of birth

      // Split name properly
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Ensure we have at least a first name
      if (!firstName) {
        throw new Error('Please enter a valid patient name');
      }

      const patientData = {
        firstName,
        lastName,
        dateOfBirth,
        gender: formData.gender,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        emergencyContact: {
          name: formData.emergencyContactName.trim(),
          phone: formData.emergencyContactPhone.trim(),
          relationship: formData.emergencyContactRelationship.trim()
        },
        insuranceInfo: {
          provider: formData.paymentMethod === 'cash' ? 'Direct' : 
                   formData.paymentMethod === 'lipa-kwa-simu' ? 'Lipa Kwa Simu' :
                   formData.insuranceProvider.trim(),
          membershipNumber: formData.paymentMethod === 'insurance' ? formData.insuranceMembershipNumber.trim() : '',
          cashAmount: '' // Cash amount will be set during billing after consultation
        },
        assignedDoctorId: formData.assignedDoctorId,
        assignedDoctorName: availableDoctors.find(d => d.id === formData.assignedDoctorId)?.name || '',
        assignmentDate: new Date().toISOString(),
        assignmentReason: formData.insuranceProvider === 'NHIF' ? 'NHIF patient - assigned to general practitioner' : 'Patient assigned to specialist'
      };


      let newPatient;
      if (patient) {
        await updatePatient(patient.id, patientData);
        // Show success message for updates
        setShowSuccessState(true);
        setTimeout(() => {
          setShowSuccessState(false);
          onSave();
        }, 2000);
      } else {
        newPatient = await addPatient(patientData);
        
        // For new patients with insurance, show insurance validation
        if (newPatient && newPatient.id && formData.paymentMethod === 'insurance') {
          setRegisteredPatient(newPatient);
          setShowInsuranceValidation(true);
        } else if (newPatient && newPatient.id) {
          // For cash patients, directly add to triage queue
          await addPatientToTriageQueue(newPatient, firstName, lastName);
          setShowSuccessState(true);
          setTimeout(() => {
            setShowSuccessState(false);
            onSave(newPatient);
          }, 2000);
        }
      }

    } catch (err: any) {
      console.error('Error saving patient:', err);
      setError(err.message || 'Failed to save patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addPatientToTriageQueue = async (newPatient: Patient, firstName: string, lastName: string) => {
    try {
      // Get assigned doctor info
      const assignedDoctor = availableDoctors.find(d => d.id === formData.assignedDoctorId);
      
      // Add patient to triage queue with assigned doctor
      await addToQueue({
        patientId: newPatient.id,
        department: 'general',
        priority: 'normal',
        status: 'waiting',
        workflowStage: 'reception',
        assignedDoctorId: formData.assignedDoctorId,
        assignedDoctorName: assignedDoctor?.name || '',
        assignmentReason: formData.insuranceProvider === 'NHIF' ? 'NHIF patient - assigned to general practitioner' : 'Patient assigned to specialist'
      });

      // Notify nurses about new patient
      const nurses = users.filter(u => u.role === 'nurse').map(u => u.id);
      if (nurses.length > 0) {
        addNotification({
          userIds: nurses,
          type: 'triage',
          title: 'New Patient for Triage',
          message: `Patient ${firstName} ${lastName} is waiting for triage. Assigned to Dr. ${assignedDoctor?.name || 'Unknown'}.`,
          isRead: false,
          patientId: newPatient.id
        });
      }

      // Notify assigned doctor
      if (assignedDoctor) {
        addNotification({
          userIds: [assignedDoctor.id],
          type: 'queue',
          title: 'New Patient Assigned',
          message: `Patient ${firstName} ${lastName} has been assigned to you and is waiting for triage.`,
          isRead: false,
          patientId: newPatient.id
        });
      }
    } catch (queueError) {
      console.error('Error adding patient to triage queue:', queueError);
      // Don't fail the registration if queue fails
    }
  };

  const handleInsuranceValidationComplete = async (isValid: boolean, validationData?: any) => {
    if (registeredPatient) {
      if (isValid) {
        // Insurance validated successfully, add to triage queue
        await addPatientToTriageQueue(registeredPatient, registeredPatient.firstName, registeredPatient.lastName);
        setShowSuccessState(true);
        setTimeout(() => {
          setShowSuccessState(false);
          onSave(registeredPatient);
        }, 2000);
      } else {
        // Insurance validation failed, but continue with cash payment
        await addPatientToTriageQueue(registeredPatient, registeredPatient.firstName, registeredPatient.lastName);
        setShowSuccessState(true);
        setTimeout(() => {
          setShowSuccessState(false);
          onSave(registeredPatient);
        }, 2000);
      }
    }
    setShowInsuranceValidation(false);
    setRegisteredPatient(null);
  };

  const handleInsuranceValidationCancel = () => {
    setShowInsuranceValidation(false);
    setRegisteredPatient(null);
  };

  // Show insurance validation if needed
  if (showInsuranceValidation && registeredPatient) {
    return (
      <InsuranceValidation
        patient={registeredPatient}
        onValidationComplete={handleInsuranceValidationComplete}
        onCancel={handleInsuranceValidationCancel}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Message */}
      {showSuccessState && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="text-sm font-medium text-green-800">Patient Registered Successfully!</h3>
            <p className="text-sm text-green-700">Patient information has been saved to the database.</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {patient ? 'Edit Patient Information' : 'Patient Registration'}
              </h2>
              <p className="text-green-100 text-sm">
                {patient ? 'Update patient details' : 'Register a new patient in the system'}
              </p>
            </div>
          </div>
        </div>

        {/* Global validation error message */}
        {showGlobalError && Object.keys(validationErrors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 relative">
            <button
              onClick={() => setShowGlobalError(false)}
              className="absolute top-2 right-2 text-red-400 hover:text-red-600"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Please fix the following errors:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(validationErrors).map(([field, message]) => (
                      <li key={field}>
                        <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span> {message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter patient's full name"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-500 ${
                validationErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {validationErrors.name && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-1">
                <p className="text-red-700 text-sm font-medium">{validationErrors.name}</p>
              </div>
            )}
          </div>

          {/* Age and Gender Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                name="age"
                required
                min="0"
                max="150"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age in years"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number (e.g., +254 700 000 000)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Address Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              name="address"
              required
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-500 resize-none"
            />
          </div>

          {/* Emergency Contact Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Emergency Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Emergency Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Enter emergency contact name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Emergency Contact Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  placeholder="Enter emergency contact phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Emergency Contact Relationship */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship
                </label>
                <select
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900"
                >
                  <option value="">Select Relationship</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Relative">Relative</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Doctor Assignment Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Doctor Assignment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assigned Doctor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Doctor *
                </label>
                <select
                  name="assignedDoctorId"
                  value={formData.assignedDoctorId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900"
                >
                  <option value="">Select Doctor</option>
                  {availableDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name} - {doctor.department}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {formData.insuranceProvider === 'NHIF' 
                    ? 'NHIF patients are assigned to general practitioners'
                    : 'Non-NHIF patients can be assigned to any specialist'
                  }
                </p>
              </div>

              {/* Doctor Assignment Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Info
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  {formData.assignedDoctorId ? (
                    <div>
                      <p><strong>Selected:</strong> {availableDoctors.find(d => d.id === formData.assignedDoctorId)?.name}</p>
                      <p><strong>Department:</strong> {availableDoctors.find(d => d.id === formData.assignedDoctorId)?.department}</p>
                      <p><strong>Insurance:</strong> {formData.insuranceProvider || 'Cash'}</p>
                    </div>
                  ) : (
                    <p>Please select a doctor to assign to this patient</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Payment Method
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900"
                >
                  <option value="cash">Cash</option>
                  <option value="insurance">Insurance</option>
                  <option value="lipa-kwa-simu">Lipa Kwa Simu</option>
                </select>
              </div>

              {/* Conditional Fields based on Payment Method */}
              <div>
                {formData.paymentMethod === 'cash' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 text-blue-600">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Cash Payment</p>
                        <p className="mt-1">Patient will pay directly with cash after consultation</p>
                      </div>
                    </div>
                  </div>
                )}
                {formData.paymentMethod === 'lipa-kwa-simu' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 text-green-600">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-sm text-green-800">
                        <p className="font-medium">Lipa Kwa Simu</p>
                        <p className="mt-1">Payment will be processed via mobile money after consultation</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Insurance Provider and Membership Number - Only shown when Insurance is selected */}
            {formData.paymentMethod === 'insurance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Provider
                  </label>
                  <select
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900"
                  >
                    <option value="">Select Insurance Provider</option>
                    <option value="NHIF">NHIF (National Health Insurance Fund)</option>
                    <option value="AAR">AAR Health Insurance</option>
                    <option value="Jubilee">Jubilee Health Insurance</option>
                    <option value="CIC">CIC Health Insurance</option>
                    <option value="UAP">UAP Health Insurance</option>
                    <option value="Resolution">Resolution Health Insurance</option>
                    <option value="Sanlam">Sanlam Health Insurance</option>
                    <option value="Britam">Britam Health Insurance</option>
                    <option value="APA">APA Health Insurance</option>
                    <option value="Minet">Minet Health Insurance</option>
                    <option value="Heritage">Heritage Health Insurance</option>
                    <option value="Prudential">Prudential Health Insurance</option>
                    <option value="Allianz">Allianz Health Insurance</option>
                    <option value="Liberty">Liberty Health Insurance</option>
                    <option value="First Assurance">First Assurance Health Insurance</option>
                    <option value="Kenindia">Kenindia Health Insurance</option>
                    <option value="Madison">Madison Health Insurance</option>
                    <option value="Takaful">Takaful Health Insurance</option>
                    <option value="GA Insurance">GA Insurance Health</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Membership Number
                  </label>
                  <input
                    type="text"
                    name="insuranceMembershipNumber"
                    value={formData.insuranceMembershipNumber}
                    onChange={handleChange}
                    placeholder="Enter insurance membership number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            )}

            {/* Payment Method Information Note */}
            {formData.paymentMethod && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 text-blue-600 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Payment Information</p>
                    <p className="mt-1">
                      {formData.paymentMethod === 'cash'
                        ? 'Patient will pay directly with cash after consultation'
                        : formData.paymentMethod === 'lipa-kwa-simu'
                        ? 'Payment will be processed via mobile money (Lipa Kwa Simu) after consultation'
                        : `Insurance claims will be processed through ${formData.insuranceProvider}`
                      }
                    </p>
                    {formData.insuranceMembershipNumber && formData.paymentMethod === 'insurance' && (
                      <p className="mt-1">
                        Membership Number: <span className="font-mono">{formData.insuranceMembershipNumber}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Duplicate Detection - Only show for new patients */}
          {!patient && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Duplicate Check
              </h3>
              
              <DuplicateDetection
                type="patient"
                data={{
                  firstName: formData.name.split(' ')[0] || '',
                  lastName: formData.name.split(' ').slice(1).join(' ') || '',
                  phone: formData.phone,
                  dateOfBirth: formData.age ? new Date().toISOString() : undefined,
                  insuranceInfo: formData.paymentMethod === 'insurance' ? {
                    provider: formData.insuranceProvider,
                    membershipNumber: formData.insuranceMembershipNumber
                  } : undefined
                }}
                onDuplicateFound={(result) => {
                  setDuplicateCheck(result);
                  if (result.isDuplicate) {
                    showWarning('Duplicate Patient Found', result.message);
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
                        Duplicate patient detected. Please review before proceeding.
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{patient ? 'Update Patient' : 'Register Patient'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}