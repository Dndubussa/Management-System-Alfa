import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { AutobillingConfig } from '../../types';

interface AutobillingConfigProps {
  config: AutobillingConfig;
  onUpdateConfig: (config: Partial<AutobillingConfig>) => void;
}

export function AutobillingConfigPanel({ config, onUpdateConfig }: AutobillingConfigProps) {
  const { servicePrices } = useHospital();

  // Calculate some statistics
  const totalServices = servicePrices.length;
  const consultationServices = servicePrices.filter(s => s.category === 'consultation').length;
  const labServices = servicePrices.filter(s => s.category === 'lab-test').length;
  const medicationServices = servicePrices.filter(s => s.category === 'medication').length;
  const procedureServices = servicePrices.filter(s => s.category === 'procedure').length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Autobilling Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuration Options */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Enable Autobilling</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => onUpdateConfig({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.autoGenerateForAppointments}
                  onChange={(e) => onUpdateConfig({ autoGenerateForAppointments: e.target.checked })}
                  className="rounded text-green-600 focus:ring-green-500"
                  disabled={!config.enabled}
                />
                <span className="ml-2 text-sm text-gray-700">Auto-generate bills for appointments</span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.autoGenerateForMedicalRecords}
                  onChange={(e) => onUpdateConfig({ autoGenerateForMedicalRecords: e.target.checked })}
                  className="rounded text-green-600 focus:ring-green-500"
                  disabled={!config.enabled}
                />
                <span className="ml-2 text-sm text-gray-700">Auto-generate bills for medical records</span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.autoGenerateForPrescriptions}
                  onChange={(e) => onUpdateConfig({ autoGenerateForPrescriptions: e.target.checked })}
                  className="rounded text-green-600 focus:ring-green-500"
                  disabled={!config.enabled}
                />
                <span className="ml-2 text-sm text-gray-700">Auto-generate bills for prescriptions</span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.autoGenerateForLabOrders}
                  onChange={(e) => onUpdateConfig({ autoGenerateForLabOrders: e.target.checked })}
                  className="rounded text-green-600 focus:ring-green-500"
                  disabled={!config.enabled}
                />
                <span className="ml-2 text-sm text-gray-700">Auto-generate bills for lab orders</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Payment Method
              </label>
              <select
                value={config.defaultPaymentMethod}
                onChange={(e) => onUpdateConfig({ defaultPaymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                disabled={!config.enabled}
              >
                <option value="cash">Cash</option>
                <option value="mobile-money">M-Pesa</option>
                <option value="insurance">Insurance</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Service Price List Statistics</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Total Services</span>
              <span className="font-medium">{totalServices}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Consultations</span>
              <span className="font-medium">{consultationServices}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Lab Tests</span>
              <span className="font-medium">{labServices}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Medications</span>
              <span className="font-medium">{medicationServices}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Procedures</span>
              <span className="font-medium">{procedureServices}</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-md font-medium text-green-800 mb-2">Autobilling Status</h4>
            <p className="text-sm text-green-700">
              {config.enabled 
                ? "Autobilling is currently enabled and will automatically generate bills based on the hospital price list."
                : "Autobilling is currently disabled. Bills will need to be generated manually."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}