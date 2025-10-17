import React, { useState } from 'react';
import { Save, X, CheckCircle, UserPlus } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Patient } from '../../types';

interface PatientFormProps {
  patient?: Patient;
  onSave: () => void;
  onCancel: () => void;
}

export function PatientForm({ patient, onSave, onCancel }: PatientFormProps) {
  const { addPatient, updatePatient } = useHospital();
  const [formData, setFormData] = useState({
    name: patient ? `${patient.firstName} ${patient.lastName}` : '',
    age: patient ? calculateAge(patient.dateOfBirth) : '',
    gender: patient?.gender || 'male' as const,
    phone: patient?.phone || '',
    address: patient?.address || '',
    emergencyContactName: patient?.emergencyContact?.name || '',
    emergencyContactPhone: patient?.emergencyContact?.phone || '',
    emergencyContactRelationship: patient?.emergencyContact?.relationship || '',
    insuranceProvider: patient?.insuranceInfo?.provider || '',
    insuranceMembershipNumber: patient?.insuranceInfo?.membershipNumber || '',
    cashAmount: '' // New field for cash payments
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

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
      if (formData.insuranceProvider === 'Direct' && (!formData.cashAmount || Number(formData.cashAmount) <= 0)) {
        throw new Error('Cash amount is required and must be greater than 0');
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
          provider: formData.insuranceProvider.trim(),
          membershipNumber: formData.insuranceProvider === 'Direct' ? '' : formData.insuranceMembershipNumber.trim(),
          cashAmount: formData.insuranceProvider === 'Direct' ? formData.cashAmount : ''
        }
      };

      console.log('Submitting patient data:', patientData);

      if (patient) {
        await updatePatient(patient.id, patientData);
      } else {
        await addPatient(patientData);
      }

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSave();
      }, 2000);

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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Message */}
      {showSuccess && (
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-500"
            />
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

          {/* Insurance Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Insurance Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Insurance Provider */}
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
                  <option value="Direct">Direct Payment (Cash)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Conditional Field: Membership Number or Cash Amount */}
              <div>
                {formData.insuranceProvider === 'Direct' ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cash Amount (TZS)
                    </label>
                    <input
                      type="number"
                      name="cashAmount"
                      value={formData.cashAmount}
                      onChange={handleChange}
                      placeholder="Enter cash amount"
                      min="0"
                      step="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-500"
                    />
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>

            {/* Insurance Information Note */}
            {formData.insuranceProvider && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 text-blue-600 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Insurance Information</p>
                    <p className="mt-1">
                      {formData.insuranceProvider === 'Direct'
                        ? 'Patient will pay directly (cash payment)'
                        : `Insurance claims will be processed through ${formData.insuranceProvider}`
                      }
                    </p>
                    {formData.insuranceProvider === 'Direct' && formData.cashAmount && (
                      <p className="mt-1 text-green-700 font-medium">
                        Cash Amount: {new Intl.NumberFormat('sw-TZ', {
                          style: 'currency',
                          currency: 'TZS',
                          minimumFractionDigits: 0
                        }).format(Number(formData.cashAmount))}
                      </p>
                    )}
                    {formData.insuranceMembershipNumber && formData.insuranceProvider !== 'Direct' && (
                      <p className="mt-1">
                        Membership Number: <span className="font-mono">{formData.insuranceMembershipNumber}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

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