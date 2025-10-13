import React, { useState } from 'react';
import { BarChart, PieChart, Download, Filter, Calendar, FileText, DollarSign } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function ReportsReconciliations() {
  const { bills, patients, insuranceClaims } = useHospital();
  const [reportType, setReportType] = useState('daily-summary');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Filter paid bills
  const paidBills = bills.filter(bill => bill.status === 'paid');

  // Calculate payment method breakdown
  const cashPayments = paidBills.filter(bill => bill.paymentMethod === 'cash');
  const cardPayments = paidBills.filter(bill => bill.paymentMethod === 'card');
  const mobilePayments = paidBills.filter(bill => bill.paymentMethod === 'lipa_kwa_simu');
  const insurancePayments = paidBills.filter(bill => bill.paymentMethod === 'insurance');

  const cashTotal = cashPayments.reduce((sum, bill) => sum + bill.total, 0);
  const cardTotal = cardPayments.reduce((sum, bill) => sum + bill.total, 0);
  const mobileTotal = mobilePayments.reduce((sum, bill) => sum + bill.total, 0);
  const insuranceTotal = insurancePayments.reduce((sum, bill) => sum + bill.total, 0);

  const totalCollected = cashTotal + cardTotal + mobileTotal;

  // Calculate daily collections from real bill data
  const dailyCollections = React.useMemo(() => {
    const collections: { [key: string]: { cash: number; card: number; mobile: number; insurance: number } } = {};
    
    paidBills.forEach(bill => {
      const date = new Date(bill.createdAt).toISOString().split('T')[0];
      if (!collections[date]) {
        collections[date] = { cash: 0, card: 0, mobile: 0, insurance: 0 };
      }
      
      switch (bill.paymentMethod) {
        case 'cash':
          collections[date].cash += bill.total;
          break;
        case 'card':
          collections[date].card += bill.total;
          break;
        case 'lipa_kwa_simu':
          collections[date].mobile += bill.total;
          break;
        case 'insurance':
          collections[date].insurance += bill.total;
          break;
      }
    });
    
    // Convert to array format and sort by date
    return Object.entries(collections)
      .map(([date, amounts]) => ({ date, ...amounts }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // Show last 7 days
  }, [paidBills]);

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
      doc.text('Financial Reports & Reconciliations', 14, 35);
      
      // Add date range info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      let dateRangeText = 'All Time';
      if (dateRange.start && dateRange.end) {
        dateRangeText = `${dateRange.start} to ${dateRange.end}`;
      }
      doc.text(`Date Range: ${dateRangeText}`, 14, 45);
      
      // Add generated date
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 53);
      
      // Add financial summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Financial Summary', 14, 70);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Collections: ${formatCurrency(totalCollections)}`, 14, 80);
      doc.text(`Cash Payments: ${formatCurrency(dailyCollections.cash)}`, 14, 88);
      doc.text(`Card Payments: ${formatCurrency(dailyCollections.card)}`, 14, 96);
      doc.text(`Mobile Payments: ${formatCurrency(dailyCollections.mobile)}`, 14, 104);
      doc.text(`Insurance Payments: ${formatCurrency(dailyCollections.insurance)}`, 14, 112);
      
      // Add daily collections table
      if (Object.keys(collections).length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Daily Collections', 14, 130);
        
        const tableData = Object.entries(collections).map(([date, amounts]) => [
          date,
          formatCurrency(amounts.cash),
          formatCurrency(amounts.card),
          formatCurrency(amounts.mobile),
          formatCurrency(amounts.insurance),
          formatCurrency(amounts.cash + amounts.card + amounts.mobile + amounts.insurance)
        ]);
        
        autoTable(doc, {
          head: [['Date', 'Cash', 'Card', 'Mobile', 'Insurance', 'Total']],
          body: tableData,
          startY: 140,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [22, 160, 133] },
          alternateRowStyles: { fillColor: [240, 240, 240] }
        });
      }
      
      // Save the PDF
      doc.save(`Financial_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } else {
      // Generate CSV report with hospital branding
      let csvContent = `ALFA SPECIALIZED HOSPITAL\n`;
      csvContent += `Excellence in Healthcare Services\n`;
      csvContent += `Financial Reports & Reconciliations\n`;
      csvContent += `Date Range: ${dateRange.start && dateRange.end ? `${dateRange.start} to ${dateRange.end}` : 'All Time'}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      csvContent += `Metric,Value\n`;
      csvContent += `Total Collections,"${formatCurrency(totalCollections)}"\n`;
      csvContent += `Cash Payments,"${formatCurrency(dailyCollections.cash)}"\n`;
      csvContent += `Card Payments,"${formatCurrency(dailyCollections.card)}"\n`;
      csvContent += `Mobile Payments,"${formatCurrency(dailyCollections.mobile)}"\n`;
      csvContent += `Insurance Payments,"${formatCurrency(dailyCollections.insurance)}"\n\n`;
      
      csvContent += `Date,Cash,Card,Mobile,Insurance,Total\n`;
      Object.entries(collections).forEach(([date, amounts]) => {
        const total = amounts.cash + amounts.card + amounts.mobile + amounts.insurance;
        csvContent += `${date},"${formatCurrency(amounts.cash)}","${formatCurrency(amounts.card)}","${formatCurrency(amounts.mobile)}","${formatCurrency(amounts.insurance)}","${formatCurrency(total)}"\n`;
      });
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`);
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
          <h1 className="text-2xl font-bold text-gray-900">Reports & Reconciliations</h1>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
        <p className="text-gray-600 mt-1">
          Generate end-of-day collection summaries and reconciliation reports
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
              <option value="daily-summary">Daily Collections Summary</option>
              <option value="payment-methods">Payment Methods Breakdown</option>
              <option value="outstanding-bills">Outstanding Bills Report</option>
              <option value="insurance-claims">Insurance Claims Report</option>
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

      {/* Daily Collections Summary */}
      {reportType === 'daily-summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Daily Collections Trend</h2>
              <p className="text-gray-600 mt-1">Last 7 days collection summary</p>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <BarChart className="w-32 h-32 text-gray-300" />
                <p className="text-gray-500 ml-4">Chart visualization would appear here</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Today's Collections</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Cash</span>
                <span className="font-medium">{formatCurrency(cashTotal)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">POS/Swipe</span>
                <span className="font-medium">{formatCurrency(cardTotal)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Mobile Money</span>
                <span className="font-medium">{formatCurrency(mobileTotal)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-medium text-gray-900">Total Collected</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(totalCollected)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Breakdown */}
      {reportType === 'payment-methods' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Payment Methods Distribution</h2>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-center h-64">
                <PieChart className="w-32 h-32 text-gray-300" />
                <p className="text-gray-500 ml-4">Chart visualization would appear here</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Payment Method Details</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Cash</span>
                </div>
                <span className="font-medium">{formatCurrency(cashTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">POS/Swipe</span>
                </div>
                <span className="font-medium">{formatCurrency(cardTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Mobile Money</span>
                </div>
                <span className="font-medium">{formatCurrency(mobileTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Insurance</span>
                </div>
                <span className="font-medium">{formatCurrency(insuranceTotal)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="text-lg font-medium text-gray-900">Total</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(totalCollected + insuranceTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outstanding Bills Report */}
      {reportType === 'outstanding-bills' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Outstanding Bills Report</h2>
            <p className="text-gray-600 mt-1">Pending patient payments</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MRN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill ID
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bills.filter(b => b.status === 'pending').length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No outstanding bills.
                    </td>
                  </tr>
                ) : (
                  bills
                    .filter(bill => bill.status === 'pending')
                    .map((bill) => {
                      const patient = patients.find(p => p.id === bill.patientId);
                      const createdDate = new Date(bill.createdAt);
                      const today = new Date();
                      const daysOutstanding = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {patient ? patient.mrn : 'Unknown MRN'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">#{bill.id}</div>
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
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insurance Claims Report */}
      {reportType === 'insurance-claims' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Insurance Claims Report</h2>
            <p className="text-gray-600 mt-1">Claims forwarded to Insurance Officer</p>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {insuranceClaims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No insurance claims.
                    </td>
                  </tr>
                ) : (
                  insuranceClaims.map((claim) => {
                    const patient = patients.find(p => p.id === claim.patientId);
                    
                    // Simple status color function
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(claim.status)}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(claim.submissionDate)}
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
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Collected</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCollected)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Bills</p>
              <p className="text-2xl font-bold text-gray-900">{bills.filter(b => b.status === 'pending').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Insurance Claims</p>
              <p className="text-2xl font-bold text-gray-900">{insuranceClaims.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}