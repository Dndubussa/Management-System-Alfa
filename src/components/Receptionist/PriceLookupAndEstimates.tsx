import React, { useState } from 'react';
import { Search, Calculator, FileText, History, Plus } from 'lucide-react';
import { ServicePriceLookup } from './ServicePriceLookup';
import { EstimateGenerator } from './EstimateGenerator';
import { ServicePrice, ServiceEstimate } from '../../types';

export function PriceLookupAndEstimates() {
  const [activeTab, setActiveTab] = useState<'lookup' | 'generator' | 'history'>('lookup');
  const [selectedServices, setSelectedServices] = useState<ServicePrice[]>([]);
  const [estimates, setEstimates] = useState<ServiceEstimate[]>([]);

  const handleServicesChange = (services: ServicePrice[]) => {
    setSelectedServices(services);
  };

  const handleEstimateCreated = (estimate: ServiceEstimate) => {
    setEstimates(prev => [estimate, ...prev]);
    setSelectedServices([]); // Clear selected services after creating estimate
    setActiveTab('history'); // Switch to history tab
  };

  const tabs = [
    {
      id: 'lookup',
      label: 'Price Lookup',
      icon: Search,
      description: 'Search and view service prices'
    },
    {
      id: 'generator',
      label: 'Estimate Generator',
      icon: Calculator,
      description: 'Create cost estimates and quotations'
    },
    {
      id: 'history',
      label: 'Estimate History',
      icon: History,
      description: 'View previously created estimates'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service Price Lookup & Estimates</h1>
            <p className="text-gray-600 mt-1">Search prices and generate cost estimates for patients</p>
          </div>
          <div className="flex items-center space-x-4">
            {selectedServices.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                <span className="text-blue-800 font-medium">
                  {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            )}
            <button
              onClick={() => setActiveTab('generator')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Estimate
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Content */}
          {activeTab === 'lookup' && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Service Price Lookup</h2>
                <p className="text-gray-600">Search and select services to create estimates</p>
              </div>
              <ServicePriceLookup />
            </div>
          )}

          {activeTab === 'generator' && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Estimate Generator</h2>
                <p className="text-gray-600">Create detailed cost estimates and quotations</p>
              </div>
              <EstimateGenerator
                selectedServices={selectedServices}
                onServicesChange={handleServicesChange}
                onEstimateCreated={handleEstimateCreated}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Estimate History</h2>
                <p className="text-gray-600">View and manage previously created estimates</p>
              </div>
              <EstimateHistory estimates={estimates} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Estimate History Component
interface EstimateHistoryProps {
  estimates: ServiceEstimate[];
}

function EstimateHistory({ estimates }: EstimateHistoryProps) {
  const getStatusColor = (status: ServiceEstimate['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (estimates.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No estimates created yet</h3>
        <p className="text-gray-500">Create your first estimate using the Estimate Generator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {estimates.map((estimate) => (
        <div key={estimate.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{estimate.estimateNumber}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(estimate.status)}`}>
                  {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Patient:</span> {estimate.patientName || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {estimate.patientPhone || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Services:</span> {estimate.services.length} item{estimate.services.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 mb-1">
                TZS {estimate.total.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                Created: {formatDate(estimate.createdAt)}
              </div>
              <div className="text-sm text-gray-500">
                Valid until: {new Date(estimate.validUntil).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {estimate.notes && (
                  <p><span className="font-medium">Notes:</span> {estimate.notes}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm transition-colors">
                  View Details
                </button>
                <button className="px-3 py-1 text-green-600 hover:bg-green-50 rounded text-sm transition-colors">
                  Download PDF
                </button>
                <button className="px-3 py-1 text-purple-600 hover:bg-purple-50 rounded text-sm transition-colors">
                  Send Again
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
