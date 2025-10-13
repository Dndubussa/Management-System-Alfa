import React, { useState, useMemo } from 'react';
import { BarChart3, FileText, Calendar, Search, Filter, Download, Eye, TrendingUp, User, Activity, Clock } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function PTReports() {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const { patients, medicalRecords, appointments, bills } = useHospital();

  // Calculate real data from Supabase
  const summaryData = useMemo(() => {
    // Filter medical records for physical therapy related treatments
    const ptRecords = medicalRecords.filter(record => 
      record.treatment.toLowerCase().includes('physiotherapy') ||
      record.treatment.toLowerCase().includes('hydrotherapy') ||
      record.treatment.toLowerCase().includes('electrotherapy') ||
      record.treatment.toLowerCase().includes('manual therapy') ||
      record.treatment.toLowerCase().includes('exercise therapy') ||
      record.diagnosis.toLowerCase().includes('physical therapy')
    );

    // Get unique patients who have had PT treatments
    const ptPatients = [...new Set(ptRecords.map(record => record.patientId))];
    
    // Calculate completed sessions (appointments with PT-related services)
    const ptAppointments = appointments.filter(apt => 
      apt.type.toLowerCase().includes('physiotherapy') ||
      apt.type.toLowerCase().includes('therapy')
    );
    
    // Calculate success rate based on completed treatments
    const completedTreatments = ptRecords.filter(record => record.status === 'completed');
    const successRate = ptRecords.length > 0 ? Math.round((completedTreatments.length / ptRecords.length) * 100) : 0;

    return {
      totalPatients: ptPatients.length,
      activeTherapyCases: ptRecords.filter(record => record.status === 'active').length,
      completedSessions: ptAppointments.filter(apt => apt.status === 'completed').length,
      successRate,
      avgSessionDuration: 45 // Default value since we don't track session duration yet
    };
  }, [patients, medicalRecords, appointments]);

  const therapyTypesData = useMemo(() => {
    const ptRecords = medicalRecords.filter(record => 
      record.treatment.toLowerCase().includes('physiotherapy') ||
      record.treatment.toLowerCase().includes('hydrotherapy') ||
      record.treatment.toLowerCase().includes('electrotherapy') ||
      record.treatment.toLowerCase().includes('manual therapy') ||
      record.treatment.toLowerCase().includes('exercise therapy')
    );

    const types = {
      'Physiotherapy': 0,
      'Hydrotherapy': 0,
      'Electrotherapy': 0,
      'Manual Therapy': 0,
      'Exercise Therapy': 0
    };

    ptRecords.forEach(record => {
      const treatment = record.treatment.toLowerCase();
      if (treatment.includes('physiotherapy')) types['Physiotherapy']++;
      else if (treatment.includes('hydrotherapy')) types['Hydrotherapy']++;
      else if (treatment.includes('electrotherapy')) types['Electrotherapy']++;
      else if (treatment.includes('manual therapy')) types['Manual Therapy']++;
      else if (treatment.includes('exercise therapy')) types['Exercise Therapy']++;
    });

    const total = Object.values(types).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(types).map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    })).filter(item => item.count > 0);
  }, [medicalRecords]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sw-TZ');
  };

  const exportReport = (format: 'pdf' | 'csv' = 'pdf') => {
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
      doc.text('Physical Therapy Outcomes & Reports', 14, 35);
      
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
      
      // Add PT statistics
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Physical Therapy Statistics', 14, 70);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Patients: ${summaryData.totalPatients}`, 14, 80);
      doc.text(`Active Therapy Cases: ${summaryData.activeTherapyCases}`, 14, 88);
      doc.text(`Completed Sessions: ${summaryData.completedSessions}`, 14, 96);
      doc.text(`Success Rate: ${summaryData.successRate}%`, 14, 104);
      doc.text(`Average Session Duration: ${summaryData.avgSessionDuration} minutes`, 14, 112);
      
      // Add therapy types distribution
      if (therapyTypesData.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Therapy Types Distribution', 14, 130);
        
        const tableData = therapyTypesData.map(type => [
          type.type,
          type.count.toString(),
          `${type.percentage}%`
        ]);
        
        autoTable(doc, {
          head: [['Therapy Type', 'Count', 'Percentage']],
          body: tableData,
          startY: 140,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [22, 160, 133] },
          alternateRowStyles: { fillColor: [240, 240, 240] }
        });
      }
      
      // Save the PDF
      doc.save(`PT_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } else {
      // Generate CSV report with hospital branding
      let csvContent = `ALFA SPECIALIZED HOSPITAL\n`;
      csvContent += `Excellence in Healthcare Services\n`;
      csvContent += `Physical Therapy Outcomes & Reports\n`;
      csvContent += `Date Range: ${dateRange.start && dateRange.end ? `${dateRange.start} to ${dateRange.end}` : 'All Time'}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      csvContent += `Metric,Value\n`;
      csvContent += `Total Patients,${summaryData.totalPatients}\n`;
      csvContent += `Active Therapy Cases,${summaryData.activeTherapyCases}\n`;
      csvContent += `Completed Sessions,${summaryData.completedSessions}\n`;
      csvContent += `Success Rate,${summaryData.successRate}%\n`;
      csvContent += `Average Session Duration,${summaryData.avgSessionDuration} minutes\n\n`;
      
      csvContent += `Therapy Type,Count,Percentage\n`;
      therapyTypesData.forEach(type => {
        csvContent += `"${type.type}",${type.count},${type.percentage}%\n`;
      });
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `PT_Report_${new Date().toISOString().slice(0, 10)}.csv`);
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
        <h1 className="text-2xl font-bold text-gray-900">Outcomes & Reports</h1>
        <p className="text-gray-600 mt-1">
          View therapy outcomes, generate reports, and analyze performance metrics
        </p>
      </div>

      {/* Report Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="summary">Summary Report</option>
              <option value="detailed">Detailed Report</option>
              <option value="outcomes">Outcomes Report</option>
              <option value="billing">Billing Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={() => {
                setDateRange({ start: '', end: '' });
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear
            </button>
            <button
              onClick={exportReport}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{summaryData.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Cases</p>
              <p className="text-2xl font-bold text-gray-900">{summaryData.activeTherapyCases}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{summaryData.completedSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{summaryData.successRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Duration</p>
              <p className="text-2xl font-bold text-gray-900">{summaryData.avgSessionDuration} min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Therapy Types Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Therapy Types Distribution</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {therapyTypesData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.type}</span>
                  <span className="text-gray-500">{item.count} sessions ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Outcomes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Patient Outcomes</h3>
        </div>
        <div className="overflow-x-auto">
          {(() => {
            const ptRecords = medicalRecords.filter(record => 
              record.treatment.toLowerCase().includes('physiotherapy') ||
              record.treatment.toLowerCase().includes('hydrotherapy') ||
              record.treatment.toLowerCase().includes('electrotherapy') ||
              record.treatment.toLowerCase().includes('manual therapy') ||
              record.treatment.toLowerCase().includes('exercise therapy')
            ).slice(0, 10); // Show latest 10 records

            if (ptRecords.length === 0) {
              return (
                <div className="p-12 text-center">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Physical Therapy Records</h3>
                  <p className="text-gray-500">No physical therapy treatments have been recorded yet.</p>
                </div>
              );
            }

            return (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Therapy Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnosis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ptRecords.map((record) => {
                    const patient = patients.find(p => p.id === record.patientId);
                    const therapyType = record.treatment.toLowerCase().includes('physiotherapy') ? 'Physiotherapy' :
                                      record.treatment.toLowerCase().includes('hydrotherapy') ? 'Hydrotherapy' :
                                      record.treatment.toLowerCase().includes('electrotherapy') ? 'Electrotherapy' :
                                      record.treatment.toLowerCase().includes('manual therapy') ? 'Manual Therapy' :
                                      record.treatment.toLowerCase().includes('exercise therapy') ? 'Exercise Therapy' : 'Physical Therapy';
                    
                    return (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                          </div>
                          <div className="text-sm text-gray-500">MRN: {patient?.mrn || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{therapyType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(record.visitDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{record.diagnosis}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            record.status === 'completed' ? 'bg-green-100 text-green-800' :
                            record.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            );
          })()}
        </div>
      </div>

      {/* Exportable Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Exportable Reports</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="ml-2 font-medium text-gray-900">Monthly Summary</h4>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Overview of therapy sessions, patient outcomes, and performance metrics.
              </p>
              <button
                onClick={() => alert('Downloading Monthly Summary Report')}
                className="mt-3 flex items-center text-sm text-green-600 hover:text-green-800"
              >
                <Download className="w-4 h-4 mr-1" />
                Download PDF
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <h4 className="ml-2 font-medium text-gray-900">Insurance Claims</h4>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Detailed report of therapy sessions for insurance reimbursement.
              </p>
              <button
                onClick={() => alert('Downloading Insurance Claims Report')}
                className="mt-3 flex items-center text-sm text-green-600 hover:text-green-800"
              >
                <Download className="w-4 h-4 mr-1" />
                Download PDF
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h4 className="ml-2 font-medium text-gray-900">Performance Metrics</h4>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Analysis of therapy effectiveness, patient satisfaction, and staff performance.
              </p>
              <button
                onClick={() => alert('Downloading Performance Metrics Report')}
                className="mt-3 flex items-center text-sm text-green-600 hover:text-green-800"
              >
                <Download className="w-4 h-4 mr-1" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}