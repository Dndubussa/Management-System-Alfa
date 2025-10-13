import React from 'react';

export function NurseInpatientCare() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inpatient Care</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-700">This screen will show ward maps, bed allocation, daily rounds with doctors, fluid balance charts, and discharge checklists.</p>
        <div className="mt-4 text-sm text-gray-500">Backend tables for ward rooms, bed bookings, and nursing care plans may be required.</div>
      </div>
    </div>
  );
}

export default NurseInpatientCare;
