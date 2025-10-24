import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

export function NurseTriageVitals() {
  const { patients, users, addNotification } = useHospital();
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [form, setForm] = useState({
    temperature: '', pulse: '', respiratoryRate: '', bloodPressure: '',
    height: '', weight: '', muac: '', oxygenSaturation: '', urgency: 'normal'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGlobalError, setShowGlobalError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear global error when user starts making changes
    if (showGlobalError) {
      setShowGlobalError(false);
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
      setShowGlobalError(true);
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
      
      // Use centralized API configuration
      const apiUrl = API_ENDPOINTS.VITAL_SIGNS;
      
      console.log('🔍 Attempting to save vital signs to:', apiUrl);
      console.log('🔍 Vital data:', vitalData);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vitalData),
      });
      
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('🔍 Raw response text:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));
      
      if (!response.ok) {
        // Check if it's an HTML response (server not running or error page)
        if (responseText.trim().startsWith('<!doctype') || responseText.trim().startsWith('<html') || responseText.trim().startsWith('<!DOCTYPE')) {
          throw new Error('Server not running or API endpoint not found. Please check that the backend server is running on port 3001.');
        }
        
        let errorDetails = responseText;
        try {
          const errorObj = JSON.parse(responseText);
          errorDetails = errorObj.error || errorObj.message || responseText;
        } catch (e) {
          // If we can't parse as JSON, use the raw text
        }
        
        throw new Error(`API Error: ${response.status} - ${errorDetails}`);
      }
      
      // Try to parse the response as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        // If we can't parse as JSON but the response was OK, it's still an error
        if (responseText.trim().startsWith('<!doctype') || responseText.trim().startsWith('<html') || responseText.trim().startsWith('<!DOCTYPE')) {
          throw new Error('Received HTML instead of JSON. Server may be misconfigured.');
        }
        throw new Error('Invalid JSON response from server');
      }
      
      console.log('✅ Vital signs saved successfully:', result);
      
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
          urgency: 'normal' 
        });
        setSelectedPatientId('');
        
        // Success - vital signs recorded
        console.log('✅ Vital signs recorded successfully');
      } else {
        throw new Error('Failed to save vital signs');
      }
    } catch (error) {
      console.error('Error saving vital signs:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Unknown error occurred';
      let errorTitle = 'Save Failed';
      let errorDetails = '';
      
      if (error instanceof SyntaxError && (error.message.includes('<!doctype') || error.message.includes('<!DOCTYPE'))) {
        errorTitle = 'Server Configuration Error';
        errorMessage = 'Received HTML instead of JSON response.';
        errorDetails = 'This usually means the API endpoint is not properly configured or the server is returning an error page.';
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorTitle = 'Network Error';
        errorMessage = 'Cannot connect to the backend server.';
        errorDetails = 'Please check if the server is running and accessible on port 3001.';
      } else if (error instanceof Error) {
        errorTitle = 'API Error';
        errorMessage = error.message;
        errorDetails = 'Please check the server logs for more details.';
      }
      
      // Show comprehensive error message
      setShowGlobalError(true);
      setErrors({
        api: `${errorTitle}: ${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Triage & Vitals</h1>
      
      {/* Global validation error message */}
      {showGlobalError && Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 relative">
          <button
            onClick={() => setShowGlobalError(false)}
            className="absolute top-2 right-2 text-red-400 hover:text-red-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                {errors.api ? 'Server Connection Error' : 'Please fix the following errors:'}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {errors.api ? (
                  <div className="bg-red-100 border border-red-300 rounded-md p-3">
                    <div className="font-medium text-red-800 mb-2">🚨 Backend Server Issue</div>
                    <div className="text-red-700 mb-2">{errors.api}</div>
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
                      <strong>Quick Fix:</strong> Run <code className="bg-red-200 px-1 rounded">node server.js</code> in your terminal to start the backend server.
                    </div>
                  </div>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>
                        <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span> {message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Select Patient *</label>
          <select 
            className={`w-full border rounded-md p-2 ${errors.patient ? 'border-red-500' : 'border-gray-300'}`} 
            value={selectedPatientId} 
            onChange={e => setSelectedPatientId(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">-- Choose Patient --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>
            ))}
          </select>
          {errors.patient && (
            <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-1">
              <p className="text-red-700 text-sm font-medium">{errors.patient}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['temperature','pulse','respiratoryRate','bloodPressure','height','weight','muac','oxygenSaturation'].map((field) => (
            <div key={field} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {field === 'muac' ? 'MUAC (Optional)' : field}
                {field !== 'muac' && <span className="text-red-500 ml-1">*</span>}
                {field === 'muac' && <span className="text-gray-500 text-xs ml-1">(for children and elders)</span>}
              </label>
              <input 
                name={field} 
                value={(form as any)[field]} 
                onChange={handleChange} 
                className={`w-full border rounded-md p-2 ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={field === 'muac' ? 'Optional - for children/elders' : ''}
                disabled={isSubmitting}
              />
              {errors[field] && (
                <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-1">
                  <p className="text-red-700 text-sm font-medium">{errors[field]}</p>
                </div>
              )}
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

