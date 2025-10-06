import React, { useState } from 'react';
import { Users, Search, Filter, Plus, Eye, Check, X, Clock } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Referral } from '../../types';
import { ReferralDetail } from './ReferralDetail';

interface ReferralListProps {
  onViewReferral: (referral: Referral) => void;
  onNewReferral: () => void;
}

export function ReferralList({ onViewReferral, onNewReferral }: ReferralListProps) {
  const { patients, referrals, updateReferralStatus } = useHospital();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [specialistFilter, setSpecialistFilter] = useState('');
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  // Filter referrals based on user role
  const userReferrals = user?.role === 'doctor' 
    ? referrals.filter(r => r.referringDoctorId === user.id)
    : referrals;

  const filteredReferrals = userReferrals.filter(referral => {
    const patient = patients.find(p => p.id === referral.patientId);
    if (!patient) return false;

    const matchesSearch = searchTerm === '' || 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || referral.status === statusFilter;
    const matchesSpecialist = specialistFilter === '' || referral.specialist === specialistFilter;

    return matchesSearch && matchesStatus && matchesSpecialist;
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpecialistColor = (specialist: string) => {
    switch (specialist) {
      case 'Cardiologist': return 'bg-red-100 text-red-800';
      case 'Nephrologist': return 'bg-blue-100 text-blue-800';
      case 'Neurologist': return 'bg-purple-100 text-purple-800';
      case 'Endocrinologist': return 'bg-green-100 text-green-800';
      case 'Gastroenterologist': return 'bg-orange-100 text-orange-800';
      case 'Pulmonologist': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get unique specialists for filter dropdown
  const uniqueSpecialists = [...new Set(referrals.map(r => r.specialist))];

  const handleViewReferral = (referral: Referral) => {
    setSelectedReferral(referral);
  };

  const handleCloseDetail = () => {
    setSelectedReferral(null);
  };

  const handleUpdateStatus = (status: Referral['status']) => {
    if (selectedReferral) {
      updateReferralStatus(selectedReferral.id, status);
      setSelectedReferral({ ...selectedReferral, status });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            Specialist Referrals
          </h2>
          {user?.role === 'doctor' && (
            <button
              onClick={onNewReferral}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Referral</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient name or referral reason..."
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
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={specialistFilter}
            onChange={(e) => setSpecialistFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Specialists</option>
            {uniqueSpecialists.map(specialist => (
              <option key={specialist} value={specialist}>{specialist}</option>
            ))}
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
                Specialist
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Referral Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReferrals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  {searchTerm || statusFilter || specialistFilter 
                    ? 'No referrals found matching your criteria.' 
                    : 'No referrals created yet.'}
                </td>
              </tr>
            ) : (
              filteredReferrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getPatientName(referral.patientId)}
                    </div>
                    <div className="text-sm text-gray-500">ID: {referral.patientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSpecialistColor(referral.specialist)}`}>
                      {referral.specialist}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={referral.reason}>
                      {referral.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(referral.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(referral.status)}`}>
                      {referral.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewReferral(referral)}
                      className="text-green-600 hover:text-green-900 transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Referral Detail Modal */}
      {selectedReferral && (
        <ReferralDetail
          referral={selectedReferral}
          onClose={handleCloseDetail}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}