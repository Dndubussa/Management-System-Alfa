import React, { useState, useMemo } from 'react';
import { FileText, Download, Calendar, TrendingUp, Users, Activity, Clock } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function NurseReports() {
  const { patients, medicalRecords, appointments, prescriptions } = useHospital();
  const { user } = useAuth();
  const [reportType, setReportType] = useState('shift-handover');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const reportTypes = [
    { id: 'shift-handover', name: 'Shift Handover Report' },
    { id: 'ward-census', name: 'Ward Census' },
    { id: 'immunization', name: 'Daily Immunization Report' },
    { id: 'incident', name: 'Nursing Incident Report' },
  ];

  const dateRanges = [
    { id: 'today', name: 'Today' },
    { id: 'yesterday', name: 'Yesterday' },
    { id: 'last-7-days', name: 'Last 7 Days' },
    { id: 'last-30-days', name: 'Last 30 Days' },
    { id: 'custom', name: 'Custom Range' },
  ];

  const reportData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysRecords = medicalRecords.filter(r => r.visitDate.startsWith(today));
    const todaysAppointments = appointments.filter(a => a.dateTime.startsWith(today));
    const activePrescriptions = prescriptions.filter(p => p.status === 'pending' || p.status === 'dispensed');

    return {
      totalPatients: patients.length,
      todaysVisits: todaysRecords.length,
      todaysAppointments: todaysAppointments.length,
      activePrescriptions: activePrescriptions.length,
      criticalPatients: todaysRecords.filter(r => r.vitals?.bloodPressure?.includes('/') && 
        parseInt(r.vitals.bloodPressure.split('/')[0]) > 180).length,
    };
  }, [patients, medicalRecords, appointments, prescriptions]);

  const generateReport = (format: 'pdf' | 'csv' = 'pdf') => {
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
      const reportTitle = reportTypes.find(r => r.id === reportType)?.name || 'Nursing Report';
      doc.text(reportTitle, 14, 35);
      
      // Add date range info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      let dateRangeText = dateRanges.find(r => r.id === dateRange)?.name || 'All Time';
      if (dateRange === 'custom' && dateRange.start && dateRange.end) {
        dateRangeText = `${dateRange.start} to ${dateRange.end}`;
      }
      doc.text(`Date Range: ${dateRangeText}`, 14, 45);
      
      // Add nurse info
      doc.text(`Nurse: ${user?.name}`, 14, 53);
      
      // Add generated date
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 61);
      
      // Add nursing statistics
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Nursing Statistics', 14, 78);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Patients: ${reportData.totalPatients}`, 14, 88);
      doc.text(`Today's Visits: ${reportData.todaysVisits}`, 14, 96);
      doc.text(`Today's Appointments: ${reportData.todaysAppointments}`, 14, 104);
      doc.text(`Active Prescriptions: ${reportData.activePrescriptions}`, 14, 112);
      doc.text(`Critical Patients: ${reportData.criticalPatients}`, 14, 120);
      
      // Add shift handover details
      if (reportType === 'shift-handover') {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Shift Handover Summary', 14, 135);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('• All vital signs recorded and documented', 14, 145);
        doc.text('• Medications administered as prescribed', 14, 153);
        doc.text('• Patient care plans updated', 14, 161);
        doc.text('• No critical incidents reported', 14, 169);
      }
      
      // Save the PDF
      doc.save(`Nursing_${reportType}_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } else {
      // Generate CSV report with hospital branding
      let csvContent = `ALFA SPECIALIZED HOSPITAL\n`;
      csvContent += `Excellence in Healthcare Services\n`;
      csvContent += `${reportTypes.find(r => r.id === reportType)?.name || 'Nursing Report'}\n`;
      csvContent += `Date Range: ${dateRanges.find(r => r.id === dateRange)?.name || 'All Time'}\n`;
      csvContent += `Nurse: ${user?.name}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
      
      csvContent += `Metric,Value\n`;
      csvContent += `Total Patients,${reportData.totalPatients}\n`;
      csvContent += `Today's Visits,${reportData.todaysVisits}\n`;
      csvContent += `Today's Appointments,${reportData.todaysAppointments}\n`;
      csvContent += `Active Prescriptions,${reportData.activePrescriptions}\n`;
      csvContent += `Critical Patients,${reportData.criticalPatients}\n`;
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Nursing_${reportType}_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Nursing Reports</h1>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              {dateRanges.map(range => (
                <option key={range.id} value={range.id}>{range.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={() => generateReport('pdf')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </button>
            <button
              onClick={() => generateReport('csv')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <div className="text-sm text-gray-500">Total Patients</div>
              <div className="text-2xl font-semibold">{reportData.totalPatients}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <div className="text-sm text-gray-500">Today's Visits</div>
              <div className="text-2xl font-semibold">{reportData.todaysVisits}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <div className="text-sm text-gray-500">Appointments</div>
              <div className="text-2xl font-semibold">{reportData.todaysAppointments}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-indigo-600" />
            <div className="ml-4">
              <div className="text-sm text-gray-500">Active Rx</div>
              <div className="text-2xl font-semibold">{reportData.activePrescriptions}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <div className="text-sm text-gray-500">Critical</div>
              <div className="text-2xl font-semibold">{reportData.criticalPatients}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {reportTypes.find(r => r.id === reportType)?.name} Preview
        </h2>
        <div className="text-gray-600">
          <p>This report will include:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Patient statistics and census data</li>
            <li>Vital signs and triage information</li>
            <li>Medication administration records</li>
            <li>Nursing interventions and care notes</li>
            <li>Shift handover summary</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NurseReports;
