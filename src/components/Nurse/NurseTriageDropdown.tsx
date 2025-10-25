import React, { useState, useEffect } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Patient } from '../../types';

export function NurseTriageDropdown() {
  const { patients, addNotification } = useHospital();
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [form, setForm] = useState({
    temperature: '',
    pulse: '',
    respiratoryRate: '',
    bloodPressure: '',
    height: '',
    weight: '',
    oxygenSaturation: '',
    muac: '',
    urgency: 'normal'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGlobalError, setShowGlobalError] = useState(false);

  // Get patients who haven't been triaged yet (no vital signs recorded today)
  const [availablePatients, setAvailablePatients] = useState<Patient[]>([]);
  const [processedPatients, setProcessedPatients] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Filter patients who are ready for triage (processed by receptionist) and haven't been triaged yet
    const readyForTriagePatients = patients.filter(patient => {
      // Only show patients who are ready for triage and haven't been processed yet
      return patient.workflowStatus === 'ready_for_triage' && !processedPatients.has(patient.id);
    });
    setAvailablePatients(readyForTriagePatients);
  }, [patients, processedPatients]);

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

    // Required fields
    if (!selectedPatientId) {
      newErrors.patientId = 'Please select a patient';
    }
    if (!form.temperature) {
      newErrors.temperature = 'Temperature is required';
    }
    if (!form.pulse) {
      newErrors.pulse = 'Pulse is required';
    }
    if (!form.respiratoryRate) {
      newErrors.respiratoryRate = 'Respiratory rate is required';
    }
    if (!form.bloodPressure) {
      newErrors.bloodPressure = 'Blood pressure is required';
    }
    if (!form.height) {
      newErrors.height = 'Height is required';
    }
    if (!form.weight) {
      newErrors.weight = 'Weight is required';
    }
    if (!form.oxygenSaturation) {
      newErrors.oxygenSaturation = 'Oxygen saturation is required';
    }

    // Range validations
    if (form.temperature && (parseFloat(form.temperature) < 30 || parseFloat(form.temperature) > 45)) {
      newErrors.temperature = 'Temperature must be between 30-45°C';
    }
    if (form.pulse && (parseInt(form.pulse) < 30 || parseInt(form.pulse) > 200)) {
      newErrors.pulse = 'Pulse must be between 30-200 bpm';
    }
    if (form.respiratoryRate && (parseInt(form.respiratoryRate) < 5 || parseInt(form.respiratoryRate) > 60)) {
      newErrors.respiratoryRate = 'Respiratory rate must be between 5-60/min';
    }
    if (form.height && (parseFloat(form.height) < 30 || parseFloat(form.height) > 250)) {
      newErrors.height = 'Height must be between 30-250 cm';
    }
    if (form.weight && (parseFloat(form.weight) < 1 || parseFloat(form.weight) > 300)) {
      newErrors.weight = 'Weight must be between 1-300 kg';
    }
    if (form.oxygenSaturation && (parseInt(form.oxygenSaturation) < 50 || parseInt(form.oxygenSaturation) > 100)) {
      newErrors.oxygenSaturation = 'Oxygen saturation must be between 50-100%';
    }

    // Blood pressure format validation
    if (form.bloodPressure && !/^\d{2,3}\/\d{2,3}$/.test(form.bloodPressure)) {
      newErrors.bloodPressure = 'Blood pressure must be in format: 120/80';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setShowGlobalError(true);
      return;
    }

    setIsSubmitting(true);
    setShowGlobalError(false);

    try {
      const selectedPatient = patients.find(p => p.id === selectedPatientId);
      if (!selectedPatient) {
        throw new Error('Selected patient not found');
      }

      // Parse blood pressure
      const [systolic, diastolic] = form.bloodPressure.split('/').map(Number);
      
      // Calculate BMI
      const heightM = parseFloat(form.height) / 100;
      const weightKg = parseFloat(form.weight);
      let bmi = null;
      if (heightM > 0 && weightKg > 0) {
        bmi = weightKg / (heightM * heightM);
      }

      // Prepare vital signs data
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
        muac: form.muac || null,
        urgency: form.urgency,
        notes: `Triage vitals recorded by ${user.name || 'Nurse'}`
      };
      
      console.log('🔍 Attempting to save vital signs:', vitalData);
      
      // Use direct Supabase service for optimal performance
      console.log('🔄 Using direct Supabase service...');
      const { supabaseService } = await import('../../services/supabaseService');
      const result = await supabaseService.createVitalSigns(vitalData);
      
      if (!result) {
        throw new Error('Failed to save vital signs - no data returned');
      }
      
      console.log('✅ Vital signs saved successfully via Supabase service:', result);
      
      // Update patient workflow status to 'with_doctor' so doctor can see them in EMR
      try {
        const { supabaseService } = await import('../../services/supabaseService');
        await supabaseService.updatePatient(selectedPatientId, {
          workflowStatus: 'with_doctor',
          triageCompletedAt: new Date().toISOString()
        });
        console.log('✅ Patient workflow status updated to with_doctor');
      } catch (statusError) {
        console.warn('Could not update patient workflow status:', statusError);
      }

      // Add patient to doctor's queue for consultation
      try {
        const { supabaseService } = await import('../../services/supabaseService');
        const selectedPatient = patients.find(p => p.id === selectedPatientId);
        if (selectedPatient && selectedPatient.assignedDoctorId) {
          await supabaseService.addToQueue({
            patientId: selectedPatientId,
            assignedDoctorId: selectedPatient.assignedDoctorId,
            status: 'waiting',
            workflowStage: 'doctor',
            priority: form.urgency || 'normal',
            notes: `Triage completed - ${form.notes || 'No additional notes'}`,
            triageData: {
              temperature: form.temperature,
              pulse: form.pulse,
              respiratoryRate: form.respiratoryRate,
              bloodPressure: form.bloodPressure,
              height: form.height,
              weight: form.weight,
              oxygenSaturation: form.oxygenSaturation,
              muac: form.muac,
              urgency: form.urgency,
              notes: form.notes
            }
          });
          console.log('✅ Patient added to doctor queue for consultation');
        } else {
          console.warn('⚠️ No assigned doctor found for patient, cannot add to queue');
        }
      } catch (queueError) {
        console.warn('Could not add patient to doctor queue:', queueError);
      }
      
      // Mark patient as processed so they don't appear in dropdown anymore
      setProcessedPatients(prev => new Set([...prev, selectedPatientId]));
      
      // Clear form
      setForm({
        temperature: '',
        pulse: '',
        respiratoryRate: '',
        bloodPressure: '',
        height: '',
        weight: '',
        oxygenSaturation: '',
        muac: '',
        urgency: 'normal'
      });
      setSelectedPatientId('');
      
      // Show success notification (optional - don't fail if notification fails)
      try {
        addNotification({
          userIds: [user.id],
          type: 'success',
          title: 'Triage Completed',
          message: `Vital signs recorded successfully for ${selectedPatient.firstName} ${selectedPatient.lastName}`,
          isRead: false,
          patientId: selectedPatientId
        });
      } catch (notificationError) {
        console.warn('Notification failed (non-critical):', notificationError);
        // Don't fail the save if notification fails
      }

    } catch (error: any) {
      console.error('Error saving vital signs:', error);
      setShowGlobalError(true);
      setErrors({ submit: 'Failed to save vital signs. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient Triage</h1>
        <p className="text-gray-600">Select a patient and record their vital signs</p>
      </div>

      {showGlobalError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                onClick={() => setShowGlobalError(false)}
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <div>
          <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-2">
            Select Patient *
          </label>
          <select
            id="patientId"
            name="patientId"
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.patientId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Choose a patient...</option>
            {availablePatients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName} - MRN: {patient.mrn}
              </option>
            ))}
          </select>
          {errors.patientId && (
            <p className="mt-1 text-sm text-red-600">{errors.patientId}</p>
          )}
        </div>

        {/* Vital Signs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperature */}
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
              Temperature (°C) *
            </label>
            <input
              type="number"
              id="temperature"
              name="temperature"
              value={form.temperature}
              onChange={handleChange}
              step="0.1"
              min="30"
              max="45"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.temperature ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="36.5"
            />
            {errors.temperature && (
              <p className="mt-1 text-sm text-red-600">{errors.temperature}</p>
            )}
          </div>

          {/* Pulse */}
          <div>
            <label htmlFor="pulse" className="block text-sm font-medium text-gray-700 mb-2">
              Pulse (bpm) *
            </label>
            <input
              type="number"
              id="pulse"
              name="pulse"
              value={form.pulse}
              onChange={handleChange}
              min="30"
              max="200"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.pulse ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="80"
            />
            {errors.pulse && (
              <p className="mt-1 text-sm text-red-600">{errors.pulse}</p>
            )}
          </div>

          {/* Respiratory Rate */}
          <div>
            <label htmlFor="respiratoryRate" className="block text-sm font-medium text-gray-700 mb-2">
              Respiratory Rate (/min) *
            </label>
            <input
              type="number"
              id="respiratoryRate"
              name="respiratoryRate"
              value={form.respiratoryRate}
              onChange={handleChange}
              min="5"
              max="60"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.respiratoryRate ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="16"
            />
            {errors.respiratoryRate && (
              <p className="mt-1 text-sm text-red-600">{errors.respiratoryRate}</p>
            )}
          </div>

          {/* Blood Pressure */}
          <div>
            <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700 mb-2">
              Blood Pressure (mmHg) *
            </label>
            <input
              type="text"
              id="bloodPressure"
              name="bloodPressure"
              value={form.bloodPressure}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bloodPressure ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="120/80"
            />
            {errors.bloodPressure && (
              <p className="mt-1 text-sm text-red-600">{errors.bloodPressure}</p>
            )}
          </div>

          {/* Height */}
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
              Height (cm) *
            </label>
            <input
              type="number"
              id="height"
              name="height"
              value={form.height}
              onChange={handleChange}
              min="30"
              max="250"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.height ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="170"
            />
            {errors.height && (
              <p className="mt-1 text-sm text-red-600">{errors.height}</p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg) *
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              step="0.1"
              min="1"
              max="300"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.weight ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="70"
            />
            {errors.weight && (
              <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
            )}
          </div>

          {/* Oxygen Saturation */}
          <div>
            <label htmlFor="oxygenSaturation" className="block text-sm font-medium text-gray-700 mb-2">
              Oxygen Saturation (%) *
            </label>
            <input
              type="number"
              id="oxygenSaturation"
              name="oxygenSaturation"
              value={form.oxygenSaturation}
              onChange={handleChange}
              min="50"
              max="100"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.oxygenSaturation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="98"
            />
            {errors.oxygenSaturation && (
              <p className="mt-1 text-sm text-red-600">{errors.oxygenSaturation}</p>
            )}
          </div>

          {/* MUAC (Optional) */}
          <div>
            <label htmlFor="muac" className="block text-sm font-medium text-gray-700 mb-2">
              MUAC (Optional)
            </label>
            <input
              type="number"
              id="muac"
              name="muac"
              value={form.muac}
              onChange={handleChange}
              step="0.1"
              min="5"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="25.0"
            />
            <p className="mt-1 text-sm text-gray-500">Mid-Upper Arm Circumference (cm)</p>
          </div>

          {/* Urgency */}
          <div>
            <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level
            </label>
            <select
              id="urgency"
              name="urgency"
              value={form.urgency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-md font-medium text-white ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            ) : (
              'Save Vital Signs'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
