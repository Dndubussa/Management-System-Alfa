import React, { useState, useEffect } from 'react';
import { Save, X, DollarSign, Calculator } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Appointment } from '../../types';

interface AppointmentFormProps {
  appointment?: Appointment;
  onSave: () => void;
  onCancel: () => void;
}

export function AppointmentForm({ appointment, onSave, onCancel }: AppointmentFormProps) {
  const { patients, addNotification, addAppointment, users, servicePrices, addBill } = useHospital();
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

  const [consultationCost, setConsultationCost] = useState<number>(0);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);

  // Calculate consultation cost based on appointment type and doctor
  const calculateConsultationCost = () => {
    if (!formData.type || !formData.doctorId) return 0;
    
    // Find consultation services based on appointment type
    const consultationServices = servicePrices.filter(service => {
      const serviceName = service.serviceName.toLowerCase();
      const appointmentType = formData.type.toLowerCase();
      
      // Map appointment types to service names
      if (appointmentType === 'consultation') {
        return serviceName.includes('consultation') || 
               serviceName.includes('general') ||
               serviceName.includes('specialist');
      } else if (appointmentType === 'follow-up') {
        return serviceName.includes('follow') || 
               serviceName.includes('review');
      } else if (appointmentType === 'emergency') {
        return serviceName.includes('emergency') || 
               serviceName.includes('urgent');
      }
      return false;
    });
    
    // Return the first matching service price, or default consultation price
    if (consultationServices.length > 0) {
      return consultationServices[0].price;
    }
    
    // Default consultation prices based on type
    const defaultPrices = {
      consultation: 50000,  // 50,000 TZS for general consultation
      'follow-up': 30000,   // 30,000 TZS for follow-up
      emergency: 100000     // 100,000 TZS for emergency
    };
    
    return defaultPrices[formData.type] || 50000;
  };

  // Update consultation cost when form data changes
  useEffect(() => {
    const cost = calculateConsultationCost();
    setConsultationCost(cost);
  }, [formData.type, formData.doctorId, servicePrices]);

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
    
    const dateTime = `${formData.date}T${formData.time}:00Z`;
    
    if (appointment) {
      // Update existing appointment (in a real app)
      console.log('Updating appointment:', {
        ...formData,
        dateTime,
        id: appointment.id
      });
    } else {
      // Add new appointment with default duration of 30 minutes and status 'scheduled'
      const newAppointment = await addAppointment({
        ...formData,
        dateTime,
        duration: 30, // Default duration
        status: 'scheduled' // Default status for new appointments
      });

      // Create automatic billing for the consultation
      if (newAppointment && consultationCost > 0) {
        const patient = patients.find(p => p.id === formData.patientId);
        if (patient) {
          // Create bill for consultation
          const consultationBill = {
            patientId: formData.patientId,
            appointmentId: newAppointment.id,
            services: [
              {
                serviceName: `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} Consultation`,
                price: consultationCost,
                quantity: 1
              }
            ],
            subtotal: consultationCost,
            discount: 0,
            total: consultationCost,
            status: 'pending' as const,
            paymentMethod: 'cash' as const,
            notes: `Automatic billing for ${formData.type} appointment`
          };

          try {
            await addBill(consultationBill);
            console.log('Automatic billing created for consultation:', consultationBill);
          } catch (error) {
            console.error('Failed to create automatic billing:', error);
          }
        }
      }
    }

    // Send notification to doctor
    const patient = patients.find(p => p.id === formData.patientId);
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
        {!appointment && consultationCost > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-medium text-blue-800">Consultation Cost</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showCostBreakdown ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
            
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} Consultation
                </span>
                <span className="text-lg font-semibold text-blue-900">
                  {consultationCost.toLocaleString()} TZS
                </span>
              </div>
              
              {showCostBreakdown && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="text-xs text-blue-600 space-y-1">
                    <p>• This cost will be automatically billed when the appointment is scheduled</p>
                    <p>• Payment can be made at the cashier's desk</p>
                    <p>• Insurance claims can be processed separately</p>
                  </div>
                </div>
              )}
            </div>
          </div>
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