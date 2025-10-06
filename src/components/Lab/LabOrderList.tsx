import React, { useState } from 'react';
import { TestTube, Search, Filter, Play, Check, FileText } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';

export function LabOrderList() {
  const { labOrders, patients, updateLabOrderStatus, addNotification } = useHospital();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [results, setResults] = useState('');

  // Filter lab orders based on user role
  const userLabOrders = user?.role === 'doctor' 
    ? labOrders.filter(l => l.doctorId === user.id)
    : labOrders;

  const filteredLabOrders = userLabOrders.filter(labOrder => {
    const patient = patients.find(p => p.id === labOrder.patientId);
    if (!patient) return false;

    const matchesSearch = searchTerm === '' || 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labOrder.testName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || labOrder.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (labOrderId: string, newStatus: 'in-progress' | 'completed' | 'cancelled', testResults?: string) => {
    updateLabOrderStatus(labOrderId, newStatus, testResults);
    
    const labOrder = labOrders.find(l => l.id === labOrderId);
    if (labOrder) {
      const patient = patients.find(p => p.id === labOrder.patientId);
      
      // Send notification to the requesting doctor
      addNotification({
        userIds: [labOrder.doctorId],
        type: 'lab-order',
        title: newStatus === 'completed' ? 'Lab Results Available' : `Lab Test ${newStatus}`,
        message: newStatus === 'completed' 
          ? `${labOrder.testName} results for ${patient?.firstName} ${patient?.lastName} are ready for review`
          : `${labOrder.testName} for ${patient?.firstName} ${patient?.lastName} is ${newStatus}`,
        isRead: false
      });
    }
    
    setSelectedOrder(null);
    setResults('');
  };

  const handleCompleteWithResults = (labOrderId: string) => {
    if (results.trim()) {
      handleStatusChange(labOrderId, 'completed', results);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Lab Orders</h2>
          <div className="flex items-center space-x-2">
            <TestTube className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">
              {filteredLabOrders.filter(l => l.status === 'ordered').length} pending
            </span>
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient name or test name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Status</option>
            <option value="ordered">Ordered</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
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
                Test Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instructions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ordered
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Results
              </th>
              {user?.role === 'lab' && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLabOrders.length === 0 ? (
              <tr>
                <td colSpan={user?.role === 'lab' ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm || statusFilter 
                    ? 'No lab orders found matching your criteria.' 
                    : 'No lab orders available.'}
                </td>
              </tr>
            ) : (
              filteredLabOrders.map((labOrder) => (
                <React.Fragment key={labOrder.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getPatientName(labOrder.patientId)}
                      </div>
                      <div className="text-sm text-gray-500">ID: {labOrder.patientId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{labOrder.testName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{labOrder.instructions || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(labOrder.status)}`}>
                        {labOrder.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(labOrder.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {labOrder.results ? (
                        <div className="text-sm text-gray-900">{labOrder.results}</div>
                      ) : (
                        <span className="text-sm text-gray-400">Pending</span>
                      )}
                    </td>
                    {user?.role === 'lab' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {labOrder.status === 'ordered' && (
                          <button
                            onClick={() => handleStatusChange(labOrder.id, 'in-progress')}
                            className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-1 justify-end"
                            title="Start Processing"
                          >
                            <Play className="w-4 h-4" />
                            <span>Start</span>
                          </button>
                        )}
                        {labOrder.status === 'in-progress' && (
                          <button
                            onClick={() => setSelectedOrder(selectedOrder === labOrder.id ? null : labOrder.id)}
                            className="text-green-600 hover:text-green-900 transition-colors flex items-center space-x-1 justify-end"
                            title="Complete with Results"
                          >
                            <FileText className="w-4 h-4" />
                            <span>Complete</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                  {selectedOrder === labOrder.id && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Test Results for {labOrder.testName}
                            </label>
                            <textarea
                              value={results}
                              onChange={(e) => setResults(e.target.value)}
                              rows={4}
                              placeholder="Enter detailed test results..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                          </div>
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => {
                                setSelectedOrder(null);
                                setResults('');
                              }}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleCompleteWithResults(labOrder.id)}
                              disabled={!results.trim()}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                              <Check className="w-4 h-4" />
                              <span>Complete Test</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}