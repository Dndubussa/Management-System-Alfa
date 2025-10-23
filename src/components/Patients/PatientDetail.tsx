import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Patient, MedicalRecord, Appointment } from '../../types';
import { ArrowLeft, Calendar, Phone, Mail, MapPin, User, Heart, Stethoscope, FileText, Clock, Download, Shield } from 'lucide-react';
import { exportEMRToCSV, exportEMRToJSON, exportEMRToText, exportEMRToHTML, downloadFile } from '../../utils/emrExport';
import { canViewMedicalRecords } from '../../utils/roleUtils';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onEdit: () => void;
}

export function PatientDetail({ patient, onBack, onEdit }: PatientDetailProps) {
  const { medicalRecords, appointments } = useHospital();
  const { user } = useAuth();

  // Filter medical records and appointments for this patient
  const patientRecords = medicalRecords.filter(record => record.patientId === patient.id);
  const patientAppointments = appointments.filter(appointment => appointment.patientId === patient.id);


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

  const getPaymentMethodDisplay = (patient: Patient) => {
    const provider = patient.insuranceInfo.provider;
    
    if (provider === 'Direct') {
      return {
        method: 'Cash',
        details: 'Direct payment',
        icon: '💵'
      };
    } else if (provider === 'Lipa Kwa Simu') {
      return {
        method: 'Lipa Kwa Simu',
        details: 'Mobile money payment',
        icon: '📱'
      };
    } else if (provider && provider !== 'Direct' && provider !== 'Lipa Kwa Simu') {
      return {
        method: 'Insurance',
        details: provider,
        icon: '🛡️'
      };
    } else {
      return {
        method: 'Cash',
        details: 'Direct payment',
        icon: '💵'
      };
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    const csvContent = exportEMRToCSV(patient, patientRecords);
    downloadFile(csvContent, `emr-${patient.firstName}-${patient.lastName}.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const jsonContent = exportEMRToJSON(patient, patientRecords);
    downloadFile(jsonContent, `emr-${patient.firstName}-${patient.lastName}.json`, 'application/json');
  };

  const handleExportText = () => {
    const textContent = exportEMRToText(patient, patientRecords);
    downloadFile(textContent, `emr-${patient.firstName}-${patient.lastName}.txt`, 'text/plain');
  };

  const handleExportHTML = () => {
    const htmlContent = exportEMRToHTML(patient, patientRecords);
    downloadFile(htmlContent, `emr-${patient.firstName}-${patient.lastName}.html`, 'text/html');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Patient List
        </button>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Edit Patient
          </button>
          <div className="relative group">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export EMR
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

      {/* Patient Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-gray-600">MRN: {patient.mrn}</p>
              <p className="text-gray-500 text-sm">Patient ID: {patient.id}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Heart className="w-4 h-4 mr-1" />
                <span className="capitalize">{patient.gender}</span>
                <span className="mx-2">•</span>
                <span>{calculateAge(patient.dateOfBirth)} years old</span>
                <span className="mx-2">•</span>
                <span>DOB: {formatDate(patient.dateOfBirth)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="flex items-start">
            <Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{patient.phone}</p>
            </div>
          </div>
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{patient.address}</p>
            </div>
          </div>
          <div className="flex items-start">
            <User className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Emergency Contact</p>
              <p className="font-medium">{patient.emergencyContact.name}</p>
              <p className="text-sm">{patient.emergencyContact.phone} ({patient.emergencyContact.relationship})</p>
            </div>
          </div>
          <div className="flex items-start">
            <Stethoscope className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Assigned Doctor</p>
              {patient.assignedDoctorName ? (
                <>
                  <p className="font-medium">Dr. {patient.assignedDoctorName}</p>
                  {patient.assignmentDate && (
                    <p className="text-sm text-gray-500">Assigned: {formatDate(patient.assignmentDate)}</p>
                  )}
                  {patient.assignmentReason && (
                    <p className="text-sm text-gray-400">{patient.assignmentReason}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 italic">Not assigned</p>
              )}
            </div>
          </div>
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              {(() => {
                const paymentInfo = getPaymentMethodDisplay(patient);
                return (
                  <>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium flex items-center">
                      <span className="mr-2">{paymentInfo.icon}</span>
                      {paymentInfo.method}
                    </p>
                    <p className="text-sm text-gray-600">{paymentInfo.details}</p>
                    {paymentInfo.method === 'Insurance' && patient.insuranceInfo.membershipNumber && (
                      <p className="text-sm font-mono text-gray-500">#{patient.insuranceInfo.membershipNumber}</p>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Registered</p>
            <p className="font-medium">{formatDate(patient.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Medical Records - Only visible to doctors and medical specialists */}
      {canViewMedicalRecords(user?.role) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Medical Records ({patientRecords.length})
            </h2>
          </div>
          {patientRecords.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No medical records found for this patient.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {patientRecords.map(record => (
                <div key={record.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900">Visit on {formatDate(record.visitDate)}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {record.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Chief Complaint:</span> {record.chiefComplaint}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    <span className="font-medium">Treatment:</span> {record.treatment}
                  </p>
                  {record.notes && (
                    <p className="mt-1 text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {record.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Appointments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Appointments ({patientAppointments.length})
          </h2>
        </div>
        {patientAppointments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No appointments found for this patient.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {patientAppointments.map(appointment => (
              <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900">
                    {formatDateTime(appointment.dateTime)}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {appointment.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{appointment.duration} minutes</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{appointment.type.replace('-', ' ')}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(appointment.dateTime)}
                </div>
                {appointment.notes && (
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {appointment.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}