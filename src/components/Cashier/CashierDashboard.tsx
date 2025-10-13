import React, { useState } from 'react';
import { Search, Filter, Eye, Printer, DollarSign, CreditCard, FileText, BarChart3, Users } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { Bill } from '../../types';
import { generateReceiptPDF, generateInvoicePDF } from '../../utils/billingExport';

export function CashierDashboard() {
  const { bills, patients, updateBillStatus } = useHospital();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'lipa_kwa_simu' | 'card' | 'insurance'>('cash');

  const filteredBills = bills.filter(bill => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      // case 'partially-paid': return 'bg-blue-100 text-blue-800'; // Not supported in current Bill type
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePayment = (billId: string, paymentMethod: string) => {
    // For insurance payments, we don't mark as paid but forward to insurance officer
    if (paymentMethod === 'insurance') {
      updateBillStatus(billId, 'pending', 'insurance');
      // In a real implementation, we would also create an insurance claim
    } else {
      updateBillStatus(billId, 'paid', paymentMethod);
    }
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

  // Calculate daily collections summary
  const paidBills = filteredBills.filter(bill => bill.status === 'paid');
  const cashPayments = paidBills.filter(bill => bill.paymentMethod === 'cash');
  const posPayments = paidBills.filter(bill => bill.paymentMethod === 'card');
  const mobilePayments = paidBills.filter(bill => bill.paymentMethod === 'lipa_kwa_simu');
  // For demo purposes, we'll consider half of card payments as bank transfers
  const bankPayments = paidBills.filter((bill, index) => bill.paymentMethod === 'card' && index % 2 === 0);
  
  const cashTotal = cashPayments.reduce((sum, bill) => sum + bill.total, 0);
  const posTotal = posPayments.reduce((sum, bill) => sum + bill.total, 0);
  const mobileTotal = mobilePayments.reduce((sum, bill) => sum + bill.total, 0);
  const bankTotal = bankPayments.reduce((sum, bill) => sum + bill.total, 0);
  
  const totalCollected = cashTotal + posTotal + mobileTotal + bankTotal;
  
  // Pending payments
  const pendingBills = filteredBills.filter(bill => bill.status === 'pending');
  const pendingTotal = pendingBills.reduce((sum, bill) => sum + bill.total, 0);
  
  // Insurance claims
  const insuranceBills = filteredBills.filter(bill => bill.paymentMethod === 'insurance');
  const insuranceTotal = insuranceBills.reduce((sum, bill) => sum + bill.total, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Cashier Dashboard
        </p>
      </div>

      {/* Today's Collections Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cash</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(cashTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">POS</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(posTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mobile Money</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(mobileTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bank Transfers</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(bankTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Collected</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalCollected)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-xl font-bold text-gray-900">{pendingBills.length} patients</p>
              <p className="text-sm text-gray-500">{formatCurrency(pendingTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Insurance Claims</p>
              <p className="text-xl font-bold text-gray-900">{insuranceBills.length} claims</p>
              <p className="text-sm text-gray-500">{formatCurrency(insuranceTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Billing Records */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Patient Billing Records</h3>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">
                {filteredBills.filter(b => b.status === 'pending').length} pending bills
              </span>
            </div>
          </div>

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
              <option value="paid">Paid</option>
              {/* <option value="partially-paid">Partially Paid</option> */}
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
                  MRN
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
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getPatientMRN(bill.patientId)}</div>
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
                          onClick={() => handleDownloadInvoice(bill)}
                          className="text-green-600 hover:text-green-900 transition-colors flex items-center space-x-1"
                          title="Download Invoice"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Invoice</span>
                        </button>
                        {bill.status === 'paid' && (
                          <button
                            onClick={() => handleDownloadReceipt(bill)}
                            className="text-purple-600 hover:text-purple-900 transition-colors flex items-center space-x-1"
                            title="Download Receipt"
                          >
                            <Printer className="w-4 h-4" />
                            <span>Receipt</span>
                          </button>
                        )}
                        {bill.status === 'pending' && (
                          <div className="relative inline-block">
                            <button
                              onClick={() => setSelectedBill(bill)}
                              className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-1"
                              title="Collect Payment"
                            >
                              <CreditCard className="w-4 h-4" />
                              <span>Pay</span>
                            </button>
                          </div>
                        )}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Collection Modal */}
      {selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Collect Payment</h3>
              
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 border rounded-md text-sm font-medium ${
                      paymentMethod === 'cash' 
                        ? 'bg-green-100 border-green-500 text-green-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('lipa_kwa_simu')}
                    className={`p-3 border rounded-md text-sm font-medium ${
                      paymentMethod === 'lipa_kwa_simu' 
                        ? 'bg-green-100 border-green-500 text-green-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Lipa Kwa Simu
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 border rounded-md text-sm font-medium ${
                      paymentMethod === 'card' 
                        ? 'bg-green-100 border-green-500 text-green-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    POS/Swipe Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 border rounded-md text-sm font-medium ${
                      paymentMethod === 'card' 
                        ? 'bg-green-100 border-green-500 text-green-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
Bank Transfer (Card)
                  </button>
                  <button
                    onClick={() => setPaymentMethod('insurance')}
                    className={`p-3 border rounded-md text-sm font-medium ${
                      paymentMethod === 'insurance' 
                        ? 'bg-green-100 border-green-500 text-green-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Insurance
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedBill(null);
                    setPaymentMethod('cash');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handlePayment(selectedBill.id, paymentMethod);
                    setSelectedBill(null);
                    setPaymentMethod('cash');
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}