import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';

export function DataDebugger() {
  const { 
    patients, 
    servicePrices, 
    loading, 
    error,
    medicalRecords,
    appointments,
    bills,
    users
  } = useHospital();
  const { user } = useAuth();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Data Debug Info</h3>
      <div className="space-y-1">
        <div>👤 User: {user?.name} ({user?.role})</div>
        <div>⏳ Loading: {loading ? 'Yes' : 'No'}</div>
        <div>❌ Error: {error || 'None'}</div>
        <div>👥 Patients: {patients.length}</div>
        <div>💰 Service Prices: {servicePrices.length}</div>
        <div>📋 Medical Records: {medicalRecords.length}</div>
        <div>📅 Appointments: {appointments.length}</div>
        <div>🧾 Bills: {bills.length}</div>
        <div>👨‍⚕️ Users: {users.length}</div>
        <div>🌐 Environment: {import.meta.env.PROD ? 'Production' : 'Development'}</div>
        <div>🔧 Using Supabase: {import.meta.env.PROD || import.meta.env.VITE_USE_SUPABASE === 'true' ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
}
