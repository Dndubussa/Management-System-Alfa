import React, { useState, useEffect } from 'react';
import { User, Shield, CreditCard, Stethoscope, Eye, Activity, Users } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Patient, User as Doctor } from '../../types';

interface DoctorAssignmentProps {
  patient: Patient;
  onDoctorAssigned: (doctorId: string, doctorName: string) => void;
  onCancel: () => void;
}

export function DoctorAssignment({ patient, onDoctorAssigned, onCancel }: DoctorAssignmentProps) {
  const { users, updatePatient } = useHospital();
  const { user } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [assignmentReason, setAssignmentReason] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Get available doctors based on patient's insurance type
  const getAvailableDoctors = () => {
    const allDoctors = users.filter(u => 
      u.role === 'doctor' || 
      u.role === 'ophthalmologist' || 
      u.role === 'radiologist' || 
      u.role === 'physical-therapist'
    );

    // Filter doctors based on insurance type
    if (patient.insuranceInfo?.provider === 'NHIF') {
      // NHIF patients should see NHIF-contracted doctors
      // For now, we'll show all doctors, but in a real system, 
      // doctors would have a flag indicating if they're NHIF-contracted
      return allDoctors.filter(doctor => 
        doctor.role === 'doctor' || doctor.role === 'ophthalmologist'
      );
    } else {
      // Non-NHIF patients can see any available doctor/specialist
      return allDoctors;
    }
  };

  const availableDoctors = getAvailableDoctors();

  // Auto-assign doctor based on patient needs
  const getRecommendedDoctor = () => {
    if (availableDoctors.length === 0) return null;

    // For NHIF patients, prefer general practitioners
    if (patient.insuranceInfo?.provider === 'NHIF') {
      const generalDoctors = availableDoctors.filter(d => d.role === 'doctor');
      return generalDoctors.length > 0 ? generalDoctors[0] : availableDoctors[0];
    }

    // For non-NHIF patients, we could implement more sophisticated logic
    // For now, just return the first available doctor
    return availableDoctors[0];
  };

  const recommendedDoctor = getRecommendedDoctor();

  // Auto-select recommended doctor
  useEffect(() => {
    if (recommendedDoctor && !selectedDoctor) {
      setSelectedDoctor(recommendedDoctor.id);
      setAssignmentReason(
        patient.insuranceInfo?.provider === 'NHIF' 
          ? 'NHIF patient - assigned to general practitioner'
          : 'Patient assigned to available specialist'
      );
    }
  }, [recommendedDoctor, selectedDoctor, patient.insuranceInfo?.provider]);

  const handleAssignDoctor = async () => {
    if (!selectedDoctor) return;

    setIsAssigning(true);
    try {
      const doctor = availableDoctors.find(d => d.id === selectedDoctor);
      if (doctor) {
        // Update patient with assigned doctor
        await updatePatient(patient.id, {
          assignedDoctorId: selectedDoctor,
          assignedDoctorName: doctor.name,
          assignmentDate: new Date().toISOString(),
          assignmentReason: assignmentReason
        });

        onDoctorAssigned(selectedDoctor, doctor.name);
      }
    } catch (error) {
      console.error('Error assigning doctor:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const getDoctorIcon = (role: string) => {
    switch (role) {
      case 'doctor':
        return <Stethoscope className="w-5 h-5 text-blue-600" />;
      case 'ophthalmologist':
        return <Eye className="w-5 h-5 text-green-600" />;
      case 'radiologist':
        return <Activity className="w-5 h-5 text-purple-600" />;
      case 'physical-therapist':
        return <Users className="w-5 h-5 text-orange-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getDoctorSpecialty = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'General Practitioner';
      case 'ophthalmologist':
        return 'Eye Specialist';
      case 'radiologist':
        return 'Imaging Specialist';
      case 'physical-therapist':
        return 'Physical Therapy';
      default:
        return 'Medical Specialist';
    }
  };

  const getInsuranceIcon = () => {
    switch (patient.insuranceInfo?.provider) {
      case 'NHIF':
        return <Shield className="w-6 h-6 text-blue-600" />;
      case 'AAR':
      case 'Jubilee':
        return <CreditCard className="w-6 h-6 text-green-600" />;
      default:
        return <CreditCard className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <User className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Doctor Assignment</h2>
              <p className="text-sm text-gray-600">Assign appropriate doctor based on patient needs</p>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Patient Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{patient.firstName} {patient.lastName}</span>
            </div>
            <div>
              <span className="text-gray-600">MRN:</span>
              <span className="ml-2 font-medium">{patient.mrn}</span>
            </div>
            <div>
              <span className="text-gray-600">Insurance:</span>
              <div className="flex items-center mt-1">
                {getInsuranceIcon()}
                <span className="ml-2 font-medium">{patient.insuranceInfo?.provider || 'Cash'}</span>
              </div>
            </div>
            <div>
              <span className="text-gray-600">Membership:</span>
              <span className="ml-2 font-medium">{patient.insuranceInfo?.membershipNumber || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Assignment Logic */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Assignment Logic</h4>
          <div className="text-sm text-blue-800">
            {patient.insuranceInfo?.provider === 'NHIF' ? (
              <div>
                <p className="mb-2">• <strong>NHIF Patient:</strong> Assigned to NHIF-contracted doctors</p>
                <p className="mb-2">• <strong>Priority:</strong> General Practitioners for primary care</p>
                <p>• <strong>Specialists:</strong> Available for referrals if needed</p>
              </div>
            ) : (
              <div>
                <p className="mb-2">• <strong>Private/Cash Patient:</strong> Can see any available doctor</p>
                <p className="mb-2">• <strong>Specialists:</strong> Direct access to specialists</p>
                <p>• <strong>Flexibility:</strong> Patient can choose preferred doctor</p>
              </div>
            )}
          </div>
        </div>

        {/* Available Doctors */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-4">Available Doctors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedDoctor === doctor.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedDoctor(doctor.id)}
              >
                <div className="flex items-center space-x-3">
                  {getDoctorIcon(doctor.role)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{doctor.name}</h4>
                      {recommendedDoctor?.id === doctor.id && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{getDoctorSpecialty(doctor.role)}</p>
                    <p className="text-sm text-gray-500">{doctor.department}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assignment Reason */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignment Reason
          </label>
          <textarea
            value={assignmentReason}
            onChange={(e) => setAssignmentReason(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Explain why this doctor was assigned..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignDoctor}
            disabled={!selectedDoctor || isAssigning}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAssigning ? 'Assigning...' : 'Assign Doctor'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorAssignment;
