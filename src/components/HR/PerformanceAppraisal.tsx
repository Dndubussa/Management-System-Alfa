import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Star, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Eye
} from 'lucide-react';

interface PerformanceAppraisal {
  id: string;
  staffId: string;
  staffName: string;
  period: string;
  appraisalType: string;
  supervisorName: string;
  selfRating: number;
  supervisorRating: number;
  peerRating?: number;
  overallRating: number;
  status: string;
  submittedDate: string;
  reviewedDate?: string;
}

const PerformanceAppraisal: React.FC = () => {
  const [appraisals, setAppraisals] = useState<PerformanceAppraisal[]>([]);
  const [filteredAppraisals, setFilteredAppraisals] = useState<PerformanceAppraisal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const appraisalTypes = ['annual', 'quarterly', 'probation'];
  const statuses = ['draft', 'submitted', 'reviewed', 'approved'];
  const periods = ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4', '2023-Annual'];

  useEffect(() => {
    // TODO: Replace with actual API calls to fetch performance appraisal data
    // For now, showing empty state
    setAppraisals([]);
    setFilteredAppraisals([]);
  }, []);

  useEffect(() => {
    let filtered = appraisals;

    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.supervisorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(a => a.appraisalType === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(a => a.status === selectedStatus);
    }

    if (selectedPeriod !== 'all') {
      filtered = filtered.filter(a => a.period === selectedPeriod);
    }

    setFilteredAppraisals(filtered);
  }, [appraisals, searchTerm, selectedType, selectedStatus, selectedPeriod]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'bg-purple-100 text-purple-800';
      case 'quarterly': return 'bg-blue-100 text-blue-800';
      case 'probation': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-current text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-current text-yellow-400 opacity-50" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  const getStats = () => {
    const total = appraisals.length;
    const draft = appraisals.filter(a => a.status === 'draft').length;
    const submitted = appraisals.filter(a => a.status === 'submitted').length;
    const reviewed = appraisals.filter(a => a.status === 'reviewed').length;
    const approved = appraisals.filter(a => a.status === 'approved').length;
    const averageRating = appraisals.length > 0 
      ? (appraisals.reduce((sum, a) => sum + a.overallRating, 0) / appraisals.length).toFixed(1)
      : '0.0';

    return { total, draft, submitted, reviewed, approved, averageRating };
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-800 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Performance & Appraisal</h1>
            <p className="text-pink-100">Manage staff performance reviews and appraisals</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-pink-700 hover:bg-pink-600 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button className="bg-white text-pink-600 hover:bg-pink-50 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Plus className="h-4 w-4" />
              <span>New Appraisal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Appraisals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Submitted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Eye className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reviewed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.reviewed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Star className="h-6 w-6 text-pink-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search appraisals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {appraisalTypes.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">All Periods</option>
            {periods.map(period => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {filteredAppraisals.length} appraisals
            </span>
          </div>
        </div>
      </div>

      {/* Appraisals Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff & Supervisor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period & Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ratings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppraisals.map((appraisal) => (
                <tr key={appraisal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{appraisal.staffName}</div>
                      <div className="text-sm text-gray-500">{appraisal.staffId}</div>
                      <div className="text-sm text-gray-500">Supervisor: {appraisal.supervisorName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{appraisal.period}</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(appraisal.appraisalType)}`}>
                        {appraisal.appraisalType}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Self:</span>
                        <span className={`text-sm font-medium ${getRatingColor(appraisal.selfRating)}`}>
                          {appraisal.selfRating}
                        </span>
                        <div className="flex">
                          {getRatingStars(appraisal.selfRating)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Supervisor:</span>
                        <span className={`text-sm font-medium ${getRatingColor(appraisal.supervisorRating)}`}>
                          {appraisal.supervisorRating}
                        </span>
                        <div className="flex">
                          {getRatingStars(appraisal.supervisorRating)}
                        </div>
                      </div>
                      {appraisal.peerRating && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Peer:</span>
                          <span className={`text-sm font-medium ${getRatingColor(appraisal.peerRating)}`}>
                            {appraisal.peerRating}
                          </span>
                          <div className="flex">
                            {getRatingStars(appraisal.peerRating)}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${getRatingColor(appraisal.overallRating)}`}>
                        {appraisal.overallRating}
                      </span>
                      <div className="flex">
                        {getRatingStars(appraisal.overallRating)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appraisal.status)}`}>
                      {appraisal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        Submitted: {new Date(appraisal.submittedDate).toLocaleDateString()}
                      </div>
                      {appraisal.reviewedDate && (
                        <div className="text-sm text-gray-500">
                          Reviewed: {new Date(appraisal.reviewedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
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

      {/* Empty State */}
      {filteredAppraisals.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No appraisals found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default PerformanceAppraisal;
