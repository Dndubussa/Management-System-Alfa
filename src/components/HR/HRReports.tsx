import React, { useState, useEffect } from 'react';
import { 
  FileBarChart, 
  Download, 
  Calendar, 
  Users, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const HRReports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState<any>(null);

  const reportTypes = [
    {
      id: 'staffing-levels',
      name: 'Staffing Levels Report',
      description: 'Current staffing levels by department and role',
      icon: Users
    },
    {
      id: 'license-expiry',
      name: 'License Expiry Report',
      description: 'Staff licenses expiring within specified timeframe',
      icon: AlertTriangle
    },
    {
      id: 'attendance-summary',
      name: 'Attendance Summary',
      description: 'Staff attendance patterns and absenteeism trends',
      icon: Calendar
    },
    {
      id: 'leave-analysis',
      name: 'Leave Analysis Report',
      description: 'Leave requests, approvals, and patterns',
      icon: Clock
    },
    {
      id: 'training-participation',
      name: 'Training Participation',
      description: 'Training completion rates and participation statistics',
      icon: TrendingUp
    },
    {
      id: 'performance-trends',
      name: 'Performance Trends',
      description: 'Performance appraisal trends and ratings analysis',
      icon: FileBarChart
    },
    {
      id: 'staff-turnover',
      name: 'Staff Turnover Report',
      description: 'Staff turnover rates and retention analysis',
      icon: Users
    },
    {
      id: 'compliance-status',
      name: 'Compliance Status',
      description: 'Overall compliance status and outstanding issues',
      icon: CheckCircle
    }
  ];

  const generateReport = () => {
    if (!selectedReport) return;

    // Simulate report data generation - replace with actual API calls
    const mockData = generateMockReportData(selectedReport);
    setReportData(mockData);
  };

  const generateMockReportData = (reportType: string) => {
    switch (reportType) {
      case 'staffing-levels':
        return {
          title: 'Staffing Levels Report',
          period: `${dateRange.startDate} to ${dateRange.endDate}`,
          summary: {
            totalStaff: 156,
            activeStaff: 142,
            onLeave: 8,
            terminated: 6
          },
          byDepartment: [
            { department: 'Cardiology', total: 25, active: 23, onLeave: 2 },
            { department: 'Emergency', total: 30, active: 28, onLeave: 2 },
            { department: 'Surgery', total: 20, active: 18, onLeave: 2 },
            { department: 'Laboratory', total: 15, active: 14, onLeave: 1 },
            { department: 'Pharmacy', total: 12, active: 11, onLeave: 1 },
            { department: 'Administration', total: 20, active: 19, onLeave: 1 },
            { department: 'Nursing', total: 34, active: 29, onLeave: 5 }
          ]
        };

      case 'license-expiry':
        return {
          title: 'License Expiry Report',
          period: `Next 90 days from ${new Date().toISOString().split('T')[0]}`,
          summary: {
            totalLicenses: 142,
            expiringSoon: 8,
            expired: 3,
            valid: 131
          },
          expiringLicenses: [
            { staffName: 'Dr. Sarah Johnson', licenseType: 'Medical Council', expiryDate: '2024-02-15', daysToExpiry: 15 },
            { staffName: 'Nurse Mary Mwalimu', licenseType: 'Nursing Board', expiryDate: '2024-02-20', daysToExpiry: 20 },
            { staffName: 'Dr. Ahmed Hassan', licenseType: 'Medical Council', expiryDate: '2024-03-01', daysToExpiry: 30 }
          ]
        };

      case 'attendance-summary':
        return {
          title: 'Attendance Summary Report',
          period: `${dateRange.startDate} to ${dateRange.endDate}`,
          summary: {
            totalDays: 30,
            averageAttendance: 94.2,
            totalAbsences: 45,
            totalLateArrivals: 23
          },
          byDepartment: [
            { department: 'Cardiology', attendance: 96.5, absences: 3, late: 2 },
            { department: 'Emergency', attendance: 98.2, absences: 2, late: 1 },
            { department: 'Surgery', attendance: 95.8, absences: 5, late: 3 }
          ]
        };

      default:
        return {
          title: 'Report Data',
          period: `${dateRange.startDate} to ${dateRange.endDate}`,
          summary: { total: 100 },
          data: []
        };
    }
  };

  const exportToPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    
    // Add hospital branding
    doc.setFillColor(22, 160, 133); // Hospital green color
    doc.rect(0, 0, 210, 25, 'F'); // Header background
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ALFA SPECIALIZED HOSPITAL', 14, 12);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Excellence in Healthcare Services', 14, 18);
    doc.setTextColor(0, 0, 0); // Reset text color

    // Add report title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(reportData.title, 14, 35);
    
    // Add report period
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Period: ${reportData.period}`, 14, 45);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 52);

    // Add summary data
    let yPosition = 65;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    Object.entries(reportData.summary).forEach(([key, value]) => {
      doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`, 14, yPosition);
      yPosition += 6;
    });

    // Add detailed data if available
    if (reportData.byDepartment) {
      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('By Department', 14, yPosition);
      yPosition += 10;

      const tableData = reportData.byDepartment.map((dept: any) => [
        dept.department,
        dept.total || dept.attendance || 'N/A',
        dept.active || dept.absences || 'N/A',
        dept.onLeave || dept.late || 'N/A'
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Department', 'Total/Attendance', 'Active/Absences', 'On Leave/Late']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] }
      });
    }

    doc.save(`${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = `ALFA SPECIALIZED HOSPITAL\n`;
    csvContent += `Excellence in Healthcare Services\n\n`;
    csvContent += `${reportData.title}\n`;
    csvContent += `Report Period: ${reportData.period}\n`;
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;

    // Add summary
    csvContent += `Summary\n`;
    Object.entries(reportData.summary).forEach(([key, value]) => {
      csvContent += `${key.charAt(0).toUpperCase() + key.slice(1)},${value}\n`;
    });

    // Add detailed data
    if (reportData.byDepartment) {
      csvContent += `\nBy Department\n`;
      csvContent += `Department,Total/Attendance,Active/Absences,On Leave/Late\n`;
      reportData.byDepartment.forEach((dept: any) => {
        csvContent += `${dept.department},${dept.total || dept.attendance || 'N/A'},${dept.active || dept.absences || 'N/A'},${dept.onLeave || dept.late || 'N/A'}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">HR Reports</h1>
            <p className="text-teal-100">Generate comprehensive HR reports and analytics</p>
          </div>
        </div>
      </div>

      {/* Report Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  selectedReport === report.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-300 hover:border-teal-300 hover:bg-teal-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-6 w-6 ${
                    selectedReport === report.id ? 'text-teal-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-500">{report.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range Selection */}
      {selectedReport && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={generateReport}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FileBarChart className="h-4 w-4" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Report Results */}
      {reportData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{reportData.title}</h2>
              <p className="text-sm text-gray-500">Period: {reportData.period}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportToPDF}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(reportData.summary).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Detailed Data */}
          {reportData.byDepartment && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total/Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active/Absences
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      On Leave/Late
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.byDepartment.map((dept: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {dept.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.total || dept.attendance || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.active || dept.absences || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dept.onLeave || dept.late || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HRReports;
