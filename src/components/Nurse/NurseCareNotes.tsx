import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';

export function NurseCareNotes() {
  const { patients, addNotification } = useHospital();
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [intervention, setIntervention] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !intervention) return;
    addNotification({
      userIds: [user?.id || ''],
      type: 'general',
      title: 'Nursing Note Added',
      message: `Intervention logged for patient ${selectedPatientId}`,
      isRead: false,
      createdAt: new Date().toISOString()
    } as any);
    setIntervention('');
    setResponse('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Patient Care Notes</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
          <select className="w-full border rounded-md p-2" value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)}>
            <option value="">-- Choose Patient --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Intervention</label>
          <input className="w-full border rounded-md p-2" value={intervention} onChange={e => setIntervention(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient Response (optional)</label>
          <input className="w-full border rounded-md p-2" value={response} onChange={e => setResponse(e.target.value)} />
        </div>

        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Save Note</button>
      </form>
    </div>
  );
}

export default NurseCareNotes;

