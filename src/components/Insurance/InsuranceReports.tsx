import React, { useState } from 'react';
import { BarChart, PieChart, Download, Filter, Calendar } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function InsuranceReports() {
  const { insuranceClaims, patients } = useHospital();
  const [reportType, setReportType] = useState('claims-by-insurer');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Get unique insurance providers
  const insuranceProviders = Array.from(
    new Set(insuranceClaims.map(claim => claim.insuranceProvider))
  );

  // Claims by insurer data
  const claimsByInsurer = insuranceProviders.map(provider => {
    const claims = insuranceClaims.filter(c => c.insuranceProvider === provider);
    const totalAmount = claims.reduce((sum, claim) => sum + claim.claimAmount, 0);
    const approvedClaims = claims.filter(c => c.status === 'approved' || c.status === 'paid');
    const approvedAmount = approvedClaims.reduce((sum, claim) => sum + claim.claimAmount, 0);
    
    return {
      provider,
      totalClaims: claims.length,
      totalAmount,
      approvedClaims: approvedClaims.length,
      approvedAmount,
      rejectionRate: claims.length > 0 ? 
        ((claims.length - approvedClaims.length) / claims.length * 100).toFixed(1) : '0.0'
    };
  });

  // Claims status distribution
  const statusDistribution = {
    submitted: insuranceClaims.filter(c => c.status === 'submitted').length,
    approved: insuranceClaims.filter(c => c.status === 'approved').length,
    rejected: insuranceClaims.filter(c => c.status === 'rejected').length,
    paid: insuranceClaims.filter(c => c.status === 'paid').length
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleExport = (format: 'pdf' | 'csv' = 'pdf') => {
    if (format === 'pdf') {
      // Generate PDF report with hospital branding
      const doc = new jsPDF();
      
      // Add hospital header with logo and name
      doc.setFillColor(22, 160, 133); // Hospital green color
      doc.rect(0, 0, 210, 25, 'F'); // Header background
      
      // Hospital name
      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ALFA SPECIALIZED HOSPITAL', 14, 12);
      
      // Hospital tagline
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Excellence in Healthcare Services', 14, 18);
      
      // Reset text color for content
      doc.setTextColor(0, 0, 0);
      
      // Add report title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Insurance Reports & Analytics', 14, 35);
      
      // Add generated date
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 45);
      
      // Add claims summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Claims Summary', 14, 60);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Claims: ${insuranceClaims.length}`, 14, 70);
      doc.text(`Total Amount: ${formatCurrency(insuranceClaims.reduce((sum, claim) => sum + claim.claimAmount, 0))}`, 14, 78);
      
      // Add claims by insurer table
      if (claimsByInsurer.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Claims by Insurance Provider', 14, 95);
        
        const tableData = claimsByInsurer.map(insurer => [
          insurer.provider,
          insurer.totalClaims.toString(),
          formatCurrency(insurer.totalAmount),
          insurer.approvedClaims.toString(),
          formatCurrency(insurer.approvedAmount),
          `${insurer.rejectionRate}%`
        ]);
        
        autoTable(doc, {
          head: [['Provider', 'Total Claims', 'Total Amount', 'Approved Claims', 'Approved Amount', 'Rejection Rate']],
          body: tableData,
          startY: 105,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [22, 160, 133] },
          alternateRowStyles: { fillColor: [240, 240, 240] }
        });
      }
      
      // Save the PDF
      doc.save(`Insurance_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } else {
      // Generate CSV report with hospital branding
      let csvContent = `ALFA SPECIALIZED HOSPITAL\n`;
      csvContent += `Excellence in Healthcare Services\n`;
      csvContent += `Insurance Reports & Analytics\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      csvContent += `Total Claims,${insuranceClaims.length}\n`;
      csvContent += `Total Amount,${formatCurrency(insuranceClaims.reduce((sum, claim) => sum + claim.claimAmount, 0))}\n\n`;
      
      csvContent += `Provider,Total Claims,Total Amount,Approved Claims,Approved Amount,Rejection Rate\n`;
      claimsByInsurer.forEach(insurer => {
        csvContent += `"${insurer.provider}",${insurer.totalClaims},"${formatCurrency(insurer.totalAmount)}",${insurer.approvedClaims},"${formatCurrency(insurer.approvedAmount)}",${insurer.rejectionRate}%\n`;
      });
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Insurance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Insurance Reports & Analytics</h1>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
        <p className="text-gray-600 mt-1">
          Generate reports on insurance claims, payments, and analytics
        </p>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="claims-by-insurer">Claims by Insurer</option>
              <option value="payment-reconciliation">Payment Reconciliation</option>
              <option value="pending-claims">Pending Claims</option>
              <option value="claim-status-distribution">Claim Status Distribution</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Claims by Insurer Report */}
      {reportType === 'claims-by-insurer' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Claims by Insurance Provider</h2>
            <p className="text-gray-600 mt-1">Breakdown of claims by insurance provider</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Insurance Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Claims
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount (TZS)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved Claims
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved Amount (TZS)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rejection Rate (%)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claimsByInsurer.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No claims data available.
                    </td>
                  </tr>
                ) : (
                  claimsByInsurer.map((data, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{data.provider}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{data.totalClaims}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(data.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{data.approvedClaims}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(data.approvedAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{data.rejectionRate}%</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Claim Status Distribution Report */}
      {reportType === 'claim-status-distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Claim Status Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Submitted</span>
                <span className="font-medium">{statusDistribution.submitted} claims</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Approved</span>
                <span className="font-medium">{statusDistribution.approved} claims</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rejected</span>
                <span className="font-medium">{statusDistribution.rejected} claims</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Paid</span>
                <span className="font-medium">{statusDistribution.paid} claims</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Visualization</h3>
            <div className="flex items-center justify-center h-64">
              <PieChart className="w-32 h-32 text-gray-300" />
              <p className="text-gray-500 ml-4">Chart visualization would appear here</p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Claims Report */}
      {reportType === 'pending-claims' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Pending Claims</h2>
            <p className="text-gray-600 mt-1">List of claims awaiting processing</p>
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
                    Submission Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Pending
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {insuranceClaims.filter(c => c.status === 'submitted').length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No pending claims.
                    </td>
                  </tr>
                ) : (
                  insuranceClaims
                    .filter(c => c.status === 'submitted')
                    .map((claim) => {
                      const patient = patients.find(p => p.id === claim.patientId);
                      const submissionDate = new Date(claim.submissionDate);
                      const today = new Date();
                      const daysPending = Math.floor(
                        (today.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24)
                      );
                      
                      return (
                        <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{claim.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {submissionDate.toLocaleDateString('sw-TZ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              daysPending > 7 ? 'text-red-600' : 
                              daysPending > 3 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {daysPending} days
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
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold text-gray-900">{insuranceClaims.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <BarChart className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved Claims</p>
              <p className="text-2xl font-bold text-gray-900">
                {insuranceClaims.filter(c => c.status === 'approved' || c.status === 'paid').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <BarChart className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Claims</p>
              <p className="text-2xl font-bold text-gray-900">
                {insuranceClaims.filter(c => c.status === 'submitted').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  insuranceClaims.reduce((sum, claim) => sum + claim.claimAmount, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}