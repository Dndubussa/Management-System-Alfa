import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Save, Send, Download, User, Phone, Mail, Calendar, FileText, Calculator } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ServicePrice, ServiceEstimate, EstimateService } from '../../types';

interface EstimateGeneratorProps {
  selectedServices?: ServicePrice[];
  onServicesChange?: (services: ServicePrice[]) => void;
  onEstimateCreated?: (estimate: ServiceEstimate) => void;
}

export function EstimateGenerator({ 
  selectedServices = [], 
  onServicesChange,
  onEstimateCreated 
}: EstimateGeneratorProps) {
  const { user } = useAuth();
  const [estimate, setEstimate] = useState<Partial<ServiceEstimate>>({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    services: [],
    subtotal: 0,
    discount: 0,
    discountReason: '',
    total: 0,
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    status: 'draft',
    notes: ''
  });

  const [showPatientForm, setShowPatientForm] = useState(false);

  // Convert selected services to estimate services
  useEffect(() => {
    const estimateServices: EstimateService[] = selectedServices.map(service => ({
      id: `est-${service.id}`,
      serviceId: service.id,
      serviceName: service.serviceName,
      category: service.category,
      quantity: 1,
      unitPrice: service.price,
      totalPrice: service.price,
      description: service.description
    }));

    const subtotal = estimateServices.reduce((sum, service) => sum + service.totalPrice, 0);
    const discount = estimate.discount || 0;
    const total = subtotal - discount;

    setEstimate(prev => ({
      ...prev,
      services: estimateServices,
      subtotal,
      total
    }));
  }, [selectedServices, estimate.discount]);

  const handleQuantityChange = (serviceId: string, quantity: number) => {
    if (quantity < 1) return;

    const updatedServices = estimate.services?.map(service => {
      if (service.id === serviceId) {
        const totalPrice = service.unitPrice * quantity;
        return { ...service, quantity, totalPrice };
      }
      return service;
    }) || [];

    const subtotal = updatedServices.reduce((sum, service) => sum + service.totalPrice, 0);
    const discount = estimate.discount || 0;
    const total = subtotal - discount;

    setEstimate(prev => ({
      ...prev,
      services: updatedServices,
      subtotal,
      total
    }));
  };

  const handleRemoveService = (serviceId: string) => {
    const updatedServices = estimate.services?.filter(service => service.id !== serviceId) || [];
    const subtotal = updatedServices.reduce((sum, service) => sum + service.totalPrice, 0);
    const discount = estimate.discount || 0;
    const total = subtotal - discount;

    setEstimate(prev => ({
      ...prev,
      services: updatedServices,
      subtotal,
      total
    }));

    // Also remove from parent component
    if (onServicesChange) {
      const serviceToRemove = selectedServices.find(s => s.id === serviceId.replace('est-', ''));
      if (serviceToRemove) {
        onServicesChange(selectedServices.filter(s => s.id !== serviceToRemove.id));
      }
    }
  };

  const handleDiscountChange = (discount: number, reason?: string) => {
    const total = estimate.subtotal - discount;
    setEstimate(prev => ({
      ...prev,
      discount,
      discountReason: reason,
      total
    }));
  };

  const generateEstimateNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `EST-${year}-${random}`;
  };

  const handleSaveEstimate = async () => {
    if (!estimate.services || estimate.services.length === 0) {
      alert('Please add at least one service to the estimate');
      return;
    }

    const estimateData: ServiceEstimate = {
      id: `estimate-${Date.now()}`,
      estimateNumber: generateEstimateNumber(),
      patientName: estimate.patientName,
      patientPhone: estimate.patientPhone,
      patientEmail: estimate.patientEmail,
      services: estimate.services,
      subtotal: estimate.subtotal || 0,
      discount: estimate.discount,
      discountReason: estimate.discountReason,
      total: estimate.total || 0,
      validUntil: estimate.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'draft',
      createdBy: user?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: estimate.notes
    };

    // Here you would typically save to the database
    console.log('Saving estimate:', estimateData);
    
    if (onEstimateCreated) {
      onEstimateCreated(estimateData);
    }

    alert('Estimate saved successfully!');
  };

  const handleSendEstimate = async () => {
    if (!estimate.patientName || !estimate.patientPhone) {
      alert('Please provide patient name and phone number to send the estimate');
      return;
    }

    await handleSaveEstimate();
    // Here you would typically send the estimate via email/SMS
    alert('Estimate sent successfully!');
  };

  const generatePDF = () => {
    // Here you would generate a PDF of the estimate
    alert('PDF generation feature will be implemented');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Generate Cost Estimate</h1>
            <p className="text-gray-600 mt-1">Create quotations for walk-in or new patients</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={generatePDF}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate PDF
            </button>
            <button
              onClick={handleSendEstimate}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Estimate
            </button>
            <button
              onClick={handleSaveEstimate}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
                <input
                  type="text"
                  value={estimate.patientName || ''}
                  onChange={(e) => setEstimate(prev => ({ ...prev, patientName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={estimate.patientPhone || ''}
                    onChange={(e) => setEstimate(prev => ({ ...prev, patientPhone: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+255 XXX XXX XXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={estimate.patientEmail || ''}
                    onChange={(e) => setEstimate(prev => ({ ...prev, patientEmail: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="patient@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={estimate.validUntil || ''}
                    onChange={(e) => setEstimate(prev => ({ ...prev, validUntil: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={estimate.notes || ''}
                  onChange={(e) => setEstimate(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes or special instructions..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Services and Pricing */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Calculator className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Services & Pricing</h2>
            </div>

            {estimate.services && estimate.services.length > 0 ? (
              <div className="space-y-4">
                {estimate.services.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{service.serviceName}</h3>
                        <p className="text-sm text-gray-600">{service.category}</p>
                        {service.description && (
                          <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(service.id, service.quantity - 1)}
                            className="p-1 bg-gray-100 hover:bg-gray-200 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{service.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(service.id, service.quantity + 1)}
                            className="p-1 bg-gray-100 hover:bg-gray-200 rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            TZS {service.totalPrice.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            TZS {service.unitPrice.toLocaleString()} each
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveService(service.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Discount Section */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Discount</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={estimate.discount || 0}
                        onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500">TZS</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={estimate.discountReason || ''}
                    onChange={(e) => setEstimate(prev => ({ ...prev, discountReason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Discount reason (optional)"
                  />
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-green-600">TZS {estimate.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services selected</h3>
                <p className="text-gray-500">Add services from the price lookup to create an estimate.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
