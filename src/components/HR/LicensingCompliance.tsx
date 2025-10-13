import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Calendar,
  FileText
} from 'lucide-react';

interface StaffLicense {
  id: string;
  staffId: string;
  staffName: string;
  licenseType: string;
  licenseNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  daysToExpiry: number;
}

const LicensingCompliance: React.FC = () => {
  const [licenses, setLicenses] = useState<StaffLicense[]>([]);
  const [filteredLicenses, setFilteredLicenses] = useState<StaffLicense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLicenseType, setSelectedLicenseType] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState('all');

  const licenseTypes = [
    'Medical Council License',
    'Nursing Board License',
    'Pharmacy Board License',
    'Radiology License',
    'Laboratory License',
    'Administrative License'
  ];

  const statuses = ['active', 'expired', 'renewed'];

  useEffect(() => {
    // Simulate data loading - replace with actual API calls
    const mockLicenses: StaffLicense[] = [
      {
        id: '1',
        staffId: 'ASH-STF-001',
        staffName: 'Dr. Sarah Johnson',
        licenseType: 'Medical Council License',
        licenseNumber: 'MC-2023-001',
        issuingAuthority: 'Tanzania Medical Council',
        issueDate: '2023-01-15',
        expiryDate: '2025-01-15',
        status: 'active',
        daysToExpiry: 365
      },
      {
        id: '2',
        staffId: 'ASH-STF-002',
        staffName: 'Nurse Mary Mwalimu',
        licenseType: 'Nursing Board License',
        licenseNumber: 'NB-2022-045',
        issuingAuthority: 'Tanzania Nursing and Midwifery Council',
        issueDate: '2022-08-20',
        expiryDate: '2024-08-20',
        status: 'active',
        daysToExpiry: 45
      },
      {
        id: '3',
        staffId: 'ASH-STF-003',
        staffName: 'Dr. Ahmed Hassan',
        licenseType: 'Medical Council License',
        licenseNumber: 'MC-2023-012',
        issuingAuthority: 'Tanzania Medical Council',
        issueDate: '2023-03-10',
        expiryDate: '2024-03-10',
        status: 'active',
        daysToExpiry: 15
      },
      {
        id: '4',
        staffId: 'ASH-STF-004',
        staffName: 'Pharm. Grace Kimaro',
        licenseType: 'Pharmacy Board License',
        licenseNumber: 'PB-2022-078',
        issuingAuthority: 'Tanzania Pharmacy Council',
        issueDate: '2022-11-05',
        expiryDate: '2023-11-05',
        status: 'expired',
        daysToExpiry: -30
      }
    ];

    setLicenses(mockLicenses);
    setFilteredLicenses(mockLicenses);
  }, []);

  useEffect(() => {
    let filtered = licenses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(l => 
        l.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.licenseType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(l => l.status === selectedStatus);
    }

    // Filter by license type
    if (selectedLicenseType !== 'all') {
      filtered = filtered.filter(l => l.licenseType === selectedLicenseType);
    }

    // Filter by expiry
    if (expiryFilter !== 'all') {
      switch (expiryFilter) {
        case 'expired':
          filtered = filtered.filter(l => l.daysToExpiry < 0);
          break;
        case 'expiring_soon':
          filtered = filtered.filter(l => l.daysToExpiry >= 0 && l.daysToExpiry <= 30);
          break;
        case 'expiring_60_days':
          filtered = filtered.filter(l => l.daysToExpiry > 30 && l.daysToExpiry <= 60);
          break;
        case 'valid':
          filtered = filtered.filter(l => l.daysToExpiry > 60);
          break;
      }
    }

    setFilteredLicenses(filtered);
  }, [licenses, searchTerm, selectedStatus, selectedLicenseType, expiryFilter]);

  const getStatusColor = (status: string, daysToExpiry: number) => {
    if (status === 'expired' || daysToExpiry < 0) {
      return 'bg-red-100 text-red-800';
    } else if (daysToExpiry <= 30) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (daysToExpiry <= 60) {
      return 'bg-orange-100 text-orange-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  const getExpiryStatus = (daysToExpiry: number) => {
    if (daysToExpiry < 0) {
      return `Expired ${Math.abs(daysToExpiry)} days ago`;
    } else if (daysToExpiry === 0) {
      return 'Expires today';
    } else if (daysToExpiry <= 7) {
      return `Expires in ${daysToExpiry} days (URGENT)`;
    } else if (daysToExpiry <= 30) {
      return `Expires in ${daysToExpiry} days`;
    } else if (daysToExpiry <= 60) {
      return `Expires in ${daysToExpiry} days`;
    } else {
      return `Valid for ${daysToExpiry} days`;
    }
  };

  const getExpiryIcon = (daysToExpiry: number) => {
    if (daysToExpiry < 0) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    } else if (daysToExpiry <= 7) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    } else if (daysToExpiry <= 30) {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    } else if (daysToExpiry <= 60) {
      return <Clock className="h-4 w-4 text-orange-600" />;
    } else {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Staff ID', 'Staff Name', 'License Type', 'License Number', 'Issuing Authority', 'Issue Date', 'Expiry Date', 'Status', 'Days to Expiry'],
      ...filteredLicenses.map(l => [
        l.staffId,
        l.staffName,
        l.licenseType,
        l.licenseNumber,
        l.issuingAuthority,
        l.issueDate,
        l.expiryDate,
        l.status,
        l.daysToExpiry
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `licenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStats = () => {
    const total = licenses.length;
    const expired = licenses.filter(l => l.daysToExpiry < 0).length;
    const expiringSoon = licenses.filter(l => l.daysToExpiry >= 0 && l.daysToExpiry <= 30).length;
    const valid = licenses.filter(l => l.daysToExpiry > 60).length;

    return { total, expired, expiringSoon, valid };
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Licensing & Compliance</h1>
            <p className="text-orange-100">Monitor staff professional licenses and compliance</p>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Licenses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valid Licenses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.valid}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">{stats.expiringSoon}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search licenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>

          <select
            value={selectedLicenseType}
            onChange={(e) => setSelectedLicenseType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All License Types</option>
            {licenseTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={expiryFilter}
            onChange={(e) => setExpiryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Expiry</option>
            <option value="expired">Expired</option>
              <option value="expiring_soon">Expiring Soon (&le;30 days)</option>
            <option value="expiring_60_days">Expiring in 60 days</option>
              <option value="valid">Valid (&gt;60 days)</option>
          </select>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {filteredLicenses.length} licenses
            </span>
          </div>
        </div>
      </div>

      {/* Licenses Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff & License
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issuing Authority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLicenses.map((license) => (
                <tr key={license.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{license.staffName}</div>
                      <div className="text-sm text-gray-500">{license.staffId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{license.licenseType}</div>
                      <div className="text-sm text-gray-500">{license.licenseNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{license.issuingAuthority}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        Issued: {new Date(license.issueDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Expires: {new Date(license.expiryDate).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getExpiryIcon(license.daysToExpiry)}
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(license.status, license.daysToExpiry)}`}>
                          {license.status}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {getExpiryStatus(license.daysToExpiry)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-900">
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredLicenses.length === 0 && (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No licenses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default LicensingCompliance;
