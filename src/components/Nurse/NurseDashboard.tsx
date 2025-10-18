import React from 'react';
import { Users, Activity, BedDouble, ClipboardList } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardLoading } from '../Common/DashboardLoading';

export function NurseDashboard() {
  const { patients, appointments, medicalRecords, loading, error } = useHospital();
  const { user } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const todaysAppointments = appointments.filter(a => a.dateTime.startsWith(today));
  const activeInpatients = medicalRecords.filter(r => r.status === 'active');

  // Show loading state
  if (loading) {
    return (
      <DashboardLoading 
        role="nurse" 
        department="Nursing" 
        title="Nurse" 
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <ClipboardList className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
          </div>
          <p className="text-sm text-red-700 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Nurse Dashboard</h1>
        <div className="text-gray-600">{user?.name}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <div className="text-sm text-gray-500">Patients</div>
              <div className="text-2xl font-semibold">{patients.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <div className="text-sm text-gray-500">Today's Queue</div>
              <div className="text-2xl font-semibold">{todaysAppointments.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <BedDouble className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <div className="text-sm text-gray-500">Active Inpatients</div>
              <div className="text-2xl font-semibold">{activeInpatients.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <ClipboardList className="w-8 h-8 text-indigo-600" />
            <div className="ml-4">
              <div className="text-sm text-gray-500">Tasks</div>
              <div className="text-2xl font-semibold">{medicalRecords.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button onClick={() => navigate('/nurse-triage')} className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-left">
          <div className="text-green-700 font-medium">Triage & Vitals</div>
          <div className="text-sm text-green-800">Record vitals and triage category</div>
        </button>
        <button onClick={() => navigate('/nurse-notes')} className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left">
          <div className="text-blue-700 font-medium">Patient Care Notes</div>
          <div className="text-sm text-blue-800">Document interventions and response</div>
        </button>
        <button onClick={() => navigate('/nurse-mar')} className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-left">
          <div className="text-purple-700 font-medium">Medication Administration</div>
          <div className="text-sm text-purple-800">Administer and log medications</div>
        </button>
        <button onClick={() => navigate('/nurse-procedures')} className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 text-left">
          <div className="text-orange-700 font-medium">Procedures & Immunizations</div>
          <div className="text-sm text-orange-800">Perform procedures and EPI</div>
        </button>
        <button onClick={() => navigate('/nurse-inpatient')} className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg p-4 text-left">
          <div className="text-indigo-700 font-medium">Inpatient Care</div>
          <div className="text-sm text-indigo-800">Ward rounds, bed allocation</div>
        </button>
        <button onClick={() => navigate('/nurse-reports')} className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 text-left">
          <div className="text-gray-700 font-medium">Nursing Reports</div>
          <div className="text-sm text-gray-800">Shift handover, census</div>
        </button>
      </div>
    </div>
  );
}

export default NurseDashboard;

