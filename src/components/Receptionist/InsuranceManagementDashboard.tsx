import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, FileText, CheckCircle, XCircle, Clock, DollarSign, Download, Shield, CreditCard, AlertTriangle } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Patient, Bill, InsuranceClaim } from '../../types';
import { generateReceiptPDF, generateInvoicePDF } from '../../utils/billingExport';
import { DashboardLoading } from '../Common/DashboardLoading';

export function InsuranceManagementDashboard() {
  const { patients, bills, insuranceClaims, submitInsuranceClaim, loading, error } = useHospital();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [insuranceFilter, setInsuranceFilter] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimAmount, setClaimAmount] = useState('');
  const [notes, setNotes] = useState('');

  // Filter patients with insurance
  const insurancePatients = patients.filter(patient => 
    patient.insuranceInfo?.provider && 
    patient.insuranceInfo.provider !== 'Direct' && 
    patient.insuranceInfo.provider !== 'Lipa Kwa Simu'
  );

  const filteredPatients = insurancePatients.filter(patient => {
    const matchesSearch = searchTerm === '' || 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.insuranceInfo?.membershipNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesInsurance = insuranceFilter === '' || patient.insuranceInfo?.provider === insuranceFilter;

    return matchesSearch && matchesInsurance;
  });

  // Filter bills for insurance patients
  const insuranceBills = bills.filter(bill => {
    const patient = patients.find(p => p.id === bill.patientId);
    return patient && patient.insuranceInfo?.provider && 
           patient.insuranceInfo.provider !== 'Direct' && 
           patient.insuranceInfo.provider !== 'Lipa Kwa Simu';
  });

  const filteredBills = insuranceBills.filter(bill => {
    const patient = patients.find(p => p.id === bill.patientId);
    if (!patient) return false;

    const matchesSearch = searchTerm === '' || 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.id.includes(searchTerm);

    const matchesStatus = statusFilter === '' || bill.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filter insurance claims
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

  const getPatientInsuranceInfo = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.insuranceInfo : { provider: '', membershipNumber: '' };
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
      case 'paid': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsuranceIcon = (provider: string) => {
    switch (provider) {
      case 'NHIF':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'AAR':
      case 'Jubilee':
        return <CreditCard className="w-5 h-5 text-green-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    const patientInsurance = getPatientInsuranceInfo(selectedBill.patientId);
    
    submitInsuranceClaim({
      billId: selectedBill.id,
      patientId: selectedBill.patientId,
      insuranceProvider: patientInsurance.provider,
      membershipNumber: patientInsurance.membershipNumber,
      claimAmount: selectedBill.total,
      claimedAmount: parseFloat(claimAmount) || selectedBill.total,
      nhifClaimNumber: `NHIF-${Date.now()}`,
      notes
    });

    setShowClaimForm(false);
    setSelectedBill(null);
    setClaimAmount('');
    setNotes('');
  };

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
  };

  const handleViewClaim = (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
  };

  const handleGenerateReceipt = (bill: Bill) => {
    const patient = patients.find(p => p.id === bill.patientId);
    if (patient) {
      generateReceiptPDF(bill, patient);
    }
  };

  const handleGenerateInvoice = (bill: Bill) => {
    const patient = patients.find(p => p.id === bill.patientId);
    if (patient) {
      generateInvoicePDF(bill, patient);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <DashboardLoading 
        role="receptionist" 
        department="Insurance Management" 
        title="Insurance Management" 
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Error Loading Insurance Data</h3>
          </div>
          <p className="text-sm text-red-700 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Insurance Management</h1>
        <div className="text-gray-600">{user?.name}</div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <div className="text-sm text-gray-500">Insurance Patients</div>
              <div className="text-2xl font-semibold">{insurancePatients.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <div className="text-sm text-gray-500">Pending Bills</div>
              <div className="text-2xl font-semibold">{insuranceBills.filter(b => b.status === 'pending').length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <div className="text-sm text-gray-500">Pending Claims</div>
              <div className="text-2xl font-semibold">{insuranceClaims.filter(c => c.status === 'pending').length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <div className="text-sm text-gray-500">Total Claims Value</div>
              <div className="text-2xl font-semibold">
                {formatCurrency(insuranceClaims.reduce((sum, claim) => sum + claim.claimAmount, 0))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search patients, bills, or claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={insuranceFilter}
              onChange={(e) => setInsuranceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Insurance</option>
              <option value="NHIF">NHIF</option>
              <option value="AAR">AAR</option>
              <option value="Jubilee">Jubilee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Insurance Patients */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Insurance Patients ({filteredPatients.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insurance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{patient.mrn}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getInsuranceIcon(patient.insuranceInfo?.provider || '')}
                      <span className="ml-2 text-sm text-gray-900">{patient.insuranceInfo?.provider}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.insuranceInfo?.membershipNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(patient.insuranceInfo?.validationStatus || 'pending')}`}>
                      {patient.insuranceInfo?.validationStatus || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insurance Bills */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Insurance Bills ({filteredBills.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getPatientName(bill.patientId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bill.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(bill.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(bill.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewBill(bill)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    {bill.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedBill(bill);
                          setShowClaimForm(true);
                        }}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Submit Claim
                      </button>
                    )}
                    <button
                      onClick={() => handleGenerateReceipt(bill)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insurance Claims */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Insurance Claims ({filteredClaims.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getPatientName(claim.patientId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {claim.nhifClaimNumber || claim.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(claim.claimAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(claim.submissionDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewClaim(claim)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Form Modal */}
      {showClaimForm && selectedBill && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Insurance Claim</h3>
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient</label>
                  <p className="text-sm text-gray-900">{getPatientName(selectedBill.patientId)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bill Amount</label>
                  <p className="text-sm text-gray-900">{formatCurrency(selectedBill.total)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Claim Amount</label>
                  <input
                    type="number"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter claim amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Additional notes for the claim"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowClaimForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Submit Claim
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InsuranceManagementDashboard;
