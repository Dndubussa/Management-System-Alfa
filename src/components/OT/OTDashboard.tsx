import { useState } from 'react';
import { Calendar, Scissors, Users, Settings, FileBarChart, Bell, TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function OTDashboard() {
  const { surgeryRequests, otSlots, otResources, users, updateSurgeryRequest } = useHospital();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('today');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();

  // Filter surgery requests by status
  const pendingRequests = surgeryRequests.filter(req => req.status === 'pending');
  const scheduledSurgeries = surgeryRequests.filter(req => req.status === 'scheduled');
  const completedSurgeries = surgeryRequests.filter(req => req.status === 'completed');
  const cancelledSurgeries = surgeryRequests.filter(req => req.status === 'cancelled');
  const inProgressSurgeries = surgeryRequests.filter(req => req.status === 'in-progress');
  const postponedSurgeries = surgeryRequests.filter(req => req.status === 'postponed');

  // Filter by urgency
  const emergencySurgeries = surgeryRequests.filter(req => req.urgency === 'emergency');
  const urgentSurgeries = surgeryRequests.filter(req => req.urgency === 'urgent');
  const routineSurgeries = surgeryRequests.filter(req => req.urgency === 'routine');

  // Use today's date for filtering
  const dashboardDate = new Date().toISOString().slice(0, 10);

  // Get available OT rooms
  const availableOTRooms = otResources.filter(resource => 
    resource.type === 'ot-room' && 
    resource.availability && 
    resource.availability[dashboardDate]?.some(slot => slot.status === 'available')
  );

  // Get available surgeons
  const availableSurgeons = otResources.filter(resource => 
    resource.type === 'surgeon' && 
    resource.availability && 
    resource.availability[dashboardDate]?.some(slot => slot.status === 'available')
  );

  // Debug information
  console.log('OT Dashboard Data:', {
    surgeryRequests,
    otSlots,
    otResources,
    users,
    pendingRequests,
    scheduledSurgeries,
    availableOTRooms,
    availableSurgeons
  });

  const handleReviewRequest = (request: any) => {
    // For now, we'll just log the request
    console.log('Reviewing request:', request);
    // In a real implementation, you might want to navigate to a review page or open a modal
    // For now, let's update the status to 'reviewed'
    updateSurgeryRequest(request.id, { status: 'reviewed' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Operating Theatre Dashboard</h1>
        <div className="flex space-x-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Scissors className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-xl font-semibold text-gray-900">{surgeryRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl font-semibold text-gray-900">{completedSurgeries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-xl font-semibold text-gray-900">{scheduledSurgeries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-xl font-semibold text-gray-900">{cancelledSurgeries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-xl font-semibold text-gray-900">{inProgressSurgeries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Emergency</p>
              <p className="text-xl font-semibold text-gray-900">{emergencySurgeries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-xl font-semibold text-gray-900">{urgentSurgeries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Routine</p>
              <p className="text-xl font-semibold text-gray-900">{routineSurgeries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileBarChart className="w-5 h-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Postponed</p>
              <p className="text-xl font-semibold text-gray-900">{postponedSurgeries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Surgery Requests */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Pending Surgery Requests</h2>
              <button 
                className="text-sm text-green-600 hover:text-green-800 font-medium"
                onClick={() => navigate('/surgery-requests')}
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.slice(0, 5).map(request => {
                  const patient = users.find(u => u.id === request.patientId);
                  const doctor = users.find(u => u.id === request.requestingDoctorId);
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{request.surgeryType}</h3>
                          <p className="text-sm text-gray-500">
                            Patient: {patient ? `${patient.name}` : 'Unknown Patient'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Requested by: {doctor ? doctor.name : 'Unknown Doctor'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(request.requestedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                          request.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                        </span>
                        <button 
                          className="text-sm text-green-600 hover:text-green-800 font-medium"
                          onClick={() => handleReviewRequest(request)}
                        >
                          Review Request
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No pending surgery requests</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Surgeries */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Scheduled Surgeries</h2>
          </div>
          <div className="p-6">
            {scheduledSurgeries.length > 0 ? (
              <div className="space-y-4">
                {scheduledSurgeries.slice(0, 5).map(request => {
                  const patient = users.find(u => u.id === request.patientId);
                  const doctor = users.find(u => u.id === request.requestingDoctorId);
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{request.surgeryType}</h3>
                          <p className="text-sm text-gray-500">
                            Patient: {patient ? `${patient.name}` : 'Unknown Patient'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Scheduled
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>
                          {request.scheduledDate && new Date(request.scheduledDate).toLocaleDateString()} at {request.scheduledTime}
                        </p>
                        <p className="mt-1">
                          Requested by: {doctor ? doctor.name : 'Unknown Doctor'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No scheduled surgeries</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resources & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Resources */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Available Resources</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">OT Rooms</h3>
                <div className="flex flex-wrap gap-2">
                  {availableOTRooms.length > 0 ? (
                    availableOTRooms.map(room => (
                      <span key={room.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {room.name}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No OT rooms available</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Surgeons</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSurgeons.length > 0 ? (
                    availableSurgeons.map(surgeon => (
                      <span key={surgeon.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {surgeon.name}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No surgeons available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Notifications</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Bell className="w-5 h-5 text-blue-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">New surgery request received</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Bell className="w-5 h-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Surgery scheduled for today</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Bell className="w-5 h-5 text-orange-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Resource conflict detected</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}