import React, { useState } from 'react';
import { Heart, Activity, Droplets, Wind, Search, Filter, Plus, TrendingUp } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Patient } from '../../types';

interface ChronicPatient {
  patient: Patient;
  condition: 'diabetes' | 'hypertension' | 'asthma' | 'heart-disease' | 'kidney-disease';
  lastVisit: string;
  nextVisit: string;
  status: 'stable' | 'warning' | 'critical';
  metrics: {
    bloodPressure?: string;
    bloodSugar?: string;
    hba1c?: string;
    peakFlow?: string;
    creatinine?: string;
  };
}

export function ChronicDiseaseDashboard() {
  const { patients } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Mock chronic disease patients data
  const chronicPatients: ChronicPatient[] = [
    {
      patient: patients[0],
      condition: 'diabetes',
      lastVisit: '2024-01-15',
      nextVisit: '2024-02-15',
      status: 'stable',
      metrics: {
        bloodSugar: '140 mg/dL',
        hba1c: '6.8%'
      }
    },
    {
      patient: patients[1],
      condition: 'hypertension',
      lastVisit: '2024-01-10',
      nextVisit: '2024-02-10',
      status: 'warning',
      metrics: {
        bloodPressure: '150/95 mmHg'
      }
    }
  ];

  const filteredPatients = chronicPatients.filter(item => {
    const matchesSearch = searchTerm === '' || 
      `${item.patient.firstName} ${item.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patient.id.includes(searchTerm);

    const matchesCondition = conditionFilter === '' || item.condition === conditionFilter;
    const matchesStatus = statusFilter === '' || item.status === statusFilter;

    return matchesSearch && matchesCondition && matchesStatus;
  });

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'diabetes': return <Droplets className="w-5 h-5" />;
      case 'hypertension': return <Heart className="w-5 h-5" />;
      case 'asthma': return <Wind className="w-5 h-5" />;
      case 'heart-disease': return <Activity className="w-5 h-5" />;
      case 'kidney-disease': return <Activity className="w-5 h-5" />; // Using Activity as fallback
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'diabetes': return 'bg-blue-100 text-blue-800';
      case 'hypertension': return 'bg-red-100 text-red-800';
      case 'asthma': return 'bg-green-100 text-green-800';
      case 'heart-disease': return 'bg-purple-100 text-purple-800';
      case 'kidney-disease': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Chronic Disease Management</h1>
        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Droplets className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Diabetes Patients</p>
              <p className="text-2xl font-semibold text-gray-900">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hypertension Patients</p>
              <p className="text-2xl font-semibold text-gray-900">32</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Wind className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Asthma Patients</p>
              <p className="text-2xl font-semibold text-gray-900">18</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Conditions</option>
              <option value="diabetes">Diabetes</option>
              <option value="hypertension">Hypertension</option>
              <option value="asthma">Asthma</option>
              <option value="heart-disease">Heart Disease</option>
              <option value="kidney-disease">Kidney Disease</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Status</option>
              <option value="stable">Stable</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metrics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No patients found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.patient.firstName} {item.patient.lastName}
                      </div>
                      <div className="text-sm text-gray-500">ID: {item.patient.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.condition)}`}>
                        <span className="flex items-center">
                          {getConditionIcon(item.condition)}
                          <span className="ml-1 capitalize">{item.condition.replace('-', ' ')}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 space-y-1">
                        {item.metrics.bloodPressure && (
                          <div>Blood Pressure: {item.metrics.bloodPressure}</div>
                        )}
                        {item.metrics.bloodSugar && (
                          <div>Blood Sugar: {item.metrics.bloodSugar}</div>
                        )}
                        {item.metrics.hba1c && (
                          <div>HbA1c: {item.metrics.hba1c}</div>
                        )}
                        {item.metrics.peakFlow && (
                          <div>Peak Flow: {item.metrics.peakFlow}</div>
                        )}
                        {item.metrics.creatinine && (
                          <div>Creatinine: {item.metrics.creatinine}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.lastVisit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.nextVisit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}