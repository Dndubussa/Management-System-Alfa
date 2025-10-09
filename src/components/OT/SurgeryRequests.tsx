import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, Check, X, Clock, Calendar, User, AlertCircle } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SurgeryRequest } from '../../types';

export function SurgeryRequests() {
  const { surgeryRequests, patients, users, updateSurgeryRequest, otResources, otSlots } = useHospital();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<SurgeryRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    otRoomId: '',
    notes: ''
  });
  const navigate = useNavigate();

  // Filter surgery requests to only show those from doctors (specialists)
  // and only show pending requests for OT coordinators
  const filteredRequests = surgeryRequests.filter(request => {
    // Find the requesting user
    const requestingUser = users.find(u => u.id === request.requestingDoctorId);
    
    // Only show requests from doctors or specialists
    const isFromDoctor = requestingUser && (
      requestingUser.role === 'doctor' || 
      requestingUser.role === 'ophthalmologist' ||
      requestingUser.role === 'radiologist'
    );
    
    // Match search term
    const matchesSearch = 
      request.surgeryType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patients.find(p => p.id === request.patientId)?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patients.find(p => p.id === request.patientId)?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Match status filter
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    // Only show pending requests for OT coordinators
    const isPending = request.status === 'pending';
    
    return isFromDoctor && matchesSearch && matchesStatus && isPending;
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

  const handleScheduleRequest = (request: SurgeryRequest) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setApprovalData({
      ...approvalData,
      scheduledDate: tomorrow.toISOString().split('T')[0]
    });
  };

  const handleConfirmSchedule = () => {
    if (selectedRequest && approvalData.scheduledDate && approvalData.scheduledTime && approvalData.otRoomId) {
      updateSurgeryRequest(selectedRequest.id, {
        status: 'scheduled',
        scheduledDate: approvalData.scheduledDate,
        scheduledTime: approvalData.scheduledTime,
        otRoomId: approvalData.otRoomId,
        notes: approvalData.notes,
        updatedAt: new Date().toISOString()
      });
      
      // Reset form and close modal
      setApprovalData({
        scheduledDate: '',
        scheduledTime: '',
        otRoomId: '',
        notes: ''
      });
      setShowApprovalModal(false);
      setSelectedRequest(null);
    }
  };

  // Get available OT rooms
  const otRooms = otResources.filter(resource => resource.type === 'ot-room');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Surgery Requests</h1>
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
                        <div className="text-sm text-gray-500">
                          {doctor ? doctor.role : ''}
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
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleScheduleRequest(request)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Schedule Surgery"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleApproveRequest}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                          title="Approve Request"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleRejectRequest}
                          className="text-red-600 hover:text-red-900"
                          title="Reject Request"
                        >
                          <X className="w-4 h-4" />
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
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {patients.find(p => p.id === selectedRequest.patientId) ? 
                        `${patients.find(p => p.id === selectedRequest.patientId)?.firstName} ${patients.find(p => p.id === selectedRequest.patientId)?.lastName}` : 
                        'Unknown Patient'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Requesting Doctor</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {users.find(u => u.id === selectedRequest.requestingDoctorId)?.name || 'Unknown Doctor'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Surgery Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.surgeryType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Urgency</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedRequest.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                        selectedRequest.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedRequest.urgency.charAt(0).toUpperCase() + selectedRequest.urgency.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Request Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedRequest.requestedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1 text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.diagnosis}</p>
                </div>
                
                {selectedRequest.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
                <button
                  onClick={() => handleScheduleRequest(selectedRequest)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Schedule Surgery
                </button>
                <button
                  onClick={handleApproveRequest}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
                >
                  Approve Request
                </button>
                <button
                  onClick={handleRejectRequest}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Surgery Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Schedule Surgery</h3>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Surgery Request</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {selectedRequest.surgeryType} for {patients.find(p => p.id === selectedRequest.patientId) ? 
                          `${patients.find(p => p.id === selectedRequest.patientId)?.firstName} ${patients.find(p => p.id === selectedRequest.patientId)?.lastName}` : 
                          'Unknown Patient'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={approvalData.scheduledDate}
                    onChange={(e) => setApprovalData({...approvalData, scheduledDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={approvalData.scheduledTime}
                    onChange={(e) => setApprovalData({...approvalData, scheduledTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operating Theatre
                  </label>
                  <select
                    value={approvalData.otRoomId}
                    onChange={(e) => setApprovalData({...approvalData, otRoomId: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select an operating theatre</option>
                    {otRooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={approvalData.notes}
                    onChange={(e) => setApprovalData({...approvalData, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Additional scheduling notes"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSchedule}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  disabled={!approvalData.scheduledDate || !approvalData.scheduledTime || !approvalData.otRoomId}
                >
                  Confirm Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}