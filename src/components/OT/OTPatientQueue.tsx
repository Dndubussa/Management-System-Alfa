import { useState } from 'react';
import { Users, Clock, CheckCircle, XCircle, Play, Pause } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';

export function OTPatientQueue() {
  const { surgeryRequests, patients, users, updateSurgeryRequest } = useHospital();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter surgery requests for queue
  const queuedSurgeries = surgeryRequests.filter(request => {
    const isValidStatus = ['scheduled', 'pre-op', 'in-progress', 'post-op'].includes(request.status);
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return isValidStatus && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'pre-op': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'post-op': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateStatus = (requestId: string, newStatus: string) => {
    updateSurgeryRequest(requestId, { 
      status: newStatus as any,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">OT Patient Queue</h1>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              {queuedSurgeries.length} patients in queue
            </span>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 text-sm rounded-full ${
              statusFilter === 'all' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('scheduled')}
            className={`px-3 py-1 text-sm rounded-full ${
              statusFilter === 'scheduled' 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Scheduled
          </button>
          <button
            onClick={() => setStatusFilter('pre-op')}
            className={`px-3 py-1 text-sm rounded-full ${
              statusFilter === 'pre-op' 
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Pre-Op
          </button>
          <button
            onClick={() => setStatusFilter('in-progress')}
            className={`px-3 py-1 text-sm rounded-full ${
              statusFilter === 'in-progress' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setStatusFilter('post-op')}
            className={`px-3 py-1 text-sm rounded-full ${
              statusFilter === 'post-op' 
                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Post-Op
          </button>
        </div>
      </div>

      {/* Patient Queue List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Surgery Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Surgeon
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {queuedSurgeries.length > 0 ? (
                queuedSurgeries.map(request => {
                  const patient = patients.find(p => p.id === request.patientId);
                  const surgeon = request.requiredResources?.surgeonIds?.[0] 
                    ? users.find(u => u.id === request.requiredResources?.surgeonIds?.[0])
                    : null;
                  
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient?.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.surgeryType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.scheduledDate && new Date(request.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.scheduledTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {surgeon ? surgeon.name : 'Unknown Surgeon'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace('-', ' ').charAt(0).toUpperCase() + request.status.replace('-', ' ').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {request.status === 'scheduled' && (
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'pre-op')}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Move to Pre-Op"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {request.status === 'pre-op' && (
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'in-progress')}
                              className="text-green-600 hover:text-green-900"
                              title="Start Surgery"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {request.status === 'in-progress' && (
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'post-op')}
                              className="text-purple-600 hover:text-purple-900"
                              title="Move to Post-Op"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {request.status === 'post-op' && (
                            <button
                              onClick={() => handleUpdateStatus(request.id, 'completed')}
                              className="text-gray-600 hover:text-gray-900"
                              title="Mark as Completed"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateStatus(request.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                            title="Cancel Surgery"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No patients in queue
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Queue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-xl font-semibold text-gray-900">
                {queuedSurgeries.filter(s => s.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pre-Op</p>
              <p className="text-xl font-semibold text-gray-900">
                {queuedSurgeries.filter(s => s.status === 'pre-op').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-xl font-semibold text-gray-900">
                {queuedSurgeries.filter(s => s.status === 'in-progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Post-Op</p>
              <p className="text-xl font-semibold text-gray-900">
                {queuedSurgeries.filter(s => s.status === 'post-op').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}