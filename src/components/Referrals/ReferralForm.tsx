import React, { useState } from 'react';
import { X, User, Stethoscope, FileText } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Referral } from '../../types';

interface ReferralFormProps {
  patientId: string;
  referral?: Referral;
  onSave: () => void;
  onCancel: () => void;
}

export function ReferralForm({ patientId, referral, onSave, onCancel }: ReferralFormProps) {
  const { patients, addReferral, updateReferralStatus } = useHospital();
  const { user } = useAuth();
  const [specialist, setSpecialist] = useState(referral?.specialist || '');
  const [reason, setReason] = useState(referral?.reason || '');
  const [notes, setNotes] = useState(referral?.notes || '');

  const patient = patients.find(p => p.id === patientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (referral) {
      // Update existing referral
      updateReferralStatus(referral.id, referral.status);
    } else {
      // Create new referral
      addReferral({
        patientId,
        referringDoctorId: user.id,
        specialist,
        reason,
        status: 'pending',
        notes
      });
    }
    
    onSave();
  };

  const specialistOptions = [
    'Cardiologist',
    'Nephrologist',
    'Neurologist',
    'Endocrinologist',
    'Gastroenterologist',
    'Pulmonologist',
    'Orthopedic Surgeon',
    'Ophthalmologist',
    'ENT Specialist',
    'Dermatologist'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {referral ? 'Update Referral' : 'Create New Referral'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {patient && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <User className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">Patient ID: {patient.id}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialist Type
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={specialist}
                  onChange={(e) => setSpecialist(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Select a specialist</option>
                  {specialistOptions.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Referral
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Describe the reason for referral..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Any additional information for the specialist..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                {referral ? 'Update Referral' : 'Create Referral'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}