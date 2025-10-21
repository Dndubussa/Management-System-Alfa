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
    paymentMethod: patient?.insuranceInfo?.provider === 'Direct' ? 'cash' : 
                   patient?.insuranceInfo?.provider === 'Lipa Kwa Simu' ? 'lipa-kwa-simu' :
                   patient?.insuranceInfo?.provider ? 'insurance' : 'cash',
    insuranceProvider: patient?.insuranceInfo?.provider && patient?.insuranceInfo?.provider !== 'Direct' && patient?.insuranceInfo?.provider !== 'Lipa Kwa Simu' ? patient?.insuranceInfo?.provider : '',
    insuranceMembershipNumber: patient?.insuranceInfo?.membershipNumber || '',
    cashAmount: patient?.insuranceInfo?.cashAmount || ''
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
        }
      };


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