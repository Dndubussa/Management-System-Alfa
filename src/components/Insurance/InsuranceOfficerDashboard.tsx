import React, { useState } from 'react';
import { Search, Filter, Eye, FileText, CheckCircle, XCircle, Clock, DollarSign, Download, BarChart3, Users, FileBarChart, Shield, UserCheck, FileSpreadsheet } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { InsuranceClaim } from '../../types';
import { InsuranceClaimDetails } from './InsuranceClaimDetails';
import { useNavigate } from 'react-router-dom';
import { DashboardLoading } from '../Common/DashboardLoading';

export function InsuranceOfficerDashboard() {
  const { insuranceClaims, patients, bills, updateInsuranceClaimStatus, loading, error } = useHospital();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const navigate = useNavigate();

  const filteredClaims = insuranceClaims.filter(claim => {
    const patient = patients.find(p => p.id === claim.patientId);
    if (!patient) return false;

    const matchesSearch = searchTerm === '' || 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.id.includes(searchTerm) ||
      claim.nhifClaimNumber?.includes(searchTerm);

    const matchesStatus = statusFilter === '' || claim.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sw-TZ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Dashboard stats
  const totalClaims = filteredClaims.length;
  const approvedClaims = filteredClaims.filter(c => c.status === 'approved').length;
  const pendingClaims = filteredClaims.filter(c => c.status === 'submitted').length;
  const rejectedClaims = filteredClaims.filter(c => c.status === 'rejected').length;
  const paidClaims = filteredClaims.filter(c => c.status === 'paid').length;

  const totalClaimAmount = filteredClaims.reduce((sum, claim) => sum + claim.claimAmount, 0);
  const approvedClaimAmount = filteredClaims
    .filter(c => c.status === 'approved' || c.status === 'paid')
    .reduce((sum, claim) => sum + claim.claimAmount, 0);

  const handleApproveClaim = (claimId: string) => {
    updateInsuranceClaimStatus(claimId, 'approved');
  };

  const handleRejectClaim = (claimId: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason !== null) {
      updateInsuranceClaimStatus(claimId, 'rejected', reason);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <DashboardLoading 
        role="insurance-officer" 
        department="Insurance" 
        title="Insurance Officer" 
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
          </div>
          <p className="text-sm text-red-700 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Insurance Officer Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold text-gray-900">{totalClaims}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{pendingClaims}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{approvedClaims}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{rejectedClaims}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalClaimAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Insurance Claims Management</h3>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">
                {pendingClaims} pending claims
              </span>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient name, claim ID or NHIF number..."
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
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Insurance Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount (TZS)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NHIF Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter 
                      ? 'No claims found matching your criteria.' 
                      : 'No insurance claims available.'}
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{claim.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getPatientName(claim.patientId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{claim.insuranceProvider}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(claim.claimAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{claim.nhifClaimNumber || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(claim.status)}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(claim.submissionDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {claim.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleRejectClaim(claim.id)}
                              className="text-red-600 hover:text-red-900 transition-colors flex items-center space-x-1"
                              title="Reject Claim"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleApproveClaim(claim.id)}
                              className="text-green-600 hover:text-green-900 transition-colors flex items-center space-x-1"
                              title="Approve Claim"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedClaim(claim)}
                          className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-1"
                          title="View Claim Details"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <p className="text-gray-600 mt-1">Navigate to different sections of the insurance management system</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center text-center"
            onClick={() => navigate('/insurance-verification')}
          >
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Insurance Verification</h4>
            <p className="text-xs text-gray-500">Verify patient insurance details</p>
          </div>
          
          <div 
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center text-center"
            onClick={() => navigate('/insurance-submission')}
          >
            <div className="bg-green-100 p-3 rounded-full mb-3">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Claim Submission</h4>
            <p className="text-xs text-gray-500">Create and submit insurance claims</p>
          </div>
          
          <div 
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center text-center"
            onClick={() => navigate('/insurance-tracking')}
          >
            <div className="bg-purple-100 p-3 rounded-full mb-3">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Claim Tracking</h4>
            <p className="text-xs text-gray-500">Track claim status and reconcile payments</p>
          </div>
          
          <div 
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center text-center"
            onClick={() => navigate('/insurance-reports')}
          >
            <div className="bg-yellow-100 p-3 rounded-full mb-3">
              <FileBarChart className="w-6 h-6 text-yellow-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">Reports & Analytics</h4>
            <p className="text-xs text-gray-500">Generate insurance reports</p>
          </div>
        </div>
      </div>
      
      {/* Claim Details Modal */}
      {selectedClaim && (
        <InsuranceClaimDetails 
          claim={selectedClaim} 
          onClose={() => setSelectedClaim(null)} 
        />
      )}
    </div>
  );
}