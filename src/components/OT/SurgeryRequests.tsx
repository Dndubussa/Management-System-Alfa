import { useState } from 'react';
import { Search, Filter, Plus, Eye, Check, X, Clock } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { SurgeryRequest } from '../../types';

export function SurgeryRequests() {
  const { surgeryRequests, patients, users, updateSurgeryRequest } = useHospital();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<SurgeryRequest | null>(null);

  // Filter surgery requests
  const filteredRequests = surgeryRequests.filter(request => {
    const matchesSearch = 
      request.surgeryType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patients.find(p => p.id === request.patientId)?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patients.find(p => p.id === request.patientId)?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'postponed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReviewRequest = (request: SurgeryRequest) => {
    setSelectedRequest(request);
  };

  const handleApproveRequest = () => {
    if (selectedRequest) {
      updateSurgeryRequest(selectedRequest.id, { status: 'reviewed', updatedAt: new Date().toISOString() });
      setSelectedRequest(null);
    }
  };

  const handleRejectRequest = () => {
    if (selectedRequest) {
      updateSurgeryRequest(selectedRequest.id, { status: 'cancelled', updatedAt: new Date().toISOString() });
      setSelectedRequest(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Surgery Requests</h1>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
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
                  Requested By
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgency
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
              {filteredRequests.length > 0 ? (
                filteredRequests.map(request => {
                  const patient = patients.find(p => p.id === request.patientId);
                  const doctor = users.find(u => u.id === request.requestingDoctorId);
                  
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
                          {doctor ? doctor.name : 'Unknown Doctor'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.requestedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                          request.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleReviewRequest(request)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No surgery requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Surgery Request Details</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Patient Information</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> {
                        patients.find(p => p.id === selectedRequest.patientId) ? 
                        `${patients.find(p => p.id === selectedRequest.patientId)?.firstName} ${patients.find(p => p.id === selectedRequest.patientId)?.lastName}` : 
                        'Unknown Patient'
                      }
                    </p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Diagnosis:</span> {selectedRequest.diagnosis}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Surgery Details</h4>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <p className="text-sm"><span className="font-medium">Type:</span> {selectedRequest.surgeryType}</p>
                    <p className="text-sm"><span className="font-medium">Urgency:</span> {selectedRequest.urgency}</p>
                    <p className="text-sm"><span className="font-medium">Status:</span> 
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                      </span>
                    </p>
                    {selectedRequest.notes && (
                      <p className="text-sm"><span className="font-medium">Notes:</span> {selectedRequest.notes}</p>
                    )}
                  </div>
                </div>
                
                {selectedRequest.preOpAssessment && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Pre-Op Assessment</h4>
                    <div className="bg-gray-50 p-4 rounded-md space-y-2">
                      <p className="text-sm"><span className="font-medium">ASA Classification:</span> {selectedRequest.preOpAssessment.asaClassification}</p>
                      <p className="text-sm"><span className="font-medium">Anesthesia Plan:</span> {selectedRequest.preOpAssessment.anesthesiaPlan}</p>
                      <p className="text-sm"><span className="font-medium">Fasting Status:</span> {selectedRequest.preOpAssessment.fastingStatus}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  {selectedRequest.status === 'pending' && (
                    <>
                      <button
                        onClick={handleRejectRequest}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                      <button
                        onClick={handleApproveRequest}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                    </>
                  )}
                  {selectedRequest.status === 'reviewed' && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Schedule Surgery
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}