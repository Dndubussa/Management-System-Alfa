import React, { useState } from 'react';
import { Save, X, TestTube, Plus, Trash2 } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { ConsultationCostDisplay } from '../Common/ConsultationCostDisplay';
import { useConsultationBilling } from '../../hooks/useConsultationBilling';

interface LabOrderFormProps {
  patientId?: string;
  onSave: () => void;
  onCancel: () => void;
}

interface LabOrderItem {
  testName: string;
  instructions: string;
}

export function LabOrderForm({ patientId, onSave, onCancel }: LabOrderFormProps) {
  const { patients, addLabOrder, addNotification } = useHospital();
  const { createConsultationBill } = useConsultationBilling();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    consultationType: 'consultation' as 'consultation' | 'follow-up' | 'emergency'
  });
  
  const [labOrders, setLabOrders] = useState<LabOrderItem[]>([
    { testName: '', instructions: '' }
  ]);
  
  const [consultationCost, setConsultationCost] = useState<number>(0);
  const [consultationService, setConsultationService] = useState<string>('');

  const handleCostCalculated = (cost: number, serviceName: string) => {
    setConsultationCost(cost);
    setConsultationService(serviceName);
  };

  const handleAddLabOrder = () => {
    setLabOrders([...labOrders, { testName: '', instructions: '' }]);
  };

  const handleRemoveLabOrder = (index: number) => {
    if (labOrders.length > 1) {
      setLabOrders(labOrders.filter((_, i) => i !== index));
    }
  };

  const handleLabOrderChange = (index: number, field: keyof LabOrderItem, value: string) => {
    const updatedOrders = labOrders.map((order, i) => 
      i === index ? { ...order, [field]: value } : order
    );
    setLabOrders(updatedOrders);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId) {
      alert('Please select a patient');
      return;
    }

    const validLabOrders = labOrders.filter(order => order.testName.trim());
    if (validLabOrders.length === 0) {
      alert('Please add at least one lab test');
      return;
    }

    try {
      // Create lab orders
      const createdLabOrders = [];
      for (const order of validLabOrders) {
        const newLabOrder = await addLabOrder({
          patientId: formData.patientId,
          doctorId: user?.id || '',
          testName: order.testName,
          instructions: order.instructions,
          status: 'ordered' as const
        });
        createdLabOrders.push(newLabOrder);
      }

      // Create automatic billing for consultation if cost > 0
      if (consultationCost > 0) {
        try {
          await createConsultationBill(
            formData.patientId,
            undefined, // No appointment ID for lab orders
            consultationService || `${formData.consultationType.charAt(0).toUpperCase() + formData.consultationType.slice(1)} Consultation`,
            consultationCost,
            formData.consultationType,
            `Lab consultation for ${validLabOrders.length} test(s)`
          );
        } catch (error) {
          console.error('Failed to create automatic billing:', error);
        }
      }

      // Send notification to lab staff
      const patient = patients.find(p => p.id === formData.patientId);
      if (patient) {
        addNotification({
          userIds: ['3'], // Lab user ID
          type: 'lab-order',
          title: 'New Lab Orders',
          message: `${validLabOrders.length} lab test(s) ordered for ${patient.firstName} ${patient.lastName}`,
          isRead: false
        });
      }

      onSave();
    } catch (error) {
      console.error('Error creating lab orders:', error);
      alert('Failed to create lab orders. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <TestTube className="w-5 h-5 text-green-600 mr-2" />
          Create Lab Orders
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
                  {patient.firstName} {patient.lastName} (MRN: {patient.mrn})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consultation Type *
            </label>
            <select
              name="consultationType"
              required
              value={formData.consultationType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        {/* Consultation Cost Display */}
        <ConsultationCostDisplay
          appointmentType={formData.consultationType}
          doctorId={user?.id}
          department="lab"
          onCostCalculated={handleCostCalculated}
          showBreakdown={true}
        />

        {/* Lab Orders Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Lab Tests</h3>
            <button
              type="button"
              onClick={handleAddLabOrder}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Test</span>
            </button>
          </div>

          {labOrders.map((order, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Test #{index + 1}</h4>
                {labOrders.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLabOrder(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={order.testName}
                    onChange={(e) => handleLabOrderChange(index, 'testName', e.target.value)}
                    placeholder="e.g., Complete Blood Count, Urinalysis"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <input
                    type="text"
                    value={order.instructions}
                    onChange={(e) => handleLabOrderChange(index, 'instructions', e.target.value)}
                    placeholder="e.g., Fasting required, Morning sample"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

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
              Create Lab Orders
              {consultationCost > 0 && ` (${consultationCost.toLocaleString()} TZS)`}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
