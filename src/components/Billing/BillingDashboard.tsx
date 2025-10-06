import React, { useState } from 'react';
import { CreditCard, Search, Filter, Eye, Printer, DollarSign, FileText, Download } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Bill, InsuranceClaim } from '../../types';
import { AutobillingConfigPanel } from './AutobillingConfig';
import { InsuranceClaimsList } from './InsuranceClaimsList';
import { generateReceiptPDF, generateInvoicePDF } from '../../utils/billingExport';

interface BillingDashboardProps {
  onViewBill: (bill: Bill) => void;
  onViewClaim: (claim: InsuranceClaim) => void;
}

export function BillingDashboard({ onViewBill, onViewClaim }: BillingDashboardProps) {
  const { bills, patients, updateBillStatus, autobillingConfig, updateAutobillingConfig, insuranceClaims, submitInsuranceClaim } = useHospital();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimAmount, setClaimAmount] = useState('');
  const [notes, setNotes] = useState('');

  const filteredBills = bills.filter(bill => {
    const patient = patients.find(p => p.id === bill.patientId);
    if (!patient) return false;

    const matchesSearch = searchTerm === '' || 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.id.includes(searchTerm);

    const matchesStatus = statusFilter === '' || bill.status === statusFilter;

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
      case 'partially-paid': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePayment = (billId: string, paymentMethod: string) => {
    updateBillStatus(billId, 'paid', paymentMethod);
  };

  const handleDownloadInvoice = (bill: Bill) => {
    const patient = patients.find(p => p.id === bill.patientId);
    const invoicePDF = generateInvoicePDF(bill, patient);
    invoicePDF.save(`invoice-${bill.id}.pdf`);
  };

  const handleDownloadReceipt = (bill: Bill) => {
    const patient = patients.find(p => p.id === bill.patientId);
    const receiptPDF = generateReceiptPDF(bill, patient);
    receiptPDF.save(`receipt-${bill.id}.pdf`);
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

    // Reset form
    setSelectedBill(null);
    setShowClaimForm(false);
    setClaimAmount('');
    setNotes('');
  };

  const totalPending = filteredBills
    .filter(b => b.status === 'pending')
    .reduce((sum, bill) => sum + bill.total, 0);

  const totalPaid = filteredBills
    .filter(b => b.status === 'paid')
    .reduce((sum, bill) => sum + bill.total, 0);

  return (
    <div>
      {/* Autobilling Configuration Panel */}
      <AutobillingConfigPanel 
        config={autobillingConfig} 
        onUpdateConfig={updateAutobillingConfig} 
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Billing Management</h2>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">
                {filteredBills.filter(b => b.status === 'pending').length} pending bills
              </span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Pending Amount</p>
                  <p className="text-lg font-semibold text-yellow-900">
                    {formatCurrency(totalPending)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">Paid Amount</p>
                  <p className="text-lg font-semibold text-green-900">
                    {formatCurrency(totalPaid)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Bills</p>
                  <p className="text-lg font-semibold text-blue-900">{filteredBills.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient name or bill ID..."
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
              <option value="paid">Paid</option>
              <option value="partially-paid">Partially Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
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
                  Amount (TZS)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Created
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
                      : 'No bills available.'}
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{bill.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getPatientName(bill.patientId)}
                      </div>
                      <div className="text-sm text-gray-500">ID: {bill.patientId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(bill.total)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Subtotal: {formatCurrency(bill.subtotal)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bill.paymentMethod || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(bill.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onViewBill(bill)}
                          className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-1"
                          title="View Bill"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(bill)}
                          className="text-green-600 hover:text-green-900 transition-colors flex items-center space-x-1"
                          title="Download Invoice"
                        >
                          <Download className="w-4 h-4" />
                          <span>Invoice</span>
                        </button>
                        {bill.status === 'paid' && (
                          <button
                            onClick={() => handleDownloadReceipt(bill)}
                            className="text-purple-600 hover:text-purple-900 transition-colors flex items-center space-x-1"
                            title="Download Receipt"
                          >
                            <Download className="w-4 h-4" />
                            <span>Receipt</span>
                          </button>
                        )}
                        {bill.status === 'pending' && (
                          <button
                            onClick={() => handlePayment(bill.id, 'cash')}
                            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-1"
                            title="Mark as Paid"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Pay</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insurance Claims Section */}
      <div className="mt-6">
        <InsuranceClaimsList 
          onViewClaim={onViewClaim}
        />
      </div>

      {/* Insurance Claim Form Modal */}
      {showClaimForm && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Submit Insurance Claim</h3>
              
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
                <div className="text-sm text-gray-900">
                  {formatCurrency(selectedBill.total)}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Provider
                </label>
                <div className="text-sm text-gray-900">
                  {getPatientInsuranceInfo(selectedBill.patientId).provider}
                </div>
              </div>
              
              <form onSubmit={handleClaimSubmit}>
                <div className="mb-4">
                  <label htmlFor="claimAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Claim Amount (TZS)
                  </label>
                  <input
                    type="number"
                    id="claimAmount"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    placeholder={selectedBill.total.toString()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Additional information for the insurance claim..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowClaimForm(false);
                      setSelectedBill(null);
                      setClaimAmount('');
                      setNotes('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
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