import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';

export function NurseTriageVitals() {
  const { patients, addNotification } = useHospital();
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [form, setForm] = useState({
    temperature: '', pulse: '', respiratoryRate: '', bloodPressure: '',
    height: '', weight: '', muac: '', oxygenSaturation: '', painScore: '', urgency: 'normal'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    addNotification({
      userIds: [user?.id || ''],
      type: 'general',
      title: 'Vitals Recorded',
      message: `Vitals recorded for patient ${selectedPatientId} with urgency ${form.urgency}.`,
      isRead: false,
      createdAt: new Date().toISOString()
    } as any);
    setForm({ temperature: '', pulse: '', respiratoryRate: '', bloodPressure: '', height: '', weight: '', muac: '', oxygenSaturation: '', painScore: '', urgency: 'normal' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Triage & Vitals</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['temperature','pulse','respiratoryRate','bloodPressure','height','weight','muac','oxygenSaturation','painScore'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
              <input name={field} value={(form as any)[field]} onChange={handleChange} className="w-full border rounded-md p-2" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
            <select name="urgency" value={form.urgency} onChange={handleChange} className="w-full border rounded-md p-2">
              <option value="critical">Critical</option>
              <option value="urgent">Urgent</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>

        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Save Vitals</button>
      </form>
    </div>
  );
}

export default NurseTriageVitals;

