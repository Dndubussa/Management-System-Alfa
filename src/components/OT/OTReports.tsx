import { useState } from 'react';
import { FileText, Calendar, Download, BarChart3, PieChart, TrendingUp, Filter, Scissors } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function OTReports() {
  const { otReports, surgeryRequests } = useHospital();
  const { user } = useAuth();
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState('last-30-days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Mock report data
  const reportData = {
    totalSurgeries: surgeryRequests.filter(req => req.status === 'completed').length,
    emergencySurgeries: surgeryRequests.filter(req => req.urgency === 'emergency' && req.status === 'completed').length,
    electiveSurgeries: surgeryRequests.filter(req => req.urgency !== 'emergency' && req.status === 'completed').length,
    cancelledSurgeries: surgeryRequests.filter(req => req.status === 'cancelled').length,
    postponedSurgeries: surgeryRequests.filter(req => req.status === 'postponed').length,
  };

  const reportTypes = [
    { id: 'daily', name: 'Daily OT Report', icon: FileText },
    { id: 'weekly', name: 'Weekly OT Report', icon: FileText },
    { id: 'monthly', name: 'Monthly OT Report', icon: FileText },
    { id: 'surgery-summary', name: 'Surgery Summary', icon: FileText },
    { id: 'utilization', name: 'OT Utilization', icon: BarChart3 },
    { id: 'complications', name: 'Complications Report', icon: FileText },
  ];

  const dateRanges = [
    { id: 'today', name: 'Today' },
    { id: 'last-7-days', name: 'Last 7 Days' },
    { id: 'last-30-days', name: 'Last 30 Days' },
    { id: 'last-90-days', name: 'Last 90 Days' },
    { id: 'custom', name: 'Custom Range' },
  ];

  const generateReport = () => {
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
    const reportTitle = reportTypes.find(r => r.id === reportType)?.name || 'OT Report';
    doc.text(reportTitle, 14, 35);
    
    // Add date range info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    let dateRangeText = dateRanges.find(r => r.id === dateRange)?.name || 'All Time';
    doc.text(`Date Range: ${dateRangeText}`, 14, 45);
    
    // Add generated date
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 53);
    
    // Add OT statistics
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Operating Theatre Statistics', 14, 70);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Surgeries: ${reportData.totalSurgeries}`, 14, 80);
    doc.text(`Emergency Surgeries: ${reportData.emergencySurgeries}`, 14, 88);
    doc.text(`Elective Surgeries: ${reportData.electiveSurgeries}`, 14, 96);
    doc.text(`Cancelled Surgeries: ${reportData.cancelledSurgeries}`, 14, 104);
    doc.text(`Postponed Surgeries: ${reportData.postponedSurgeries}`, 14, 112);
    
    // Save the PDF
    doc.save(`OT_${reportType}_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const downloadReport = (format: 'pdf' | 'csv') => {
    if (format === 'pdf') {
      generateReport();
    } else {
      // Generate CSV report with hospital branding
      let csvContent = `ALFA SPECIALIZED HOSPITAL\n`;
      csvContent += `Excellence in Healthcare Services\n`;
      csvContent += `${reportTypes.find(r => r.id === reportType)?.name || 'OT Report'}\n`;
      csvContent += `Date Range: ${dateRanges.find(r => r.id === dateRange)?.name || 'All Time'}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      csvContent += `Metric,Value\n`;
      csvContent += `Total Surgeries,${reportData.totalSurgeries}\n`;
      csvContent += `Emergency Surgeries,${reportData.emergencySurgeries}\n`;
      csvContent += `Elective Surgeries,${reportData.electiveSurgeries}\n`;
      csvContent += `Cancelled Surgeries,${reportData.cancelledSurgeries}\n`;
      csvContent += `Postponed Surgeries,${reportData.postponedSurgeries}\n`;
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `OT_${reportType}_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">OT Reports & Logs</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Scissors className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Surgeries</p>
              <p className="text-xl font-semibold text-gray-900">{reportData.totalSurgeries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Emergency</p>
              <p className="text-xl font-semibold text-gray-900">{reportData.emergencySurgeries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Elective</p>
              <p className="text-xl font-semibold text-gray-900">{reportData.electiveSurgeries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-xl font-semibold text-gray-900">{reportData.cancelledSurgeries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Postponed</p>
              <p className="text-xl font-semibold text-gray-900">{reportData.postponedSurgeries}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Generator */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Generate Report</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.id}
                        className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                          reportType === type.id
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => setReportType(type.id)}
                      >
                        <Icon className="w-5 h-5 text-green-600 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{type.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {dateRanges.map((range) => (
                    <div
                      key={range.id}
                      className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                        dateRange === range.id
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => setDateRange(range.id)}
                    >
                      <Calendar className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{range.name}</span>
                    </div>
                  ))}
                </div>
                
                {dateRange === 'custom' && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={generateReport}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Generate Report
                  </button>
                  <button
                    onClick={() => downloadReport('csv')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                  </button>
                  <button
                    onClick={() => downloadReport('pdf')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h2>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Daily OT Report</h3>
                    <p className="text-sm text-gray-500">Generated on Oct 5, 2025</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-800">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Weekly OT Utilization</h3>
                    <p className="text-sm text-gray-500">Generated on Oct 1, 2025</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-800">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Surgery Summary Report</h3>
                    <p className="text-sm text-gray-500">Generated on Sep 30, 2025</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-800">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Monthly Complications Report</h3>
                    <p className="text-sm text-gray-500">Generated on Sep 25, 2025</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-800">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">OT Performance Metrics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Surgery Types Distribution</h3>
            <div className="flex items-center justify-center h-64">
              <PieChart className="w-16 h-16 text-gray-300" />
              <p className="text-gray-500 ml-3">Chart visualization would appear here</p>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Monthly Surgery Trends</h3>
            <div className="flex items-center justify-center h-64">
              <BarChart3 className="w-16 h-16 text-gray-300" />
              <p className="text-gray-500 ml-3">Chart visualization would appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}