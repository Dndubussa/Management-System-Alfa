import React from 'react';

export function NurseProcedures() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Procedures & Immunizations</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-700">This screen will handle dressing changes, IV cannulation, blood collection, and immunizations. Billing will be auto-updated, and EPI registers will be populated.</p>
        <div className="mt-4 text-sm text-gray-500">Backend tables for procedures and immunization records may be required.</div>
      </div>
    </div>
  );
}

export default NurseProcedures;

