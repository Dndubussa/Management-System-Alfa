import { useState, useEffect } from 'react';
import { FileText, Calendar, Download, BarChart3, PieChart, TrendingUp, Eye, Printer } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Patient, MedicalRecord, Prescription, LabOrder, Appointment, Bill } from '../../types';

interface RecentReport {
  id: number;
  title: string;
  date: string;
  type: string;
}

interface ReportData {
  title: string;
  data: (Patient | MedicalRecord | Prescription | LabOrder | Appointment | Bill)[];
  columns: string[];
}

interface FinancialBill extends Bill {
  id: string;
  patientId: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
}

export function ReportsDashboard() {
  const { patients, medicalRecords, prescriptions, labOrders, appointments, bills, users } = useHospital();
  const { user } = useAuth();
  const [reportType, setReportType] = useState('visit-summary');
  const [dateRange, setDateRange] = useState('last-30-days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [viewingReport, setViewingReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set default dates for custom range
  useEffect(() => {
    if (dateRange === 'custom' && !customStartDate && !customEndDate) {
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(today.getMonth() - 1);
      
      setCustomStartDate(lastMonth.toISOString().split('T')[0]);
      setCustomEndDate(today.toISOString().split('T')[0]);
    }
  }, [dateRange, customStartDate, customEndDate]);

  // Mock report data
  const reportData = {
    totalPatients: patients.length,
    totalAppointments: appointments.length,
    totalRecords: medicalRecords.length,
    totalPrescriptions: prescriptions.length,
    totalLabOrders: labOrders.length,
    totalBills: bills.length,
  };

  const reportTypes = [
    { id: 'visit-summary', name: 'Visit Summaries', icon: FileText },
    { id: 'progress-notes', name: 'Progress Notes', icon: FileText },
    { id: 'lab-results', name: 'Lab Results Reports', icon: FileText },
    { id: 'prescription', name: 'Prescription Reports', icon: FileText },
    { id: 'chronic-disease', name: 'Chronic Disease Reports', icon: FileText },
    { id: 'financial', name: 'Financial Reports', icon: FileText },
    { id: 'patient-list', name: 'Patient List', icon: FileText },
    { id: 'doctor-activity', name: 'Doctor Activity Report', icon: FileText },
  ];

  const dateRanges = [
    { id: 'today', name: 'Today' },
    { id: 'last-7-days', name: 'Last 7 Days' },
    { id: 'last-30-days', name: 'Last 30 Days' },
    { id: 'last-90-days', name: 'Last 90 Days' },
    { id: 'custom', name: 'Custom Range' },
  ];

  // Filter data based on date range
  const filterDataByDateRange = <T,>(data: T[], dateField: string): T[] => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (dateRange === 'custom' && customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
    } else {
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'last-7-days':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'last-30-days':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'last-90-days':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          return data;
      }
    }

    return data.filter(item => {
      const itemWithDate = item as {[key: string]: string | number | Date};
      const itemDate = new Date(itemWithDate[dateField] as string);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Filter data for current doctor only
  const filterDataForDoctor = <T,>(data: T[]): T[] => {
    if (user?.role === 'doctor' || user?.role === 'ophthalmologist') {
      return data.filter(item => {
        const itemWithDoctor = item as {doctorId?: string};
        return itemWithDoctor.doctorId === user.id;
      });
    }
    return data;
  };

  // Generate report data based on report type
  const generateReportData = (): ReportData => {
    let filteredData: any[] = [];
    
    switch (reportType) {
      case 'visit-summary':
        filteredData = filterDataForDoctor(medicalRecords);
        filteredData = filterDataByDateRange<MedicalRecord>(filteredData, 'visitDate');
        return {
          title: 'Visit Summary Report',
          data: filteredData,
          columns: ['Patient ID', 'Doctor', 'Visit Date', 'Diagnosis', 'Treatment']
        };
      case 'patient-list':
        filteredData = filterDataByDateRange<Patient>(patients, 'createdAt');
        return {
          title: 'Patient List Report',
          data: filteredData,
          columns: ['Patient ID', 'Name', 'Date of Birth', 'Gender', 'Phone']
        };
      case 'prescription':
        filteredData = filterDataForDoctor(prescriptions);
        filteredData = filterDataByDateRange<Prescription>(filteredData, 'createdAt');
        return {
          title: 'Prescription Report',
          data: filteredData,
          columns: ['Prescription ID', 'Patient', 'Medication', 'Dosage', 'Frequency', 'Status']
        };
      case 'lab-results':
        filteredData = filterDataForDoctor(labOrders);
        filteredData = filterDataByDateRange<LabOrder>(filteredData, 'createdAt');
        return {
          title: 'Lab Results Report',
          data: filteredData,
          columns: ['Lab Order ID', 'Patient', 'Test Name', 'Status', 'Results']
        };
      case 'financial':
        filteredData = filterDataByDateRange<FinancialBill>(bills as FinancialBill[], 'createdAt');
        return {
          title: 'Financial Report',
          data: filteredData,
          columns: ['Bill ID', 'Patient', 'Subtotal', 'Tax', 'Total', 'Status']
        };
      case 'doctor-activity':
        // Filter appointments for the current doctor
        filteredData = appointments.filter(apt => apt.doctorId === user?.id);
        filteredData = filterDataByDateRange<Appointment>(filteredData, 'dateTime');
        return {
          title: 'Doctor Activity Report',
          data: filteredData,
          columns: ['Appointment ID', 'Patient', 'Date & Time', 'Type', 'Status']
        };
      default:
        return {
          title: 'Report',
          data: [],
          columns: []
        };
    }
  };

  // Generate and download PDF report
  const generatePDFReport = () => {
    setIsLoading(true);
    setTimeout(() => {
      const report = generateReportData();
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
      doc.text(report.title, 14, 35);
      
      // Add date range info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      let dateRangeText = dateRanges.find(r => r.id === dateRange)?.name || 'All Time';
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        dateRangeText = `${customStartDate} to ${customEndDate}`;
      }
      doc.text(`Date Range: ${dateRangeText}`, 14, 45);
      
      // Add doctor info if applicable
      if (user?.role === 'doctor' || user?.role === 'ophthalmologist') {
        doc.text(`Doctor: ${user.name}`, 14, 53);
      }
      
      // Add generated date
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 61);
      
      // Add table if there's data
      if (report.data.length > 0) {
        const tableData = report.data.map((item) => {
          if (reportType === 'visit-summary' && 'visitDate' in item) {
            const record = item as MedicalRecord;
            const doctor = users.find(u => u.id === record.doctorId);
            const patient = patients.find(p => p.id === record.patientId);
            return [
              record.patientId,
              doctor ? doctor.name : 'Unknown Doctor',
              new Date(record.visitDate).toLocaleDateString(),
              record.diagnosis,
              record.treatment
            ];
          } else if (reportType === 'patient-list' && 'firstName' in item) {
            const patient = item as Patient;
            return [
              patient.id,
              `${patient.firstName} ${patient.lastName}`,
              new Date(patient.dateOfBirth).toLocaleDateString(),
              patient.gender,
              patient.phone
            ];
          } else if (reportType === 'prescription' && 'medication' in item) {
            const prescription = item as Prescription;
            const patient = patients.find(p => p.id === prescription.patientId);
            return [
              prescription.id,
              patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
              prescription.medication,
              prescription.dosage,
              prescription.frequency,
              prescription.status
            ];
          } else if (reportType === 'lab-results' && 'testName' in item) {
            const labOrder = item as LabOrder;
            const patient = patients.find(p => p.id === labOrder.patientId);
            return [
              labOrder.id,
              patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
              labOrder.testName,
              labOrder.status,
              labOrder.results || 'Pending'
            ];
          } else if (reportType === 'financial' && 'subtotal' in item) {
            const bill = item as FinancialBill;
            const patient = patients.find(p => p.id === bill.patientId);
            return [
              bill.id,
              patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
              bill.subtotal.toFixed(2),
              bill.tax.toFixed(2),
              bill.total.toFixed(2),
              bill.status
            ];
          } else if (reportType === 'doctor-activity' && 'dateTime' in item) {
            const appointment = item as Appointment;
            const patient = patients.find(p => p.id === appointment.patientId);
            return [
              appointment.id,
              patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient',
              new Date(appointment.dateTime).toLocaleString(),
              appointment.type,
              appointment.status
            ];
          } else {
            return Object.values(item).map(String);
          }
        });
        
        autoTable(doc, {
          head: [report.columns],
          body: tableData,
          startY: 70, // Moved down to accommodate header
          styles: { fontSize: 8 },
          headStyles: { fillColor: [22, 160, 133] },
          alternateRowStyles: { fillColor: [240, 240, 240] }
        });
      } else {
        doc.setFontSize(12);
        doc.text('No data available for the selected report and date range.', 14, 60);
      }
      
      // Save the PDF
      doc.save(`${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      // Add to recent reports
      const newReport: RecentReport = {
        id: Date.now(),
        title: report.title,
        date: new Date().toISOString(),
        type: reportType
      };
      
      setRecentReports(prev => [newReport, ...prev.slice(0, 4)]);
      setIsLoading(false);
    }, 500);
  };

  // Generate and download CSV report
  const generateCSVReport = () => {
    setIsLoading(true);
    setTimeout(() => {
      const report = generateReportData();
      
      // Create CSV content with hospital header
      let csvContent = `ALFA SPECIALIZED HOSPITAL\n`;
      csvContent += `Excellence in Healthcare Services\n`;
      csvContent += `${report.title}\n`;
      
      // Add date range info
      let dateRangeText = dateRanges.find(r => r.id === dateRange)?.name || 'All Time';
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        dateRangeText = `${customStartDate} to ${customEndDate}`;
      }
      csvContent += `Date Range: ${dateRangeText}\n`;
      
      // Add doctor info if applicable
      if (user?.role === 'doctor' || user?.role === 'ophthalmologist') {
        csvContent += `Doctor: ${user.name}\n`;
      }
      
      // Add generated date
      csvContent += `Generated: ${new Date().toLocaleString()}\n`;
      csvContent += `\n`; // Empty line before data
      
      // Add column headers
      csvContent += `${report.columns.join(',')}\n`;
      
      if (report.data.length > 0) {
        const csvRows = report.data.map((item) => {
          if (reportType === 'visit-summary' && 'visitDate' in item) {
            const record = item as MedicalRecord;
            const doctor = users.find(u => u.id === record.doctorId);
            const patient = patients.find(p => p.id === record.patientId);
            return [
              record.patientId,
              doctor ? `"${doctor.name}"` : 'Unknown Doctor',
              `"${new Date(record.visitDate).toISOString().split('T')[0]}"`,
              `"${record.diagnosis}"`,
              `"${record.treatment}"`
            ].join(',');
          } else if (reportType === 'patient-list' && 'firstName' in item) {
            const patient = item as Patient;
            return [
              patient.id,
              `"${patient.firstName} ${patient.lastName}"`,
              `"${new Date(patient.dateOfBirth).toISOString().split('T')[0]}"`,
              patient.gender,
              patient.phone
            ].join(',');
          } else if (reportType === 'prescription' && 'medication' in item) {
            const prescription = item as Prescription;
            const patient = patients.find(p => p.id === prescription.patientId);
            return [
              prescription.id,
              patient ? `"${patient.firstName} ${patient.lastName}"` : 'Unknown Patient',
              `"${prescription.medication}"`,
              prescription.dosage,
              prescription.frequency,
              prescription.status
            ].join(',');
          } else if (reportType === 'lab-results' && 'testName' in item) {
            const labOrder = item as LabOrder;
            const patient = patients.find(p => p.id === labOrder.patientId);
            return [
              labOrder.id,
              patient ? `"${patient.firstName} ${patient.lastName}"` : 'Unknown Patient',
              `"${labOrder.testName}"`,
              labOrder.status,
              `"${labOrder.results || 'Pending'}"`
            ].join(',');
          } else if (reportType === 'financial' && 'subtotal' in item) {
            const bill = item as FinancialBill;
            const patient = patients.find(p => p.id === bill.patientId);
            return [
              bill.id,
              patient ? `"${patient.firstName} ${patient.lastName}"` : 'Unknown Patient',
              bill.subtotal.toFixed(2),
              bill.tax.toFixed(2),
              bill.total.toFixed(2),
              bill.status
            ].join(',');
          } else if (reportType === 'doctor-activity' && 'dateTime' in item) {
            const appointment = item as Appointment;
            const patient = patients.find(p => p.id === appointment.patientId);
            return [
              appointment.id,
              patient ? `"${patient.firstName} ${patient.lastName}"` : 'Unknown Patient',
              `"${new Date(appointment.dateTime).toISOString()}"`,
              appointment.type,
              appointment.status
            ].join(',');
          } else {
            return Object.values(item).map(val => `"${String(val)}"`).join(',');
          }
        });
        
        csvContent += csvRows.join('\n');
      }
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Add to recent reports
      const newReport: RecentReport = {
        id: Date.now(),
        title: report.title,
        date: new Date().toISOString(),
        type: reportType
      };
      
      setRecentReports(prev => [newReport, ...prev.slice(0, 4)]);
      setIsLoading(false);
    }, 500);
  };

  // View report in browser
  const viewReport = () => {
    setIsLoading(true);
    setTimeout(() => {
      const report = generateReportData();
      setViewingReport(report);
      setIsLoading(false);
    }, 500);
  };

  // Close report view
  const closeReportView = () => {
    setViewingReport(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Print report
  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      </div>

      {viewingReport ? (
        // Report Viewer
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Hospital Header */}
          <div className="bg-green-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">ALFA SPECIALIZED HOSPITAL</h1>
                <p className="text-green-100 text-sm">Excellence in Healthcare Services</p>
              </div>
              <div className="text-right text-sm">
                <p>Generated: {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium text-gray-900">{viewingReport.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {dateRange === 'custom' && customStartDate && customEndDate
                  ? `Date Range: ${customStartDate} to ${customEndDate}`
                  : `Date Range: ${dateRanges.find(r => r.id === dateRange)?.name || 'All Time'}`}
                {user?.role === 'doctor' || user?.role === 'ophthalmologist' ? ` • Doctor: ${user.name}` : ''}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={printReport}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                title="Print Report"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={closeReportView}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {viewingReport.columns.map((column, index) => (
                      <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {viewingReport.data.length > 0 ? (
                    viewingReport.data.map((item, index) => {
                      if (reportType === 'visit-summary' && 'visitDate' in item) {
                        const record = item as MedicalRecord;
                        const doctor = users.find(u => u.id === record.doctorId);
                        const patient = patients.find(p => p.id === record.patientId);
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.patientId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor ? doctor.name : 'Unknown Doctor'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(record.visitDate)}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{record.diagnosis}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{record.treatment}</td>
                          </tr>
                        );
                      } else if (reportType === 'patient-list' && 'firstName' in item) {
                        const patient = item as Patient;
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`${patient.firstName} ${patient.lastName}`}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(patient.dateOfBirth)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.gender}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.phone}</td>
                          </tr>
                        );
                      } else if (reportType === 'prescription' && 'medication' in item) {
                        const prescription = item as Prescription;
                        const patient = patients.find(p => p.id === prescription.patientId);
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prescription.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{prescription.medication}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prescription.dosage}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{prescription.frequency}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                prescription.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                prescription.status === 'dispensed' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {prescription.status}
                              </span>
                            </td>
                          </tr>
                        );
                      } else if (reportType === 'lab-results' && 'testName' in item) {
                        const labOrder = item as LabOrder;
                        const patient = patients.find(p => p.id === labOrder.patientId);
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{labOrder.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{labOrder.testName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                labOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                                labOrder.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {labOrder.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{labOrder.results || 'Pending'}</td>
                          </tr>
                        );
                      } else if (reportType === 'financial' && 'subtotal' in item) {
                        const bill = item as FinancialBill;
                        const patient = patients.find(p => p.id === bill.patientId);
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bill.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bill.subtotal.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bill.tax.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bill.total.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                                bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {bill.status}
                              </span>
                            </td>
                          </tr>
                        );
                      } else if (reportType === 'doctor-activity' && 'dateTime' in item) {
                        const appointment = item as Appointment;
                        const patient = patients.find(p => p.id === appointment.patientId);
                        return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(appointment.dateTime).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status}
                              </span>
                            </td>
                          </tr>
                        );
                      } else {
                        return (
                          <tr key={index}>
                            {Object.values(item).map((value, i) => (
                              <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        );
                      }
                    })
                  ) : (
                    <tr>
                      <td colSpan={viewingReport.columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                        No data available for the selected report and date range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={generateCSVReport}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV
              </button>
              <button
                onClick={generatePDFReport}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Report Generator
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-xl font-semibold text-gray-900">{reportData.totalPatients}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Appointments</p>
                  <p className="text-xl font-semibold text-gray-900">{reportData.totalAppointments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Medical Records</p>
                  <p className="text-xl font-semibold text-gray-900">{reportData.totalRecords}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <PieChart className="w-5 h-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Prescriptions</p>
                  <p className="text-xl font-semibold text-gray-900">{reportData.totalPrescriptions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Lab Orders</p>
                  <p className="text-xl font-semibold text-gray-900">{reportData.totalLabOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Bills</p>
                  <p className="text-xl font-semibold text-gray-900">{reportData.totalBills}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Generate Report</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      onClick={viewReport}
                      disabled={isLoading}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {isLoading ? 'Generating...' : 'View Report'}
                    </button>
                    <button
                      onClick={generateCSVReport}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </button>
                    <button
                      onClick={generatePDFReport}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h3>
              {recentReports.length > 0 ? (
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium text-gray-900">{report.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(report.date).toLocaleString()} • {reportType === report.type ? 'This report' : ''}
                        </p>
                      </div>
                      <button className="text-green-600 hover:text-green-800">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-center">No recent reports available. Generate a report to see it here.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}