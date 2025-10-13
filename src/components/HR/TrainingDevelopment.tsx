import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Eye
} from 'lucide-react';

interface Training {
  id: string;
  title: string;
  description: string;
  type: string;
  provider: string;
  startDate: string;
  endDate: string;
  duration: number;
  maxParticipants: number;
  status: string;
  participantsCount: number;
}

interface TrainingAttendance {
  id: string;
  trainingId: string;
  staffName: string;
  staffId: string;
  status: string;
  score?: number;
  certificateUrl?: string;
}

const TrainingDevelopment: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [attendance, setAttendance] = useState<TrainingAttendance[]>([]);
  const [filteredTrainings, setFilteredTrainings] = useState<Training[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

  const trainingTypes = ['internal', 'external', 'online'];
  const statuses = ['scheduled', 'ongoing', 'completed', 'cancelled'];

  useEffect(() => {
    // Simulate data loading - replace with actual API calls
    const mockTrainings: Training[] = [
      {
        id: '1',
        title: 'CPR Certification',
        description: 'Basic Life Support and CPR training for all medical staff',
        type: 'internal',
        provider: 'Alfa Hospital Training Center',
        startDate: '2024-02-01',
        endDate: '2024-02-01',
        duration: 8,
        maxParticipants: 20,
        status: 'scheduled',
        participantsCount: 15
      },
      {
        id: '2',
        title: 'Advanced Cardiac Life Support',
        description: 'ACLS certification for emergency department staff',
        type: 'external',
        provider: 'American Heart Association',
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        duration: 16,
        maxParticipants: 12,
        status: 'completed',
        participantsCount: 10
      },
      {
        id: '3',
        title: 'Infection Control Protocols',
        description: 'Updated infection control procedures and protocols',
        type: 'online',
        provider: 'WHO Online Learning',
        startDate: '2024-01-20',
        endDate: '2024-01-25',
        duration: 4,
        maxParticipants: 50,
        status: 'ongoing',
        participantsCount: 35
      }
    ];

    const mockAttendance: TrainingAttendance[] = [
      {
        id: '1',
        trainingId: '1',
        staffName: 'Dr. Sarah Johnson',
        staffId: 'ASH-STF-001',
        status: 'registered'
      },
      {
        id: '2',
        trainingId: '1',
        staffName: 'Nurse Mary Mwalimu',
        staffId: 'ASH-STF-002',
        status: 'registered'
      },
      {
        id: '3',
        trainingId: '2',
        staffName: 'Dr. Ahmed Hassan',
        staffId: 'ASH-STF-003',
        status: 'completed',
        score: 95,
        certificateUrl: '/certificates/acls-ahmed-hassan.pdf'
      }
    ];

    setTrainings(mockTrainings);
    setFilteredTrainings(mockTrainings);
    setAttendance(mockAttendance);
  }, []);

  useEffect(() => {
    let filtered = trainings;

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(t => t.status === selectedStatus);
    }

    setFilteredTrainings(filtered);
  }, [trainings, searchTerm, selectedType, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'internal': return 'bg-green-100 text-green-800';
      case 'external': return 'bg-blue-100 text-blue-800';
      case 'online': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-blue-100 text-blue-800';
      case 'attended': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStats = () => {
    const total = trainings.length;
    const scheduled = trainings.filter(t => t.status === 'scheduled').length;
    const ongoing = trainings.filter(t => t.status === 'ongoing').length;
    const completed = trainings.filter(t => t.status === 'completed').length;
    const totalParticipants = trainings.reduce((sum, t) => sum + t.participantsCount, 0);

    return { total, scheduled, ongoing, completed, totalParticipants };
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Training & Development</h1>
            <p className="text-purple-100">Manage staff training programs and professional development</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Schedule Training</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Trainings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ongoing</p>
              <p className="text-2xl font-bold text-gray-900">{stats.ongoing}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search trainings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {trainingTypes.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {filteredTrainings.length} trainings
            </span>
          </div>
        </div>
      </div>

      {/* Trainings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Training Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider & Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrainings.map((training) => (
                <tr key={training.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{training.title}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{training.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{training.provider}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(training.type)}`}>
                        {training.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        Start: {new Date(training.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        End: {new Date(training.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {training.duration} hours
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{training.participantsCount}</span>
                      <span className="text-sm text-gray-500">/{training.maxParticipants}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(training.status)}`}>
                      {training.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTraining(training);
                          setShowAttendanceModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && selectedTraining && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Attendance for {selectedTraining.title}
                </h3>
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {attendance
                  .filter(att => att.trainingId === selectedTraining.id)
                  .map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{record.staffName}</h4>
                          <p className="text-sm text-gray-500">{record.staffId}</p>
                          {record.score && (
                            <p className="text-xs text-gray-400">Score: {record.score}%</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAttendanceStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                          {record.certificateUrl && (
                            <button className="text-green-600 hover:text-green-900">
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingDevelopment;
