import React, { useState } from 'react';
import { X, Printer, Download, CreditCard, Shield } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Bill } from '../../types';
import { generateReceiptPDF, generateInvoicePDF } from '../../utils/billingExport';
import { NHIFClaims } from './NHIFClaims';
import { NHIFClaimResponse } from '../../types/nhif';

interface BillDetailsProps {
  bill: Bill;
  onClose: () => void;
}

export function BillDetails({ bill, onClose }: BillDetailsProps) {
  const { patients, updateBillStatus } = useHospital();
  const [showNHIFClaims, setShowNHIFClaims] = useState(false);
  const [claimResponse, setClaimResponse] = useState<NHIFClaimResponse | null>(null);
  
  const patient = patients.find(p => p.id === bill.patientId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sw-TZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePayment = (paymentMethod: string) => {
    updateBillStatus(bill.id, 'paid', paymentMethod);
  };

  const handleClaimSubmitted = (response: NHIFClaimResponse) => {
    setClaimResponse(response);
    if (response.status === 'approved') {
      // Auto-mark as paid if claim is approved
      updateBillStatus(bill.id, 'paid', 'insurance');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    const receiptPDF = generateReceiptPDF(bill, patient);
    receiptPDF.save(`receipt-${bill.id}.pdf`);
  };

  const handleDownloadInvoice = () => {
    const invoicePDF = generateInvoicePDF(bill, patient);
    invoicePDF.save(`invoice-${bill.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Bill Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Hospital Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-green-600">ALFA SP HOSPITALS</h1>
            <p className="text-gray-600">Mikocheni Tanesco, Mwai Kibaki Rd, Dar es Salaam</p>
            <p className="text-gray-600">Phone: +255674404013 | Email: info@alfasphospitals.com</p>
            <div className="mt-4 border-b-2 border-green-600"></div>
          </div>

          {/* Bill Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Bill ID:</span> #{bill.id}</p>
                <p><span className="font-medium">Date Created:</span> {formatDate(bill.createdAt)}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                    bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {bill.status.toUpperCase()}
                  </span>
                </p>
                {bill.paidAt && (
                  <p><span className="font-medium">Paid Date:</span> {formatDate(bill.paidAt)}</p>
                )}
                {bill.paymentMethod && (
                  <p><span className="font-medium">Payment Method:</span> {bill.paymentMethod}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {patient?.firstName} {patient?.lastName}</p>
                <p><span className="font-medium">Phone:</span> {patient?.phone}</p>
                <p><span className="font-medium">Address:</span> {patient?.address}</p>
                <p><span className="font-medium">Insurance:</span> {patient?.insuranceInfo.provider}</p>
                <p><span className="font-medium">Membership No:</span> {patient?.insuranceInfo.membershipNumber}</p>
              </div>
            </div>
          </div>

          {/* Services Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Charges</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">
                      Service
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">
                      Category
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase border-b">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase border-b">
                      Unit Price (TZS)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase border-b">
                      Total (TZS)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bill.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">
                        {item.serviceName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 border-b capitalize">
                        {item.category.replace('-', ' ')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center border-b">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right border-b">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right border-b">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(bill.subtotal)}</span>
                </div>
                {bill.discount > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">-{formatCurrency(bill.discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between py-2">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(bill.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Document Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Invoice</span>
              </button>
              {bill.status === 'paid' && (
                <button
                  onClick={handleDownloadReceipt}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Receipt</span>
                </button>
              )}
            </div>

            {/* NHIF Claims Processing */}
            {patient?.insuranceInfo?.provider === 'NHIF' && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">NHIF Claims</h3>
                  <button
                    onClick={() => setShowNHIFClaims(!showNHIFClaims)}
                    className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    <Shield className="w-4 h-4" />
                    <span>{showNHIFClaims ? 'Hide' : 'Show'} Claims</span>
                  </button>
                </div>
                
                {showNHIFClaims && (
                  <NHIFClaims 
                    bill={bill} 
                    onClaimSubmitted={handleClaimSubmitted}
                  />
                )}
              </div>
            )}

            {bill.status === 'pending' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => handlePayment('cash')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Mark as Paid (Cash)</span>
                </button>
                <button
                  onClick={() => handlePayment('mobile-money')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Mark as Paid (Mobile Money)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}