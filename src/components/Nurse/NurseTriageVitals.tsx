import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function NurseTriageVitals() {
  const { patients, users, addNotification } = useHospital();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [form, setForm] = useState({
    temperature: '', pulse: '', respiratoryRate: '', bloodPressure: '',
    height: '', weight: '', muac: '', oxygenSaturation: '', urgency: 'normal'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Mandatory fields validation
    if (!selectedPatientId) {
      newErrors.patient = 'Please select a patient';
    }
    
    if (!form.temperature.trim()) {
      newErrors.temperature = 'Temperature is required';
    } else if (isNaN(parseFloat(form.temperature)) || parseFloat(form.temperature) < 30 || parseFloat(form.temperature) > 45) {
      newErrors.temperature = 'Please enter a valid temperature (30-45°C)';
    }
    
    if (!form.pulse.trim()) {
      newErrors.pulse = 'Pulse rate is required';
    } else if (isNaN(parseInt(form.pulse)) || parseInt(form.pulse) < 30 || parseInt(form.pulse) > 200) {
      newErrors.pulse = 'Please enter a valid pulse rate (30-200 bpm)';
    }
    
    if (!form.respiratoryRate.trim()) {
      newErrors.respiratoryRate = 'Respiratory rate is required';
    } else if (isNaN(parseInt(form.respiratoryRate)) || parseInt(form.respiratoryRate) < 5 || parseInt(form.respiratoryRate) > 60) {
      newErrors.respiratoryRate = 'Please enter a valid respiratory rate (5-60/min)';
    }
    
    if (!form.bloodPressure.trim()) {
      newErrors.bloodPressure = 'Blood pressure is required';
    } else if (!form.bloodPressure.includes('/')) {
      newErrors.bloodPressure = 'Please enter blood pressure in format: 120/80';
    }
    
    if (!form.height.trim()) {
      newErrors.height = 'Height is required';
    } else if (isNaN(parseFloat(form.height)) || parseFloat(form.height) < 30 || parseFloat(form.height) > 250) {
      newErrors.height = 'Please enter a valid height (30-250 cm)';
    }
    
    if (!form.weight.trim()) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(parseFloat(form.weight)) || parseFloat(form.weight) < 1 || parseFloat(form.weight) > 300) {
      newErrors.weight = 'Please enter a valid weight (1-300 kg)';
    }
    
    if (!form.oxygenSaturation.trim()) {
      newErrors.oxygenSaturation = 'Oxygen saturation is required';
    } else if (isNaN(parseInt(form.oxygenSaturation)) || parseInt(form.oxygenSaturation) < 50 || parseInt(form.oxygenSaturation) > 100) {
      newErrors.oxygenSaturation = 'Please enter a valid oxygen saturation (50-100%)';
    }
    
    // MUAC is optional, so no validation needed
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      showError('Validation Error', 'Please fill in all required fields correctly');
      return;
    }
    
    if (!selectedPatientId || !user?.id) return;
    
    setIsSubmitting(true);
    
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
        painLevel: null, // Pain score removed
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
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Vital signs saved successfully:', result);
      
      if (queueId) {
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
        
        showSuccess(
          'Vital Signs Recorded Successfully!',
          'Patient vital signs have been recorded and the patient is now ready for doctor consultation.'
        );
      } else {
        throw new Error('Failed to save vital signs');
      }
    } catch (error) {
      console.error('Error saving vital signs:', error);
      showError(
        'Failed to Save Vital Signs',
        'There was an error saving the vital signs. Please try again or contact support if the issue persists.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Triage & Vitals</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient *</label>
          <select 
            className={`w-full border rounded-md p-2 ${errors.patient ? 'border-red-500' : ''}`} 
            value={selectedPatientId} 
            onChange={e => setSelectedPatientId(e.target.value)}
          >
            <option value="">-- Choose Patient --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>
            ))}
          </select>
          {errors.patient && <p className="text-red-500 text-sm mt-1">{errors.patient}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['temperature','pulse','respiratoryRate','bloodPressure','height','weight','muac','oxygenSaturation'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field === 'muac' ? 'MUAC (Optional)' : field}
                {field !== 'muac' && <span className="text-red-500 ml-1">*</span>}
                {field === 'muac' && <span className="text-gray-500 text-xs ml-1">(for children and elders)</span>}
              </label>
              <input 
                name={field} 
                value={(form as any)[field]} 
                onChange={handleChange} 
                className={`w-full border rounded-md p-2 ${errors[field] ? 'border-red-500' : ''}`}
                placeholder={field === 'muac' ? 'Optional - for children/elders' : ''}
                disabled={isSubmitting}
              />
              {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
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

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Vitals</span>
          )}
        </button>
      </form>
    </div>
  );
}

export default NurseTriageVitals;

