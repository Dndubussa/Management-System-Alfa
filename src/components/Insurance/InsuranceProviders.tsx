import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Save, X, Building2 } from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { supabaseService } from '../../services/supabaseService';

interface InsuranceProvider {
  id: string;
  name: string;
  code: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  tariff_codes?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function InsuranceProviders() {
  const { patients } = useHospital();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProvider, setEditingProvider] = useState<InsuranceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Insurance providers data - fetched from Supabase
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);

  const [newProvider, setNewProvider] = useState<Omit<InsuranceProvider, 'id'>>({
    name: '',
    code: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    tariff_codes: []
  });

  // Load insurance providers on component mount
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getInsuranceProviders();
      setProviders(data);
    } catch (error) {
      console.error('Error loading insurance providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(provider => 
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProvider = async () => {
    if (newProvider.name && newProvider.code) {
      try {
        setSaving(true);
        const providerData = {
          name: newProvider.name,
          code: newProvider.code,
          contactPerson: newProvider.contact_person,
          phone: newProvider.phone,
          email: newProvider.email,
          address: newProvider.address,
          tariffCodes: newProvider.tariff_codes,
          isActive: true
        };
        
        await supabaseService.createInsuranceProvider(providerData);
        await loadProviders(); // Reload the list
        
        setNewProvider({
          name: '',
          code: '',
          contact_person: '',
          phone: '',
          email: '',
          address: '',
          tariff_codes: []
        });
        setIsAdding(false);
      } catch (error) {
        console.error('Error adding insurance provider:', error);
        alert('Failed to add insurance provider. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleUpdateProvider = async () => {
    if (editingProvider) {
      try {
        setSaving(true);
        const providerData = {
          name: editingProvider.name,
          code: editingProvider.code,
          contactPerson: editingProvider.contactPerson,
          phone: editingProvider.phone,
          email: editingProvider.email,
          address: editingProvider.address,
          tariffCodes: editingProvider.tariffCodes,
          isActive: true
        };
        
        await supabaseService.updateInsuranceProvider(editingProvider.id, providerData);
        await loadProviders(); // Reload the list
        setEditingProvider(null);
      } catch (error) {
        console.error('Error updating insurance provider:', error);
        alert('Failed to update insurance provider. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (confirm('Are you sure you want to delete this insurance provider?')) {
      try {
        setSaving(true);
        await supabaseService.deleteInsuranceProvider(id);
        await loadProviders(); // Reload the list
      } catch (error) {
        console.error('Error deleting insurance provider:', error);
        alert('Failed to delete insurance provider. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Insurance Providers</h1>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Provider
          </button>
        </div>
        <p className="text-gray-600 mt-1">
          Manage insurance providers and their tariff codes
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by provider name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Add Provider Form */}
      {isAdding && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Insurance Provider</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name</label>
              <input
                type="text"
                value={newProvider.name}
                onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter provider name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                value={newProvider.code}
                onChange={(e) => setNewProvider({...newProvider, code: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter provider code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={newProvider.contact_person || ''}
                onChange={(e) => setNewProvider({...newProvider, contact_person: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter contact person name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={newProvider.phone}
                onChange={(e) => setNewProvider({...newProvider, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={newProvider.email}
                onChange={(e) => setNewProvider({...newProvider, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={newProvider.address}
                onChange={(e) => setNewProvider({...newProvider, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter address"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleAddProvider}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Adding...' : 'Add Provider'}
            </button>
          </div>
        </div>
      )}

      {/* Providers List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tariff Codes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
                      <p className="text-gray-500">Loading insurance providers...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProviders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Building2 className="w-12 h-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Insurance Providers Found</h3>
                      <p className="text-gray-500 mb-2">
                        {searchTerm ? 'No providers match your search criteria.' : 'No insurance providers have been added yet.'}
                      </p>
                      <p className="text-sm text-gray-400">
                        Click "Add Provider" to create your first insurance provider.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProviders.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                    {editingProvider?.id === provider.id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editingProvider.name}
                            onChange={(e) => setEditingProvider({...editingProvider, name: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editingProvider.code}
                            onChange={(e) => setEditingProvider({...editingProvider, code: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editingProvider.contactPerson}
                            onChange={(e) => setEditingProvider({...editingProvider, contactPerson: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editingProvider.phone}
                            onChange={(e) => setEditingProvider({...editingProvider, phone: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editingProvider.tariffCodes.join(', ')}
                            onChange={(e) => setEditingProvider({...editingProvider, tariffCodes: e.target.value.split(',').map(code => code.trim())})}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingProvider(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleUpdateProvider}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{provider.code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{provider.contact_person || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{provider.phone || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {provider.tariff_codes ? provider.tariff_codes.join(', ') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingProvider(provider)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProvider(provider.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}