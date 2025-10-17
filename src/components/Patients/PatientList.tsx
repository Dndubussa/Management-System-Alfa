import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, MoreVertical, Eye, Edit } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Patient } from '../../types';
import { hasRestrictedPatientVisibility, canCreatePatients, canEditPatients } from '../../utils/roleUtils';

interface PatientListProps {
  onViewPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onNewPatient: () => void;
}

export function PatientList({ onViewPatient, onEditPatient, onNewPatient }: PatientListProps) {
  const { user } = useAuth();
  const { patients, appointments, medicalRecords } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter patients based on user role
  const getFilteredPatients = () => {
    let basePatients = patients;

    // If user is a medical specialist, only show patients who have both appointments AND medical records with this specialist
    if (hasRestrictedPatientVisibility(user?.role)) {
      console.log('🔍 Doctor filtering - User:', user);
      console.log('🔍 Total patients:', patients.length);
      console.log('🔍 Total appointments:', appointments.length);
      console.log('🔍 Total medical records:', medicalRecords.length);
      
      const doctorAppointmentPatientIds = appointments
        .filter(appointment => appointment.doctorId === user.id)
        .map(appointment => appointment.patientId);
      
      const doctorMedicalRecordPatientIds = medicalRecords
        .filter(record => record.doctorId === user.id)
        .map(record => record.patientId);
      
      console.log('🔍 Doctor appointment patient IDs:', doctorAppointmentPatientIds);
      console.log('🔍 Doctor medical record patient IDs:', doctorMedicalRecordPatientIds);
      
      basePatients = patients.filter(patient => 
        doctorAppointmentPatientIds.includes(patient.id) && 
        doctorMedicalRecordPatientIds.includes(patient.id)
      );
      
      console.log('🔍 Filtered patients for doctor:', basePatients.length);
    }

    // Apply search filter
    return basePatients.filter(patient =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
    );
  };

  const filteredPatients = getFilteredPatients();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleDropdownToggle = (patientId: string) => {
    setOpenDropdown(openDropdown === patientId ? null : patientId);
  };

  const handleViewPatient = (patient: Patient) => {
    setOpenDropdown(null);
    onViewPatient(patient);
  };

  const handleEditPatient = (patient: Patient) => {
    setOpenDropdown(null);
    onEditPatient(patient);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {hasRestrictedPatientVisibility(user?.role) ? 'My Patients' : 'Patient Directory'}
          </h2>
          {/* Only authorized roles can add new patients */}
          {canCreatePatients(user?.role) && (
            <button
              onClick={onNewPatient}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Patient</span>
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={hasRestrictedPatientVisibility(user?.role) ? "Search my patients by name or phone..." : "Search patients by name or phone..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MRN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age/Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Insurance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registered
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm ? 'No patients found matching your search.' : 
                   hasRestrictedPatientVisibility(user?.role) ? 'No patients have been scheduled to see you and have medical records with you yet.' : 
                   'No patients registered yet.'}
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-xs text-gray-400">ID: {patient.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">
                      {patient.mrn}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {calculateAge(patient.dateOfBirth)} years
                    </div>
                    <div className="text-sm text-gray-500 capitalize">{patient.gender}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.insuranceInfo.provider}</div>
                    <div className="text-sm text-gray-500">{patient.insuranceInfo.membershipNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(patient.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => handleDropdownToggle(patient.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        title="Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openDropdown === patient.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleViewPatient(patient)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4 mr-3" />
                              View Details
                            </button>
                            {/* Only authorized roles can edit patients */}
                            {canEditPatients(user?.role) && (
                              <button
                                onClick={() => handleEditPatient(patient)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4 mr-3" />
                                Edit Patient
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}