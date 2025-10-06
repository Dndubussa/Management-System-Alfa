import { useState } from 'react';
import { Calendar, Clock, Users, Scissors, Plus, Filter } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';

export function OTSchedule() {
  const { surgeryRequests, otSlots, otResources, patients, users } = useHospital();
  const { user } = useAuth();
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRoom, setSelectedRoom] = useState('all');

  // Get scheduled surgeries
  const scheduledSurgeries = surgeryRequests.filter(req => req.status === 'scheduled' && req.scheduledDate);

  // Get OT rooms
  const otRooms = otResources.filter(resource => resource.type === 'ot-room');

  // Filter surgeries by date and room
  const filteredSurgeries = scheduledSurgeries.filter(surgery => {
    const matchesDate = !selectedDate || surgery.scheduledDate === selectedDate;
    const matchesRoom = selectedRoom === 'all' || surgery.otRoomId === selectedRoom;
    return matchesDate && matchesRoom;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'delayed': return 'bg-orange-100 text-orange-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate time slots for the day view
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">OT Schedule</h1>
        <div className="flex space-x-3">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Rooms</option>
              {otRooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setView('day')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md ${
                view === 'day' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-2 text-sm font-medium ${
                view === 'week' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border-t border-b border-gray-300`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md ${
                view === 'month' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              Month
            </button>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Surgery
          </button>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-md hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {view === 'day' 
                ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                : view === 'week'
                ? `Week of ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                : new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              }
            </h2>
            <button className="p-2 rounded-md hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="flex space-x-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Schedule View */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {view === 'day' ? (
          // Day View
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Time slots */}
              <div className="grid grid-cols-5 gap-4 p-6">
                {/* OT Rooms Header */}
                <div className="col-span-1"></div>
                {otRooms.filter(room => selectedRoom === 'all' || room.id === selectedRoom).map(room => (
                  <div key={room.id} className="col-span-1 text-center font-medium text-gray-900">
                    {room.name}
                  </div>
                ))}
              </div>
              
              {/* Time-based schedule */}
              {timeSlots.map(time => (
                <div key={time} className="grid grid-cols-5 gap-4 p-6 border-t border-gray-200">
                  <div className="col-span-1 text-sm text-gray-500 font-medium">
                    {time}
                  </div>
                  {otRooms.filter(room => selectedRoom === 'all' || room.id === selectedRoom).map(room => {
                    const surgery = filteredSurgeries.find(s => 
                      s.otRoomId === room.id && 
                      s.scheduledDate === selectedDate &&
                      s.scheduledTime === time
                    );
                    
                    return (
                      <div key={`${room.id}-${time}`} className="col-span-1">
                        {surgery ? (
                          <div className={`p-3 rounded-md border ${getStatusColor(surgery.status)}`}>
                            <div className="font-medium text-sm">
                              {surgery.surgeryType}
                            </div>
                            <div className="text-xs mt-1">
                              {patients.find(p => p.id === surgery.patientId) ? 
                                `${patients.find(p => p.id === surgery.patientId)?.firstName} ${patients.find(p => p.id === surgery.patientId)?.lastName}` : 
                                'Unknown Patient'
                              }
                            </div>
                            <div className="text-xs mt-1">
                              {users.find(u => u.id === surgery.requiredResources?.surgeonIds[0])?.name || 'Unknown Surgeon'}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full border-2 border-dashed border-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-xs text-gray-400">Available</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : view === 'week' ? (
          // Week View
          <div className="p-6">
            <div className="grid grid-cols-8 gap-4">
              <div className="col-span-1"></div>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={day} className="text-center font-medium text-gray-900">
                  {day}
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() - new Date(selectedDate).getDay() + index)).getDate()}
                  </div>
                </div>
              ))}
              
              {otRooms.filter(room => selectedRoom === 'all' || room.id === selectedRoom).map(room => (
                <div key={room.id} className="contents">
                  <div className="font-medium text-gray-900 py-2 border-t border-gray-200">
                    {room.name}
                  </div>
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const dayDate = new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() - new Date(selectedDate).getDay() + dayIndex));
                    const dayDateString = dayDate.toISOString().split('T')[0];
                    
                    const daySurgeries = filteredSurgeries.filter(s => 
                      s.otRoomId === room.id && 
                      s.scheduledDate === dayDateString
                    );
                    
                    return (
                      <div key={`${room.id}-${dayIndex}`} className="border-t border-gray-200 py-2 min-h-24">
                        {daySurgeries.length > 0 ? (
                          <div className="space-y-2">
                            {daySurgeries.map(surgery => (
                              <div key={surgery.id} className={`p-2 rounded text-xs ${getStatusColor(surgery.status)}`}>
                                <div className="font-medium">
                                  {surgery.surgeryType}
                                </div>
                                <div className="truncate">
                                  {patients.find(p => p.id === surgery.patientId) ? 
                                    `${patients.find(p => p.id === surgery.patientId)?.firstName} ${patients.find(p => p.id === surgery.patientId)?.lastName}` : 
                                    'Unknown Patient'
                                  }
                                </div>
                                <div>
                                  {surgery.scheduledTime}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 text-center py-8">
                            No surgeries
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Month View
          <div className="p-6">
            <div className="text-center text-gray-500 mb-4">
              Month view implementation would go here
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-md font-medium text-gray-900 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Scheduled</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Delayed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Emergency</span>
          </div>
        </div>
      </div>
    </div>
  );
}