import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';

export function NurseTriageVitals() {
  const { patients, users, addNotification } = useHospital();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !user?.id) return;
    
    try {
      // Parse blood pressure if provided
      let systolic = null, diastolic = null;
      if (form.bloodPressure) {
        const bpParts = form.bloodPressure.split('/');
        if (bpParts.length === 2) {
          systolic = parseInt(bpParts[0]);
          diastolic = parseInt(bpParts[1]);
        }
      }
      
      // Calculate BMI if height and weight are provided
      let bmi = null;
      if (form.height && form.weight) {
        const heightM = parseFloat(form.height) / 100; // convert cm to m
        const weightKg = parseFloat(form.weight);
        if (heightM > 0 && weightKg > 0) {
          bmi = weightKg / (heightM * heightM);
        }
      }
      
      // First, get the patient queue item to get the queue ID
      const queueResponse = await fetch('/api/patient-queue', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      let queueId = null;
      if (queueResponse.ok) {
        const queueData = await queueResponse.json();
        const patientQueue = queueData.find((q: any) => q.patient_id === selectedPatientId);
        queueId = patientQueue?.id;
      }

      // Save vital signs to database with queue ID
      const vitalData = {
        patientId: selectedPatientId,
        queueId: queueId, // Link vital signs to the queue item
        recordedBy: user.id,
        temperature: form.temperature ? parseFloat(form.temperature) : null,
        pulse: form.pulse ? parseInt(form.pulse) : null,
        respiratoryRate: form.respiratoryRate ? parseInt(form.respiratoryRate) : null,
        bloodPressureSystolic: systolic,
        bloodPressureDiastolic: diastolic,
        height: form.height ? parseFloat(form.height) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        bmi: bmi,
        oxygenSaturation: form.oxygenSaturation ? parseInt(form.oxygenSaturation) : null,
        painLevel: form.painScore ? parseInt(form.painScore) : null,
        urgency: form.urgency,
        notes: `Triage vitals recorded by ${user.name || 'Nurse'}`
      };
      
      const response = await fetch('/api/vital-signs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vitalData),
      });
      
      if (response.ok && queueId) {
        // Update queue status to triage completed
        // We already have the queueId from above
            // Get the patient to check if doctor is already assigned
            const patient = patients.find(p => p.id === selectedPatientId);
            
            // Update queue status to move patient to doctor stage
            await fetch(`/api/patient-queue/${queueId}/status`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                status: 'waiting',
                workflowStage: 'doctor'
              }),
            });
            
            // If patient already has an assigned doctor, no need to assign again
            if (patient?.assignedDoctorId && patient?.assignedDoctorName) {
              console.log(`Patient ${patient.firstName} ${patient.lastName} already assigned to Dr. ${patient.assignedDoctorName}`);
            } else {
              console.warn(`Patient ${patient?.firstName} ${patient?.lastName} does not have an assigned doctor. This should have been set during registration.`);
            }
        
        // Notify assigned doctor (patient variable already declared above)
        if (patient?.assignedDoctorId) {
          addNotification({
            userIds: [patient.assignedDoctorId],
            type: 'triage',
            title: 'Triage Complete - Patient Ready',
            message: `Patient ${patient.firstName} ${patient.lastName} has completed triage with ${form.urgency} priority and is ready for consultation.`,
            isRead: false,
            patientId: selectedPatientId,
            createdAt: new Date().toISOString()
          } as any);
        }
        
        // Reset form
        setForm({ 
          temperature: '', 
          pulse: '', 
          respiratoryRate: '', 
          bloodPressure: '', 
          height: '', 
          weight: '', 
          muac: '', 
          oxygenSaturation: '', 
          painScore: '', 
          urgency: 'normal' 
        });
        setSelectedPatientId('');
        
        alert('Vital signs recorded successfully! Patient is now ready for doctor consultation.');
      } else {
        throw new Error('Failed to save vital signs');
      }
    } catch (error) {
      console.error('Error saving vital signs:', error);
      alert('Failed to save vital signs. Please try again.');
    }
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

