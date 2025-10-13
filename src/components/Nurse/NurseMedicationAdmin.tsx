import React, { useMemo } from 'react';
import { useHospital } from '../../context/HospitalContext';

export function NurseMedicationAdmin() {
  const { prescriptions } = useHospital();

  const activePrescriptions = useMemo(() => prescriptions.filter(p => p.status === 'pending' || p.status === 'dispensed'), [prescriptions]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Medication Administration (MAR)</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Active Prescriptions</h2>
            <p className="text-sm text-gray-500">Confirm identity, administer dose, log time/route.</p>
          </div>
        </div>
        <div className="divide-y">
          {activePrescriptions.map(p => (
            <div key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.medication} — {p.dosage} — {p.frequency}</div>
                <div className="text-sm text-gray-500">Instructions: {p.instructions}</div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Administer</button>
                <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">Missed Dose</button>
              </div>
            </div>
          ))}
          {activePrescriptions.length === 0 && (
            <div className="p-6 text-center text-gray-500">No active prescriptions</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NurseMedicationAdmin;

