import React, { useState, useEffect } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Shield, 
  Eye, 
  FileText, 
  AlertTriangle, 
  Download, 
  Search,
  Calendar,
  User,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface AuditLog {
  id: string;
  tableName: string;
  recordId: string;
  operation: string;
  oldValues?: any;
  newValues?: any;
  userId?: string;
  userName?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: string;
  auditTimestamp?: string; // For function return values
  reason?: string;
  notes?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  department?: string;
  patientId?: string;
}

interface PatientAccessLog {
  id: string;
  patientId: string;
  patientName: string;
  accessedBy: string;
  accessedByName: string;
  accessedByRole: string;
  accessType: string;
  dataAccessed: string[];
  purpose?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp: string;
  durationSeconds?: number;
  notes?: string;
}

interface ComplianceViolation {
  violationType: string;
  severity: string;
  userName: string;
  userRole: string;
  timestamp: string;
  details: string;
  patientName?: string;
}

interface AuditStatistics {
  metricName: string;
  metricValue: number;
  description: string;
}

export function AuditTrailDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [patientAccessLogs, setPatientAccessLogs] = useState<PatientAccessLog[]>([]);
  const [complianceViolations, setComplianceViolations] = useState<ComplianceViolation[]>([]);
  const [auditStatistics, setAuditStatistics] = useState<AuditStatistics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user has audit access
  const hasAuditAccess = user?.role === 'admin' || user?.role === 'audit' || user?.role === 'compliance';

  useEffect(() => {
    if (hasAuditAccess) {
      loadAuditData();
    }
  }, [hasAuditAccess, dateRange]);

  const loadAuditData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load audit statistics
      const statsResponse = await fetch('/api/audit/statistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 })
      });
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setAuditStatistics(stats);
      }

      // Load compliance violations
      const violationsResponse = await fetch('/api/audit/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        })
      });
      
      if (violationsResponse.ok) {
        const violations = await violationsResponse.json();
        setComplianceViolations(violations);
      }

      // Load recent audit logs
      const logsResponse = await fetch('/api/audit/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          limit: 100
        })
      });
      
      if (logsResponse.ok) {
        const logs = await logsResponse.json();
        setAuditLogs(logs);
      }

      // Load patient access logs
      const accessResponse = await fetch('/api/audit/patient-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          limit: 100
        })
      });
      
      if (accessResponse.ok) {
        const accessLogs = await accessResponse.json();
        setPatientAccessLogs(accessLogs);
      }

    } catch (err) {
      console.error('Error loading audit data:', err);
      setError('Failed to load audit data');
    } finally {
      setLoading(false);
    }
  };

  const exportAuditTrail = async () => {
    try {
      const response = await fetch('/api/audit/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          auditType: 'ALL'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-trail-${dateRange.startDate}-to-${dateRange.endDate}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error exporting audit trail:', err);
      setError('Failed to export audit trail');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'INSERT': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'UPDATE': return <Activity className="w-4 h-4 text-blue-600" />;
      case 'DELETE': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'VIEW': return <Eye className="w-4 h-4 text-gray-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!hasAuditAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view audit trails.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-blue-600" />
                Audit Trail Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive audit logging and compliance monitoring
              </p>
            </div>
            <button
              onClick={exportAuditTrail}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Audit Trail
            </button>
          </div>
        </div>

        {/* Date Range and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: TrendingUp },
                { id: 'audit-logs', name: 'Audit Logs', icon: FileText },
                { id: 'patient-access', name: 'Patient Access', icon: Eye },
                { id: 'violations', name: 'Compliance Violations', icon: AlertTriangle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {auditStatistics.map((stat, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <Activity className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-500">
                                {stat.metricName}
                              </p>
                              <p className="text-2xl font-bold text-gray-900">
                                {stat.metricValue.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {auditLogs.slice(0, 10).map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              {getOperationIcon(log.operation)}
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {log.userName} ({log.userRole})
                                </p>
                                <p className="text-sm text-gray-500">
                                  {log.operation} on {log.tableName}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </p>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(log.severity)}`}>
                                {log.severity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Audit Logs Tab */}
                {activeTab === 'audit-logs' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Operation
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Table
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timestamp
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Severity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {auditLogs
                          .filter(log => 
                            searchTerm === '' || 
                            log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.operation.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getOperationIcon(log.operation)}
                                <span className="ml-2 text-sm font-medium text-gray-900">
                                  {log.operation}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{log.userName}</div>
                              <div className="text-sm text-gray-500">{log.userRole}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.tableName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(log.severity)}`}>
                                {log.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {log.reason || log.notes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Patient Access Tab */}
                {activeTab === 'patient-access' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Accessed By
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Access Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Purpose
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data Accessed
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timestamp
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {patientAccessLogs
                          .filter(log => 
                            searchTerm === '' || 
                            log.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.accessedByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.accessType.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {log.patientName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{log.accessedByName}</div>
                              <div className="text-sm text-gray-500">{log.accessedByRole}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {log.accessType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.purpose || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {log.dataAccessed.join(', ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Compliance Violations Tab */}
                {activeTab === 'violations' && (
                  <div className="space-y-4">
                    {complianceViolations.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Violations Found</h3>
                        <p className="text-gray-500">Great! No compliance violations detected in the selected period.</p>
                      </div>
                    ) : (
                      complianceViolations.map((violation, index) => (
                        <div key={index} className="border border-red-200 rounded-lg p-6 bg-red-50">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <AlertTriangle className="w-6 h-6 text-red-600 mt-1 mr-3" />
                              <div>
                                <h4 className="text-lg font-medium text-red-900">
                                  {violation.violationType}
                                </h4>
                                <p className="text-red-700 mt-1">{violation.details}</p>
                                <div className="mt-2 text-sm text-red-600">
                                  <p><strong>User:</strong> {violation.userName} ({violation.userRole})</p>
                                  {violation.patientName && (
                                    <p><strong>Patient:</strong> {violation.patientName}</p>
                                  )}
                                  <p><strong>Time:</strong> {new Date(violation.timestamp).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                              violation.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                              violation.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {violation.severity}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
