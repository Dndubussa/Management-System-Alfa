import React, { useState, useEffect } from 'react';
import { Save, X, DollarSign, Calculator } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useError } from '../../context/ErrorContext';
import { Appointment } from '../../types';
import { ConsultationCostDisplay } from '../Common/ConsultationCostDisplay';
import { useConsultationBilling } from '../../hooks/useConsultationBilling';
import { findPatientSafely } from '../../utils/patientUtils';

interface AppointmentFormProps {
  appointment?: Appointment;
  onSave: () => void;
  onCancel: () => void;
}

export function AppointmentForm({ appointment, onSave, onCancel }: AppointmentFormProps) {
  const { patients, addNotification, addAppointment, users } = useHospital();
  const { addError } = useError();
  const { createConsultationBill } = useConsultationBilling();
  const doctors = users.filter(user => user.role === 'doctor' || user.role === 'ophthalmologist');
  
  // Initialize with current date and time
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || '',
    doctorId: appointment?.doctorId || (doctors.length > 0 ? doctors[0].id : ''),
    date: appointment?.dateTime ? appointment.dateTime.split('T')[0] : currentDate,
    time: appointment?.dateTime ? appointment.dateTime.split('T')[1].substring(0, 5) : currentTime,
    type: appointment?.type || 'consultation' as const,
    notes: appointment?.notes || ''
  });

  // Update doctorId if doctors are loaded and no doctor is selected
  useEffect(() => {
    if (doctors.length > 0 && !formData.doctorId) {
      setFormData(prev => ({
        ...prev,
        doctorId: doctors[0].id
      }));
    }
  }, [doctors, formData.doctorId]);

  const [consultationCost, setConsultationCost] = useState<number>(0);
  const [consultationService, setConsultationService] = useState<string>('');

  // Handle consultation cost calculation from the reusable component
  const handleCostCalculated = (cost: number, serviceName: string) => {
    setConsultationCost(cost);
    setConsultationService(serviceName);
  };

  // For new appointments, automatically set to current date/time
  useEffect(() => {
    if (!appointment) {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      setFormData(prev => ({
        ...prev,
        date: currentDate,
        time: currentTime
      }));
    }
  }, [appointment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dateTime = `${formData.date}T${formData.time}:00Z`;
      
      // Validate required fields
      if (!formData.patientId || !formData.doctorId || !formData.date || !formData.time) {
        console.error('Missing required fields:', formData);
        addError({
          type: 'error',
          title: 'Missing Required Fields',
          message: 'Please fill in all required fields before submitting',
          details: `Missing: ${!formData.patientId ? 'Patient' : ''} ${!formData.doctorId ? 'Doctor' : ''} ${!formData.date ? 'Date' : ''} ${!formData.time ? 'Time' : ''}`.trim(),
          component: 'AppointmentForm',
          action: 'handleSubmit',
          userAction: 'Create new appointment',
          metadata: { formData }
        });
        return;
      }
      
      if (appointment) {
        // Update existing appointment (in a real app)
        console.log('Updating appointment:', {
          ...formData,
          dateTime,
          id: appointment.id
        });
      } else {
        // Add new appointment with default duration of 30 minutes and status 'scheduled'
        console.log('Creating appointment with data:', {
          ...formData,
          dateTime,
          duration: 30,
          status: 'scheduled'
        });
        
        const newAppointment = await addAppointment({
          ...formData,
          dateTime,
          duration: 30, // Default duration
          status: 'scheduled' // Default status for new appointments
        });

        // Create automatic billing for the consultation
        if (newAppointment && consultationCost > 0) {
          try {
            await createConsultationBill(
              formData.patientId,
              newAppointment.id,
              consultationService || `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} Consultation`,
              consultationCost,
              formData.type
            );
          } catch (error) {
            console.error('Failed to create automatic billing:', error);
          }
        }
      }

      // Send notification to doctor
      const patient = findPatientSafely(patients, formData.patientId);
      if (patient) {
        addNotification({
          userIds: [formData.doctorId],
          type: 'appointment',
          title: 'New Appointment Scheduled',
          message: `Appointment with ${patient.firstName} ${patient.lastName} on ${new Date(dateTime).toLocaleDateString()}`,
          isRead: false
        });
      }

      onSave();
    } catch (error) {
      console.error('Error creating appointment:', error);
      // The error handling system should catch this and display it
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {appointment ? 'Edit Appointment' : 'Schedule New Appointment'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient *
            </label>
            <select
              name="patientId"
              required
              value={formData.patientId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select Patient</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doctor *
            </label>
            <select
              name="doctorId"
              required
              value={formData.doctorId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.department}
                </option>
              ))}
            </select>
          </div>

          {/* Hidden fields for date and time - automatically set */}
          <input type="hidden" name="date" value={formData.date} />
          <input type="hidden" name="time" value={formData.time} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Type *
            </label>
            <select
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional notes about the appointment"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Consultation Cost Display */}
        {!appointment && (
          <ConsultationCostDisplay
            appointmentType={formData.type}
            doctorId={formData.doctorId}
            onCostCalculated={handleCostCalculated}
            showBreakdown={true}
          />
        )}

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>
              {appointment ? 'Update Appointment' : 'Schedule Appointment'}
              {!appointment && consultationCost > 0 && (
                <span className="ml-2 text-green-200">
                  ({consultationCost.toLocaleString()} TZS)
                </span>
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}