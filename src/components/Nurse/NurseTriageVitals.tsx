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
      
      // Save vital signs to database
      const vitalData = {
        patientId: selectedPatientId,
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
      
      if (response.ok) {
        // Update queue status to triage completed
        const queueResponse = await fetch('/api/patient-queue', {
          method: 'GET',
        });
        
        if (queueResponse.ok) {
          const queueData = await queueResponse.json();
          const patientQueue = queueData.find((q: any) => q.patient_id === selectedPatientId);
          
          if (patientQueue) {
            // First, get the patient to determine insurance type
            const patient = patients.find(p => p.id === selectedPatientId);
            
            // Assign appropriate doctor based on insurance type
            let assignedDoctorId = null;
            let assignedDoctorName = null;
            let assignmentReason = '';
            
            if (patient?.insuranceInfo?.provider === 'NHIF') {
              // For NHIF patients, assign to a general practitioner
              const nhifDoctors = users.filter(u => u.role === 'doctor');
              if (nhifDoctors.length > 0) {
                assignedDoctorId = nhifDoctors[0].id;
                assignedDoctorName = nhifDoctors[0].name;
                assignmentReason = 'NHIF patient - assigned to general practitioner';
              }
            } else {
              // For non-NHIF patients, can assign to any available doctor
              const availableDoctors = users.filter(u => 
                u.role === 'doctor' || u.role === 'ophthalmologist' || 
                u.role === 'radiologist' || u.role === 'physical-therapist'
              );
              if (availableDoctors.length > 0) {
                assignedDoctorId = availableDoctors[0].id;
                assignedDoctorName = availableDoctors[0].name;
                assignmentReason = 'Patient assigned to available specialist';
              }
            }
            
            // Update queue status
            await fetch(`/api/patient-queue/${patientQueue.id}/status`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                status: 'waiting',
                workflowStage: 'doctor'
              }),
            });
            
            // Assign doctor if one was selected
            if (assignedDoctorId) {
              await fetch(`/api/patient-queue/${patientQueue.id}/assign-doctor`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  assignedDoctorId,
                  assignedDoctorName,
                  assignmentReason
                }),
              });
            }
          }
        }
        
        // Notify doctors
        addNotification({
          userIds: [], // Will be populated with doctor IDs
          type: 'triage',
          title: 'Patient Ready for Doctor',
          message: `Patient ${selectedPatientId} completed triage with ${form.urgency} priority. Vital signs recorded.`,
          isRead: false,
          createdAt: new Date().toISOString()
        } as any);
        
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

