import React, { useState } from 'react';
import { Search, Filter, Eye, CreditCard, Users, Clock } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Bill } from '../../types';

export function OutstandingBills() {
  const { bills, patients, updateBillStatus } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [partialPayment, setPartialPayment] = useState('');

  // Filter for pending bills only
  const pendingBills = bills.filter(bill => bill.status === 'pending');

  const filteredBills = pendingBills.filter(bill => {
    const patient = patients.find(p => p.id === bill.patientId);
    if (!patient) return false;

    const matchesSearch = searchTerm === '' || 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.id.includes(searchTerm) ||
      patient.mrn.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || bill.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getPatientMRN = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.mrn : 'Unknown MRN';
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

  const handlePartialPayment = (billId: string) => {
    const amount = parseFloat(partialPayment);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    // In a real implementation, we would update the bill with partial payment tracking
    // For now, we'll just show an alert
    alert(`Partial payment of ${formatCurrency(amount)} recorded for bill #${billId}`);
    setPartialPayment('');
    setSelectedBill(null);
  };

  // Calculate summary statistics
  const totalOutstanding = filteredBills.reduce((sum, bill) => sum + bill.total, 0);
  const patientCount = new Set(filteredBills.map(bill => bill.patientId)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Payments / Outstanding Bills</h1>
        <p className="text-gray-600 mt-1">
          Track and manage outstanding patient bills
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalOutstanding)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Patients with Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">{patientCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Bills</p>
              <p className="text-2xl font-bold text-gray-900">{filteredBills.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient name, MRN or bill ID..."
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
          </select>
        </div>
      </div>

      {/* Outstanding Bills List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Outstanding Bills</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MRN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount (TZS)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Outstanding
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter 
                      ? 'No bills found matching your criteria.' 
                      : 'No outstanding bills available.'}
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const createdDate = new Date(bill.createdAt);
                  const today = new Date();
                  const daysOutstanding = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{bill.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getPatientName(bill.patientId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getPatientMRN(bill.patientId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(bill.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(bill.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          daysOutstanding > 30 ? 'text-red-600' : 
                          daysOutstanding > 14 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {daysOutstanding} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setSelectedBill(bill)}
                            className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-1"
                            title="Record Partial Payment"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Partial Pay</span>
                          </button>
                          <button
                            onClick={() => {
                              // View bill details - would open a modal in a real implementation
                              alert(`Viewing details for bill #${bill.id}`);
                            }}
                            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
                            title="View Bill Details"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partial Payment Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Record Partial Payment</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient
                </label>
                <div className="text-sm text-gray-900">
                  {getPatientName(selectedBill.patientId)}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Amount
                </label>
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(selectedBill.total)}
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="partialPayment" className="block text-sm font-medium text-gray-700 mb-1">
                  Partial Payment Amount (TZS)
                </label>
                <input
                  type="number"
                  id="partialPayment"
                  value={partialPayment}
                  onChange={(e) => setPartialPayment(e.target.value)}
                  placeholder="Enter payment amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedBill(null);
                    setPartialPayment('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePartialPayment(selectedBill.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}